/**
 * Public URLs for this deployment, used by {@link usePageSeo} and page components.
 *
 * Why this file exists
 * --------------------
 * Social previews (Open Graph, Twitter Cards) and `<link rel="canonical">` must use
 * **absolute** URLs. Hard-coding the GitHub Pages origin in every page is error-prone;
 * centralizing it keeps `og:url`, canonical links, and in-app `Link` targets consistent.
 *
 * Keeping values in sync
 * -----------------------
 * - `PUBLIC_SITE_PATH` must equal Vite `base` in `vite.config.ts` (trailing slash rules:
 *   we use a path **without** a trailing slash here; URLs we build append `/segment`).
 * - `BrowserRouter` `basename` must match the same path so client routes and public URLs align.
 * - `index.html` may duplicate `og:image` / `twitter:image` for crawlers that never execute
 *   JS; if you change host or repo name, update both this module and `index.html`.
 *
 * Forking / custom domain
 * -----------------------
 * Replace `PUBLIC_SITE_ORIGIN` and `PUBLIC_SITE_PATH` (or introduce env-based config) when
 * deploying elsewhere; then rebuild so bundled strings and static HTML stay accurate.
 */

/** Scheme + host only (no path). Used to absolutize root-relative paths for OG tags. */
export const PUBLIC_SITE_ORIGIN = 'https://topkoong.github.io' as const;

/**
 * App mount path on the host (GitHub Pages project site = `/repo-name`).
 * Must match Vite `base` and the router basename.
 */
export const PUBLIC_SITE_PATH = '/fetch-the-standard-news' as const;

/** Origin + base path, no trailing slash. Use as prefix for canonical and `og:url` values. */
export const PUBLIC_SITE_URL = `${PUBLIC_SITE_ORIGIN}${PUBLIC_SITE_PATH}` as const;

/**
 * Default social preview image when a page does not pass a specific `image` to `usePageSeo`.
 * Points at `public/placeholder-news.jpg` (served at `${PUBLIC_SITE_URL}/placeholder-news.jpg`).
 */
export const DEFAULT_OG_IMAGE_URL = `${PUBLIC_SITE_URL}/placeholder-news.jpg` as const;
