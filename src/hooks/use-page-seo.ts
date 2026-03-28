import { DEFAULT_OG_IMAGE_URL, PUBLIC_SITE_ORIGIN } from '@constants/seo.constants';
import { useEffect } from 'preact/hooks';

export type PageOgType = 'website' | 'article';

export interface PageSeoConfig {
  title: string;
  description: string;
  /** Open Graph / social URL (often same as canonical). */
  url?: string;
  /** `<link rel="canonical">` — absolute URL. */
  canonicalUrl?: string;
  /** Absolute or site-root-relative image URL for og:image / twitter:image. */
  image?: string;
  ogType?: PageOgType;
}

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

function upsertMetaName(name: string, content: string) {
  let el = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

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
 * Turn app-relative paths (e.g. `/fetch-the-standard-news/...`) into absolute URLs for OG crawlers.
 */
export function absoluteUrlForOpenGraph(href: string): string {
  const t = href.trim();
  if (/^https?:\/\//i.test(t)) return t;
  const path = t.startsWith('/') ? t : `/${t}`;
  return `${PUBLIC_SITE_ORIGIN}${path}`;
}

/**
 * plan.md PR 16 — document title, description, canonical, og:* and twitter:* tags.
 * Creates missing `<meta>` nodes so SPA navigations still update head after first paint.
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

    const ogImage = image?.trim()
      ? absoluteUrlForOpenGraph(image.trim())
      : DEFAULT_OG_IMAGE_URL;
    upsertMetaProperty('og:image', ogImage);
    upsertMetaName('twitter:image', ogImage);
    upsertMetaName('twitter:card', image?.trim() ? 'summary_large_image' : 'summary');
  }, [canonicalUrl, description, image, ogType, title, url]);
}
