/**
 * Navigation configuration — the single source of truth for content categories.
 *
 * 👉 APPLY TEMPLATE: Change this array when a new game has different content categories.
 *
 * The `key` MUST be identical in THREE places (rule enforced across the codebase):
 *   1. Here — NAVIGATION_CONFIG[].key
 *   2. src/locales/en.json — nav.<key> (display label) + overview.<key> (list page meta)
 *   3. src/content/wiki/<locale>/<key>/ — MDX directory name
 *
 * Changing this one file automatically affects: nav menu, URL routes, sitemap,
 * content loading, and the sidebar.
 */

// Icons are referenced by string name; astro-icon resolves them from src/icons/.
// We avoid importing the icon component here so this file stays framework-agnostic
// and can be read by non-Astro tooling (scripts, tests).
export interface NavigationItem {
  /** Category slug. Must match `src/content/wiki/<locale>/<key>/` directory name. */
  key: string;
  /** URL path segment. Must be `/${key}`. */
  path: string;
  /** Icon name from src/icons/ (without extension). */
  icon: string;
  /** Whether this item owns an MDX article category and a generated list route. */
  isContentType: boolean;
  /** Single landing page backed only by index.mdx; no child article grid or dropdown. */
  singlePage?: boolean;
}

/** Menu order = array order — every consumer renders by physical position. */
export const NAVIGATION_CONFIG: NavigationItem[] = [
  { key: 'guides', path: '/guides', icon: 'lucide:book-open', isContentType: true },
  { key: 'controls', path: '/controls', icon: 'lucide:gamepad-2', isContentType: true },
  { key: 'combat', path: '/combat', icon: 'lucide:shield', isContentType: true },
  { key: 'codes', path: '/codes', icon: 'lucide:ticket', isContentType: true, singlePage: true },
];

/** Derived list of content type slugs (e.g. ['bosses', 'guides', 'items', 'codes']). */
export const CONTENT_TYPES: string[] = NAVIGATION_CONFIG.filter((n) => n.isContentType).map((n) => n.key);

/** Categories allowed on normal article frontmatter (single-page sections excluded). */
export const ARTICLE_CONTENT_TYPES: string[] = NAVIGATION_CONFIG
  .filter((n) => n.isContentType && !n.singlePage)
  .map((n) => n.key);
