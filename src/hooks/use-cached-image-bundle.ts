import { useEffect, useMemo, useState } from 'preact/hooks';

export interface CachedImageRow {
  id: number;
  url: string;
}

/** Lazy-loads desktop or mobile image JSON so category pages avoid bundling both. */
export function useCachedImageBundle(isMobile: boolean) {
  const [rows, setRows] = useState<CachedImageRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    const load = isMobile
      ? import('@assets/cached/mobile-images.json')
      : import('@assets/cached/images.json');
    void load.then((mod) => {
      if (!cancelled) {
        setRows(mod.default as CachedImageRow[]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isMobile]);

  const imageUrlById = useMemo(() => {
    if (!rows) return new Map<number, string>();
    return new Map(rows.map((row) => [row.id, row.url]));
  }, [rows]);

  return { imagesReady: rows !== null, imageUrlById };
}
