import {
  buildFeaturedImageFallbackChain,
  placeholderNewsPublicPath,
} from '@utils/formatters';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';

/**
 * Cycles through {@link buildFeaturedImageFallbackChain} on `onError`, then
 * `placeholder-news.jpg`. Updates `currentTarget.src` synchronously so the next
 * candidate loads without waiting for React render.
 */
export function useFeaturedImageSrc(
  resolvedPrimary: string,
  localCandidates: readonly string[],
  resetKey: string | number,
  /** Invoked once when all candidates fail and the public placeholder is applied. */
  onFallbackToPlaceholder?: () => void,
) {
  const fallbackCbRef = useRef(onFallbackToPlaceholder);
  fallbackCbRef.current = onFallbackToPlaceholder;
  const chain = useMemo(
    () => buildFeaturedImageFallbackChain(resolvedPrimary, localCandidates),
    [resolvedPrimary, localCandidates],
  );

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [resetKey, resolvedPrimary, chain]);

  const src =
    chain.length > 0
      ? chain[Math.min(idx, chain.length - 1)]!
      : placeholderNewsPublicPath();

  const onError = useCallback(
    (event: { currentTarget: HTMLImageElement }) => {
      setIdx((current) => {
        const next = current + 1;
        if (next < chain.length) {
          const nextSrc = chain[next];
          if (nextSrc) event.currentTarget.src = nextSrc;
          return next;
        }
        event.currentTarget.src = placeholderNewsPublicPath();
        fallbackCbRef.current?.();
        return Math.max(0, chain.length - 1);
      });
    },
    [chain],
  );

  return { src, onError };
}
