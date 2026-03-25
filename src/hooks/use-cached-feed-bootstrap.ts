import { useEffect, useMemo, useState } from 'preact/hooks';
import { useQueryClient } from 'react-query';

export interface CachedImageRow {
  id: number;
  url: string;
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
    let cancelled = false;
    setReady(false);
    setImageRows(null);

    const run = async () => {
      const [postsMod, categoriesMod, imagesMod] = await Promise.all([
        isMobile
          ? import('@assets/cached/mobile-posts.json')
          : import('@assets/cached/posts.json'),
        import('@assets/cached/categories.json'),
        isMobile
          ? import('@assets/cached/mobile-images.json')
          : import('@assets/cached/images.json'),
      ]);
      if (cancelled) return;
      queryClient.setQueryData('allposts', postsMod.default);
      queryClient.setQueryData('allcategories', categoriesMod.default);
      setImageRows(imagesMod.default as CachedImageRow[]);
      setReady(true);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [isMobile, queryClient]);

  const imageUrlById = useMemo(() => {
    if (!imageRows) return new Map<number, string>();
    return new Map(imageRows.map((row) => [row.id, row.url]));
  }, [imageRows]);

  return { cacheReady: ready, imageUrlById };
}
