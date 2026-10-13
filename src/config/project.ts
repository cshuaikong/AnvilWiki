/**
 * Project-level metadata — describes THIS REPOSITORY, not the demo game.
 *
 * Not part of the site config layer: game/site identity lives in site.ts,
 * navigation.ts, routing.ts and the locale JSON files. Nothing here needs to
 * change when you build a different wiki on top of this template.
 *
 * (The landing-page link constants that used to live here — landingLink,
 * zhLandingLink, landingLinkEnabled — were removed together with the project
 * landing page and the in-site handbook.)
 */

/**
 * Template version — keep in sync with package.json `version`.
 *
 * Single source of truth for the release checklist. tests/changelog.test.ts
 * pins it to package.json so a release that bumps one and forgets the other
 * goes red instead of shipping a lie.
 *
 * (Relocated here from the deleted src/config/landing-shared.ts when the
 * project landing page + handbook were removed.)
 */
export const PROJECT_VERSION = '2.37.0';
