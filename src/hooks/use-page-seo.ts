/**
 * Client-side document head management for a Preact SPA (plan.md PR 16).
 *
 * Problem
 * -------
 * `index.html` ships static `<meta>` tags, but after client navigation the document title
 * and social metadata must reflect the **current route**. Crawlers that execute JS will
 * read the DOM we mutate here; static-only crawlers rely on the defaults in `index.html`.
 *
 * Implementation strategy
 * ------------------------
 * We **upsert** nodes (`<meta>`, `<link rel="canonical">`) instead of only updating tags
 * that exist in `index.html`. Reason: many OG/Twitter properties are absent from the
 * initial HTML; creating them on first visit ensures subsequent SPA navigations can update
 * `content` reliably.
 *
 * Concurrency / cleanup
 * ---------------------
 * We do not remove tags on unmount. The next page’s `usePageSeo` overwrites the same
 * selectors, which is correct for a single-page shell. If you later add true SSR or
 * per-layout head trees, revisit this assumption.
 */

import { DEFAULT_OG_IMAGE_URL, PUBLIC_SITE_ORIGIN } from '@constants/seo.constants';
import { useEffect } from 'preact/hooks';

/** Open Graph type; `article` is appropriate for story reader URLs with a resolved post. */
export type PageOgType = 'website' | 'article';

export interface PageSeoConfig {
  /** Shown in `<title>`, `og:title`, and `twitter:title`. */
  title: string;
  /** Plain-text summary for `<meta name="description">`, `og:description`, `twitter:description`. */
  description: string;
  /**
   * Absolute page URL for `og:url`. Often identical to `canonicalUrl`.
   * Omit only if you intentionally want to avoid setting Open Graph URL (rare).
   */
  url?: string;
  /**
   * Sets `<link rel="canonical" href="...">`. Prefer absolute URLs matching the public site.
   * If omitted but `url` is set, `url` is used as the canonical href.
   */
  canonicalUrl?: string;
  /**
   * Hero or lead image for `og:image` / `twitter:image`. May be:
   * - absolute (`https://...`), or
   * - root-relative (`/fetch-the-standard-news/...` or `/path`) — passed through
   *   {@link absoluteUrlForOpenGraph}.
   * Empty/whitespace falls back to {@link DEFAULT_OG_IMAGE_URL}.
   */
  image?: string;
  /** Drives `og:type`; use `article` when the URL represents a single editorial story. */
  ogType?: PageOgType;
}

/**
 * Find or create `<meta property="...">` and set `content`.
 * Property form is required for Open Graph (`og:*`) per the OG protocol.
 */
function upsertMetaProperty(property: string, content: string) {
  let el = document.head.querySelector(
    `meta[property="${property}"]`,
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Find or create `<meta name="...">` and set `content`.
 * Twitter Cards still use `name` attributes (e.g. `twitter:title`), not `property`.
 */
function upsertMetaName(name: string, content: string) {
  let el = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Single canonical link; upsert so SPA route changes replace the previous href. */
function setCanonicalHref(href: string) {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Normalizes image URLs for Open Graph consumers, which expect absolute URLs.
 *
 * - Already-absolute strings are returned unchanged (e.g. CDN image URLs).
 * - Root-relative paths are prefixed with {@link PUBLIC_SITE_ORIGIN} only — they must
 *   already include the repo base path if the asset is served under GitHub Pages project
 *   sites (e.g. paths starting with `/fetch-the-standard-news/...`).
 */
export function absoluteUrlForOpenGraph(href: string): string {
  const t = href.trim();
  if (/^https?:\/\//i.test(t)) return t;
  const path = t.startsWith('/') ? t : `/${t}`;
  return `${PUBLIC_SITE_ORIGIN}${path}`;
}

/**
 * Applies SEO metadata for the current screen. Call at the top of each routed page component.
 *
 * Side effects (runs in `useEffect` after paint)
 * ---------------------------------------------
 * - `document.title`
 * - description + Open Graph + Twitter meta tags
 * - optional canonical link
 * - `og:image` / `twitter:image`: either from `image` or {@link DEFAULT_OG_IMAGE_URL}
 * - `twitter:card`: `summary_large_image` when a non-empty `image` is provided, else `summary`
 *
 * @param config - Fields should be stable or correctly keyed; the effect re-runs when any
 *   dependency changes so navigations within the app refresh head tags.
 */
export function usePageSeo({
  title,
  description,
  url,
  canonicalUrl,
  image,
  ogType = 'website',
}: PageSeoConfig) {
  useEffect(() => {
    document.title = title;
    upsertMetaName('description', description);
    upsertMetaProperty('og:title', title);
    upsertMetaProperty('og:description', description);
    upsertMetaName('twitter:title', title);
    upsertMetaName('twitter:description', description);
    upsertMetaProperty('og:type', ogType);

    if (url) {
      upsertMetaProperty('og:url', url);
    }

    const canonical = canonicalUrl ?? url;
    if (canonical) {
      setCanonicalHref(canonical);
    }

    const trimmedImage = image?.trim() ?? '';
    const ogImage = trimmedImage
      ? absoluteUrlForOpenGraph(trimmedImage)
      : DEFAULT_OG_IMAGE_URL;
    upsertMetaProperty('og:image', ogImage);
    upsertMetaName('twitter:image', ogImage);
    upsertMetaName('twitter:card', trimmedImage ? 'summary_large_image' : 'summary');
  }, [canonicalUrl, description, image, ogType, title, url]);
}
