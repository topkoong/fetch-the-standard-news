const STANDARD_ORIGIN = 'https://thestandard.co';

const PLACEHOLDER_FILE = 'placeholder-news.jpg';

/** Public placeholder path (honours Vite `base`, e.g. GitHub Pages). */
export function placeholderNewsPublicPath(): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base.replace(/\/?$/, '/')}${PLACEHOLDER_FILE}`;
}

/**
 * Normalises featured-image URLs from The Standard / WordPress.
 * Relative paths become absolute on thestandard.co; query strings are preserved.
 */
export function resolveImageUrl(rawUrl: string): string {
  const trimmed = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  if (!trimmed) {
    return placeholderNewsPublicPath();
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  const appBase = import.meta.env.BASE_URL ?? '/';
  if (appBase !== '/' && appBase !== './') {
    const prefix = appBase.endsWith('/') ? appBase : `${appBase}/`;
    if (trimmed.startsWith(prefix) || trimmed.startsWith(appBase.replace(/\/$/, ''))) {
      return trimmed;
    }
  }
  const relativeForApp = trimmed.replace(/^\/+/, '');
  if (relativeForApp.startsWith('cached-media/')) {
    const base = import.meta.env.BASE_URL ?? '/';
    return `${base.replace(/\/?$/, '/')}${relativeForApp}`;
  }
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${STANDARD_ORIGIN}${path}`;
}

/** Use on `<img onError={…}>` so broken remotes fall back to `placeholder-news.jpg`. */
export function handleNewsImageLoadError(event: {
  currentTarget: HTMLImageElement;
}): void {
  event.currentTarget.src = placeholderNewsPublicPath();
}
