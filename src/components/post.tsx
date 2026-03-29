import placeholderImage from '@assets/images/placeholder.png';
import {
  NEWS_CARD_ARTICLE_CLASS,
  NEWS_CARD_READ_NOW_BUTTON_CLASS,
  NEWS_CARD_READ_NOW_LABEL,
  NEWS_CARD_SECONDARY_FOOTER_LINK_CLASS,
  ROUTE_PATH_NEWS_DESK_FALLBACK,
  ROUTE_STATE_NEWS_DESK_CATEGORY,
} from '@constants/index';
import { useFeaturedImageSrc } from '@hooks/use-featured-image-src';
import useIntersectionObserver from '@hooks/use-intersection-observer';
import {
  decodeHtmlEntities,
  isStandardPublisherImageUrl,
  publisherImageReferrerProps,
} from '@utils/formatters';
import { Fragment } from 'preact';
import { memo } from 'preact/compat';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Link } from 'react-router-dom';
import type { WpRenderedContent, WpRenderedText } from 'types/wp-api';

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

interface PostProps {
  post: {
    id: number;
    title?: WpRenderedText;
    excerpt?: WpRenderedContent;
    link?: string;
    imageUrl?: string;
    featured_media?: number;
  };
  /** When set, non-first groups use a blur placeholder until the card scrolls into view. */
  group?: number;
}

function Post({ post, group }: PostProps) {
  const ref = useRef<HTMLImageElement | null>(null);
  const entry = useIntersectionObserver(ref, {});
  const isVisible = !!entry?.isIntersecting;
  const titlePlain =
    decodeHtmlEntities(stripHtml(post?.title?.rendered ?? '')) || 'Article';
  const excerptPlain = decodeHtmlEntities(
    stripHtml(post?.excerpt?.rendered ?? ''),
  ).trim();
  const usePlaceholder = group !== undefined && group !== 0 && !isVisible;
  const [showImageFallbackNote, setShowImageFallbackNote] = useState(false);
  const baseUrl = import.meta.env.BASE_URL ?? '/';

  const localCandidates = useMemo(() => {
    const mediaId = post.featured_media;
    if (!mediaId) return [];
    const primary = post.imageUrl ?? '';
    if (isStandardPublisherImageUrl(primary)) return [];
    const prefix = `${baseUrl}cached-media/${mediaId}`;
    return [
      `${prefix}.jpg`,
      `${prefix}.jpeg`,
      `${prefix}.png`,
      `${prefix}.webp`,
      `${prefix}.avif`,
    ];
  }, [baseUrl, post.featured_media, post.imageUrl]);

  const onDeckPlaceholder = useCallback(() => setShowImageFallbackNote(true), []);

  const { src: remoteSrc, onError: onRemoteImageError } = useFeaturedImageSrc(
    post.imageUrl ?? '',
    localCandidates,
    post.id,
    onDeckPlaceholder,
  );

  useEffect(() => {
    setShowImageFallbackNote(false);
  }, [post.id, post.imageUrl]);

  const resolvedSrc = usePlaceholder ? placeholderImage : remoteSrc;

  return (
    <li className='h-full list-none'>
      <article className={`${NEWS_CARD_ARTICLE_CLASS} min-h-0`}>
        <div className='relative aspect-[16/10] w-full min-h-0 overflow-hidden bg-neutral-100'>
          <img
            ref={ref}
            className={`h-full w-full object-cover transition-all duration-500 ease-out ${
              usePlaceholder
                ? 'scale-105 blur-md grayscale'
                : 'scale-100 blur-0 grayscale-0'
            }`}
            src={resolvedSrc}
            alt={titlePlain}
            loading='lazy'
            decoding='async'
            {...publisherImageReferrerProps}
            onError={(event) => {
              if (usePlaceholder) return;
              onRemoteImageError(event);
            }}
          />
        </div>
        <div className='flex min-h-0 flex-1 flex-col gap-2 p-4 sm:p-5 md:p-6'>
          <header>
            <h2 className='line-clamp-3 text-lg font-bold leading-snug text-gray-900 sm:text-xl'>
              {titlePlain}
            </h2>
          </header>
          {showImageFallbackNote ? (
            <p className='text-xs leading-snug text-neutral-500'>
              Preview image unavailable from source right now. You can still open the full
              story.
            </p>
          ) : null}
          <p className='line-clamp-3 text-sm leading-relaxed text-neutral-600'>
            {excerptPlain ||
              'Read now for our layout; use the publisher link when you need the source site.'}
          </p>
          <div className='mt-auto flex flex-col items-center gap-2 pt-2 text-center'>
            {post.link ? (
              <>
                <Link
                  to={`/read/${post.id}`}
                  className={`${NEWS_CARD_READ_NOW_BUTTON_CLASS} mx-auto w-full max-w-xs`}
                  aria-label={`Read now: ${titlePlain}`}
                >
                  {NEWS_CARD_READ_NOW_LABEL}
                </Link>
                <a
                  href={post.link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={NEWS_CARD_SECONDARY_FOOTER_LINK_CLASS}
                  aria-label={`Browse original publisher: ${titlePlain}`}
                >
                  Browse original publisher
                </a>
              </>
            ) : (
              <Link
                to={ROUTE_PATH_NEWS_DESK_FALLBACK}
                state={{ category: ROUTE_STATE_NEWS_DESK_CATEGORY }}
                className={NEWS_CARD_SECONDARY_FOOTER_LINK_CLASS}
              >
                Discover related coverage
              </Link>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}

export default memo(Post);
