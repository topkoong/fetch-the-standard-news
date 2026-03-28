/** GitHub Pages host + repo path (must match `vite.config` `base` and `BrowserRouter` basename). */
export const PUBLIC_SITE_ORIGIN = 'https://topkoong.github.io' as const;
export const PUBLIC_SITE_PATH = '/fetch-the-standard-news' as const;
export const PUBLIC_SITE_URL = `${PUBLIC_SITE_ORIGIN}${PUBLIC_SITE_PATH}` as const;

/** Fallback when a page has no story-specific image (og:image / twitter:image). */
export const DEFAULT_OG_IMAGE_URL = `${PUBLIC_SITE_URL}/placeholder-news.jpg` as const;
