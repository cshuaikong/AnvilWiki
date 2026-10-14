import { describe, it, expect } from 'vitest';
import { defaultLocale, locales, type Locale } from '~/i18n/routing';
import {
  localizePath,
  listPath,
  detailPath,
  homeUrl,
  slugifyTag,
  absoluteUrl,
  languageAlternates,
} from '~/lib/url';

/**
 * The site's second locale, when it has one.
 *
 * Every "a non-default locale gets a URL prefix" assertion needs a real
 * non-default locale to talk about. This file used to hardcode `'ja'`, so a fork
 * that deliberately ships ONE language — a config `apply-template` explicitly
 * offers — failed 14 type errors here for a choice it was entitled to make.
 * Resolving the code from `routing.ts` keeps full coverage on a multi-locale
 * site and skips those cases cleanly on a single-locale one.
 *
 * Locale-count-agnostic tests below deliberately do NOT skip, so a single-locale
 * site still exercises the default-locale path of every helper.
 */
const second: Locale | undefined = locales.find((l) => l !== defaultLocale);

describe('url helpers', () => {
  describe('localizePath', () => {
    it('returns the path unchanged for the default locale', () => {
      expect(localizePath('/bosses', defaultLocale)).toBe('/bosses/');
      expect(localizePath('/bosses/emberfang', defaultLocale)).toBe('/bosses/emberfang/');
    });

    it.skipIf(!second)('prepends the locale prefix for non-default locales', () => {
      expect(localizePath('/bosses', second!)).toBe(`/${second}/bosses/`);
      expect(localizePath('/bosses/emberfang', second!)).toBe(`/${second}/bosses/emberfang/`);
    });

    it('ensures leading slash on input without one', () => {
      expect(localizePath('about', defaultLocale)).toBe('/about/');
    });

    it.skipIf(!second)('ensures the leading slash for a prefixed locale too', () => {
      expect(localizePath('about', second!)).toBe(`/${second}/about/`);
    });
  });

  describe('homeUrl', () => {
    it('returns / for the default locale', () => {
      expect(homeUrl(defaultLocale)).toBe('/');
    });

    it.skipIf(!second)('returns the prefixed root for a non-default locale', () => {
      expect(homeUrl(second!)).toBe(`/${second}/`);
    });
  });

  describe('listPath', () => {
    it('builds the correct list URL for the default locale', () => {
      expect(listPath('bosses', defaultLocale)).toBe('/bosses/');
      expect(listPath('codes', defaultLocale)).toBe('/codes/');
    });

    it.skipIf(!second)('builds the correct prefixed list URL for a non-default locale', () => {
      expect(listPath('bosses', second!)).toBe(`/${second}/bosses/`);
    });
  });

  describe('detailPath', () => {
    it('builds the correct article URL for the default locale', () => {
      expect(detailPath('bosses', 'emberfang', defaultLocale)).toBe('/bosses/emberfang/');
    });

    it.skipIf(!second)('builds the correct prefixed article URL for a non-default locale', () => {
      expect(detailPath('bosses', 'emberfang', second!)).toBe(`/${second}/bosses/emberfang/`);
    });

    it('handles nested slugs', () => {
      expect(detailPath('guides', 'early-game/beginner', defaultLocale)).toBe(
        '/guides/early-game/beginner/',
      );
    });

    it.skipIf(!second)('handles nested slugs for a prefixed locale', () => {
      expect(detailPath('guides', 'early-game/beginner', second!)).toBe(
        `/${second}/guides/early-game/beginner/`,
      );
    });
  });
});

describe('slugifyTag (ASCII slug / raw fallback for non-ASCII)', () => {
  it('slugifies ASCII tags to lowercase kebab-case', () => {
    expect(slugifyTag('Boss Guide')).toBe('boss-guide');
    expect(slugifyTag('Fire_Warden')).toBe('fire-warden');
  });

  it('returns CJK tags raw instead of collapsing to empty', () => {
    // Folding a CJK tag leaves characters outside [a-z0-9-], so it takes the
    // raw path. Astro writes params to disk verbatim, so the built directory
    // is the raw tag and browser-encoded links (/tags/%E7%84%B0…) resolve to
    // it — while a partial ASCII strip would have collapsed this to ''.
    const zh = slugifyTag('焰牙');
    expect(zh).toBe('焰牙');
    expect(zh).not.toBe('');
  });

  it('returns mixed ASCII+CJK tags raw — a partial strip would collide them', () => {
    // Stripping only the non-ASCII would leave '焰牙 攻略' → '-' (truthy, so
    // no fallback) and BOTH 'Roblox 焰牙' and 'Roblox 攻略' → 'roblox-':
    // distinct tags crowding onto one /tags/ page. Any tag still holding a
    // non-[a-z0-9-] character after folding goes raw wholesale instead.
    expect(slugifyTag('焰牙 攻略')).toBe('焰牙 攻略');
    expect(slugifyTag('Roblox 焰牙')).not.toBe(slugifyTag('Roblox 攻略'));
    // The raw path is idempotent, like the ASCII one.
    expect(slugifyTag(slugifyTag('焰牙 攻略'))).toBe(slugifyTag('焰牙 攻略'));
  });

  it('keeps two different CJK tags distinguishable', () => {
    expect(slugifyTag('焰牙')).not.toBe(slugifyTag('风暴召唤者'));
  });

  it('keeps pure-symbol tags non-empty', () => {
    // Whatever the exact characters, the slug is stable and distinct from ''
    // — the property the raw path exists to guarantee.
    expect(slugifyTag('!!!')).toBe('!!!');
    expect(slugifyTag('  ???  ')).toBe('???');
  });
});

describe('absoluteUrl', () => {
  it('prefixes siteUrl and applies the default-locale rules', () => {
    expect(absoluteUrl('/bosses', defaultLocale)).toMatch(/^https:\/\/[^/]+\/bosses\/$/);
  });

  it.skipIf(!second)('prefixes siteUrl and applies the locale prefix rules for a prefix locale', () => {
    expect(absoluteUrl('/bosses', second!)).toMatch(
      new RegExp(`^https://[^/]+/${second}/bosses/$`),
    );
    expect(absoluteUrl('/', second!)).toMatch(new RegExp(`^https://[^/]+/${second}/$`));
  });
});

describe('languageAlternates', () => {
  it.skipIf(!second)('builds absolute hreflang entries for exactly the given locales', () => {
    const alts = languageAlternates((loc) => detailPath('bosses', 'x', loc), [
      defaultLocale,
      second!,
    ]);
    expect(alts).toHaveLength(2);
    expect(alts[0]).toEqual({
      hreflang: defaultLocale,
      href: expect.stringMatching(/\/bosses\/x\/$/),
    });
    expect(alts[1]).toEqual({
      hreflang: second,
      href: expect.stringMatching(new RegExp(`/${second}/bosses/x/$`)),
    });
  });

  it('never emits x-default (BaseLayout derives it separately)', () => {
    const alts = languageAlternates((loc) => listPath('guides', loc), locales);
    expect(alts.some((a) => a.hreflang === 'x-default')).toBe(false);
  });

  it('honors a reduced locale list (single-language article)', () => {
    const alts = languageAlternates((loc) => detailPath('bosses', 'x', loc), [defaultLocale]);
    expect(alts).toHaveLength(1);
    expect(alts[0].hreflang).toBe(defaultLocale);
    expect(alts[0].href).toMatch(/\/bosses\/x\/$/);
  });

  it('shares one domain-assembly with absoluteUrl — same path+locale, identical href', () => {
    // languageAlternates receives already-localized paths (its buildPath
    // returns localizePath output) while absoluteUrl localizes internally;
    // both must join the domain through the same single helper so the
    // `${siteUrl}${path}` construction can't drift between them.
    const alts = languageAlternates((loc) => localizePath('/faq', loc), locales);
    expect(alts.map((a) => a.href)).toEqual(locales.map((l) => absoluteUrl('/faq', l)));
  });
});
