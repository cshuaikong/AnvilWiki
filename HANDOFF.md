# HANDOFF — 栏目页 `index.mdx` 特性（未提交）

> 给下一位接手者（Codex）。本文档描述**已实现且已验证、但尚未提交**的一批改动。
> 交接完成后可删除本文件。

---

## 一句话

每个分类目录可放一个 `index.mdx`，其正文渲染在该栏目页的**卡片网格上方**。
由 `glob` loader 在集合层排除，因此它**不是文章** —— 不产生 `/bosses/index/` URL，不进
recent / RSS / llms.txt / 标签页 / 相关文章，消费文章的 17 处调用点**一处未改**。

---

## 仓库现状

| | |
|---|---|
| 站点 | Plane Crazy Wiki · `planecrazy-game.wiki` |
| 语言 | 单语言 `en` |
| 栏目 | `bosses` · `guides` · `items` · `tier-list` · `characters` |
| HEAD | `35c6492`（工作区另有本特性的改动，见下） |
| 测试套件 | 18 个（`pnpm test` 全过） |
| 构建产物 | 20 页 · sitemap 19 条 |
| 门禁 | 八道全绿（lint / typecheck / test / check-config / build / check-content / check-links / check-i18n） |

---

## 核心机制（请勿"优化"掉）

`src/content.config.ts`：

```ts
const wiki = defineCollection({
  // 结尾 /index 在这里被排除 —— 单点定义
  loader: glob({ pattern: ['**/*.mdx', '!**/index.mdx'], base: './src/content/wiki' }),
  schema: /* 原样未动 */,
});

const categoryIndex = defineCollection({
  loader: glob({ pattern: '**/index.mdx', base: './src/content/wiki' }),
  schema: z.object({ draft: …, lastModified: … }),
});

export const collections = { wiki, categoryIndex };
```

**为什么这样做**：`src/` 里 `getCollection('wiki')` 有 **17 处**调用
（`src/i18n/content.ts` 11 处 + `rss.xml.ts` / `llms.txt.ts` / 两个 `[...slug].astro` /
两个 `tags/[tag].astro`）。在 loader 层排除 = 单点定义，这 17 处全部自动正确。
若改成「给 landing 文章加 `pinned` 字段、再在 17 处过滤」，就是典型打地鼠：漏一处，
栏目页正文就会从 recent / RSS / 标签页漏出去。

**没有"模式开关"**：`list` = 没有 `index.mdx`；`hub` = 有。一条渲染路径。
删除文件即回到纯列表，无需改配置。

---

## 铁律：两侧必须同真相（最容易改坏的地方）

「某栏目 × 某语言**有没有内容**」这个判断有**两份独立实现**，必须保持一致：

| 侧 | 位置 | 消费方 |
|---|---|---|
| 页面 | `src/i18n/content.ts` → `hasLandingProse()` | `getCategoryIndex` · `localesWithCategoryIndex` · `localesForCategory` |
| sitemap | `astro.config.ts` → `buildLastmodMap()` 的 `index.mdx` 分支 | `categoryCoverage`（→ lastmod / 空分类排除 / hreflang） |

两边的判定**都是**「去掉 frontmatter 与 MDX 注释后，正文是否非空」：

- ✅ 正文非空 → 该 (栏目 × 语言) 被视为**有内容**：栏目页不 noindex、进 sitemap、参与 hreflang
- ❌ 正文为空（或只有注释）→ 视为**无内容**：栏目页 noindex、被移出 sitemap

**两侧不一致 = 页面 `<head>` 与 sitemap 的 hreflang 自相矛盾**（Google 会丢弃冲突簇）。
`sitemap` 侧无法 import `astro:content`（config 期），所以那段 strip 是**有意重复**的，
注释里已互相点名。

---

## 三个不明显的坑（均已踩过并修好）

**1. id 形状不是你想的那样**

glob loader 的默认 `generateId` 会**把结尾的 `/index` 折叠掉**：

```
src/content/wiki/en/bosses/index.mdx   →   id = "en/bosses"      ← 不是 "en/bosses/index"
```

代码用 `CATEGORY_INDEX_ID_RE = /^([^/]+)\/([^/]+)(?:\/index)?$/` 同时兼容两种形态。
若匹配失败，症状是 `hasIndex` 恒为 false、页面静默退回纯列表（**不报错**）。

**2. 空 stub 绝不能算"有内容"**

`apply-template` 生成的 stub **只有注释、渲染不出任何东西**。
若判定改成"文件存在即算"，会立刻：
- 关掉空栏目页的 `noindex`
- 把空栏目塞回 sitemap

这正是 noindex 规则要防的 thin-content 收录事故（仓库记录里 `/starships` 真实发生过）。
所以 stub 是**故意为空**的 —— 「index 默认是列表页」必须字面成立。

**3. Astro 缓存 + 运行中的 dev server（曾经把 build 搞崩）**

改 `content.config.ts` 或内容层后，`.astro/` 与 `node_modules/.astro/data-store.json`
可能是旧的；**若此时有 `astro dev` 在跑，它会持续把旧内容写回缓存**，导致 `astro build`
读到已删除的文件而整体失败。症状：`ImageNotFound`、幽灵条目、页面数骤降。

处理顺序：

```
1. 停掉 astro dev
2. 删 .astro / node_modules/.astro / node_modules/.vite
3. pnpm build
```

---

## 已验证（请勿重复劳动）

三场景，**页面侧与 sitemap 侧都实测核对过**：

| 场景 | 页面侧（robots） | sitemap 侧 |
|---|---|---|
| 有文章 + 空 stub（当前真实状态） | 5 个栏目**全部可收录** | 5 个**全部在内** |
| 0 文章 + 空 stub | **全部 noindex** | **全部不在** |
| 0 文章 + 仅 `bosses` 有正文 | `/bosses/` 可收录，其余 noindex | `/bosses/` 在内，其余不在 |

其他口径：

- `dist` **20 页不变**（特性未增删任何 URL）
- **不存在** `/bosses/index/` 之类 URL
- sitemap **19 条、无重复**
- 栏目页 `lastmod`：`index.mdx` 未写 `lastModified` 时**仍取该栏目最新文章日期**（不覆盖）
- 八道门禁全绿

验证用的临时脚本可参考（已用完可删）：
`%TEMP%\aw-check-sitemap.mjs`、`aw-draft-scaffolds.mjs`、`aw-prose-toggle.mjs`

---

## 改动清单（12 改 + 6 增，`+322 / −57`）

```
M  src/content.config.ts                     新增 categoryIndex + wiki loader 排除
M  src/components/article/ListPage.astro     拆出网格 + 加 <slot/>
A  src/components/article/CategoryGrid.astro 卡片网格（可独立 import，entries 可省）
M  src/i18n/content.ts                       getCategoryIndex / hasLandingProse / localesWithCategoryIndex
M  src/lib/content.ts                        转出两个新 API
M  src/pages/[...slug].astro                 默认语言路由接入 index 正文
M  src/pages/[locale]/[...slug].astro        非默认语言路由同上
M  astro.config.ts                           sitemap 三处联动（lastmod / 覆盖 / hreflang）
M  scripts/apply-template.ts                 建栏目时生成 index.mdx stub
M  scripts/lib/apply-template-i18n.ts        输出文案改为「每栏目 2 个文件」
M  tests/apply-template.test.ts              跟随该文案契约（singular/plural 断言）
M  docs/content-format.md                    新增「栏目页正文：index.mdx」节（作者视角）
M  docs/apply-template.md                    CLI 输出行为表更新
A  src/content/wiki/en/{bosses,guides,items,tier-list,characters}/index.mdx   默认空 stub
```

---

## 明确未做 / 开放项

1. **未提交** —— 全部改动仍在工作区。
2. **多语言分支无真实数据走通**：代码路径是 locale 通用的
   （`src/content/wiki/<locale>/<category>/index.mdx` → `/<locale>/<category>/`），
   两条路由都改了；但本站是单语言 `en`，`/ja/` 那条路**没有被实际数据验证过**。
   若以后加语言，务必重跑上面那张三场景表。
3. `src/components/article/ArticleGallery.astro:75` 有一处**既有**的 HTML 注释泄漏
   （`<!-- -->` 会被原样输出到页面）。与本特性无关，**未改动**。
4. 5 个 `index.mdx` 目前渲染为空 —— **这是设计，不是 bug**。判断"生效"的方法是往里写正文，
   而不是看文件是否存在。

---

## 若要继续改，先读这两处

- `docs/content-format.md` → 「栏目页正文：`index.mdx`」节（作者视角的完整约定）
- `docs/apply-template.md` 第 41 行（CLI 会为每个栏目建 2 个文件：1 篇文章 + 1 个骨架）
