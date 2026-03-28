import desktopImagesUrl from '@assets/cached/images.json?url';
import mobileImagesUrl from '@assets/cached/mobile-images.json?url';
import { resolveImageUrl } from '@utils/formatters';
import { useEffect, useMemo, useState } from 'preact/hooks';

export interface CachedImageRow {
  id: number;
  url: string;
}

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Failed to load cache asset: ${url}`);
  }
  return (await response.json()) as T;
}

/** Lazy-loads desktop or mobile image JSON so category pages avoid bundling both. */
export function useCachedImageBundle(isMobile: boolean) {
  const [rows, setRows] = useState<CachedImageRow[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setRows(null);
    const url = isMobile ? mobileImagesUrl : desktopImagesUrl;
    void fetchJson<CachedImageRow[]>(url, controller.signal)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch(() => {
        if (!cancelled && !controller.signal.aborted) setRows([]);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isMobile]);

  const imageUrlById = useMemo(() => {
    if (!rows) return new Map<number, string>();
    return new Map(rows.map((row) => [row.id, resolveImageUrl(row.url)]));
  }, [rows]);

  return { imagesReady: rows !== null, imageUrlById };
}
