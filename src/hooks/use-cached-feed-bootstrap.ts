import categoriesUrl from '@assets/cached/categories.json?url';
import desktopImagesUrl from '@assets/cached/images.json?url';
import mobileImagesUrl from '@assets/cached/mobile-images.json?url';
import mobilePostsUrl from '@assets/cached/mobile-posts.json?url';
import desktopPostsUrl from '@assets/cached/posts.json?url';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { useQueryClient } from 'react-query';
import type { WpCategory, WpPost } from 'types/wp-api';

export interface CachedImageRow {
  id: number;
  url: string;
}

function resolveImageUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base}${url.replace(/^\/+/, '')}`;
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Failed to load cache asset: ${url}`);
  }
  return (await response.json()) as T;
}

/**
 * Code-splits large cached JSON into async chunks, then hydrates React Query + image map.
 * Re-runs when `isMobile` changes so the correct posts/images bundle is used.
 */
export function useCachedFeedBootstrap(isMobile: boolean) {
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [imageRows, setImageRows] = useState<CachedImageRow[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setReady(false);
    setImageRows(null);

    const run = async () => {
      try {
        const postsUrl = isMobile ? mobilePostsUrl : desktopPostsUrl;
        const imagesUrl = isMobile ? mobileImagesUrl : desktopImagesUrl;
        const [postsData, categoriesData, imagesData] = await Promise.all([
          fetchJson<WpPost[]>(postsUrl, controller.signal),
          fetchJson<WpCategory[]>(categoriesUrl, controller.signal),
          fetchJson<CachedImageRow[]>(imagesUrl, controller.signal),
        ]);
        if (cancelled) return;
        queryClient.setQueryData('allposts', postsData);
        queryClient.setQueryData('allcategories', categoriesData);
        setImageRows(imagesData);
        setReady(true);
      } catch {
        if (cancelled || controller.signal.aborted) return;
        setImageRows([]);
        setReady(true);
      }
    };

    void run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isMobile, queryClient]);

  const imageUrlById = useMemo(() => {
    if (!imageRows) return new Map<number, string>();
    return new Map(imageRows.map((row) => [row.id, resolveImageUrl(row.url)]));
  }, [imageRows]);

  return { cacheReady: ready, imageUrlById };
}
