import placeholderImage from '@assets/images/placeholder.png';
import useIntersectionObserver from '@hooks/use-intersection-observer';
import { memo } from 'preact/compat';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
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
  const titlePlain = stripHtml(post?.title?.rendered ?? '') || 'Article';
  const excerptPlain = stripHtml(post?.excerpt?.rendered ?? '').trim();
  const usePlaceholder = group !== undefined && group !== 0 && !isVisible;
  const [imageSrc, setImageSrc] = useState<string | undefined>(post.imageUrl);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [showImageFallbackNote, setShowImageFallbackNote] = useState(false);
  const baseUrl = import.meta.env.BASE_URL ?? '/';

  const localCandidates = useMemo(() => {
    const mediaId = post.featured_media;
    if (!mediaId) return [];
    const prefix = `${baseUrl}cached-media/${mediaId}`;
    return [
      `${prefix}.jpg`,
      `${prefix}.jpeg`,
      `${prefix}.png`,
      `${prefix}.webp`,
      `${prefix}.avif`,
    ];
  }, [baseUrl, post.featured_media]);

  useEffect(() => {
    setImageSrc(post.imageUrl);
    setCandidateIndex(0);
    setShowImageFallbackNote(false);
  }, [post.id, post.imageUrl]);

  const resolvedSrc = usePlaceholder ? placeholderImage : imageSrc || placeholderImage;

  return (
    <li className='card-article'>
      <article className='flex flex-col gap-4 h-full'>
        <header>
          <h2 className='post-title'>{titlePlain}</h2>
        </header>
        <div className='relative w-full aspect-[16/10] overflow-hidden rounded-md bg-neutral-100 border border-black/5'>
          <img
            ref={ref}
            className={`h-full w-full object-cover transition-all duration-500 ease-out ${
              usePlaceholder
                ? 'grayscale blur-md scale-105'
                : 'grayscale-0 blur-0 scale-100'
            }`}
            src={resolvedSrc}
            alt={titlePlain}
            loading='lazy'
            decoding='async'
            referrerPolicy='no-referrer'
            onError={(event) => {
              if (candidateIndex < localCandidates.length) {
                const nextSrc = localCandidates[candidateIndex];
                setCandidateIndex((idx) => idx + 1);
                setImageSrc(nextSrc);
                return;
              }
              setShowImageFallbackNote(true);
              event.currentTarget.src = placeholderImage;
            }}
          />
        </div>
        {showImageFallbackNote ? (
          <p className='text-xs text-neutral-500 leading-snug'>
            Preview image unavailable from source right now. You can still open the full
            story.
          </p>
        ) : null}
        <p className='text-neutral-600 text-sm leading-relaxed line-clamp-3'>
          {excerptPlain ||
            'Read now for our layout; use the publisher link when you need the source site.'}
        </p>
        <div className='text-center mt-auto pt-2'>
          {post.link ? (
            <div className='flex flex-col gap-2 items-center'>
              <Link
                to={`/read/${post.id}`}
                className='btn-primary w-full max-w-xs mx-auto no-underline inline-flex items-center justify-center'
                aria-label={`Read now: ${titlePlain}`}
              >
                <span className='btn-secondary text-lg lg:text-xl'>Read now</span>
              </Link>
              <a
                href={post.link}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center justify-center rounded-xl border-2 border-neutral-300 bg-neutral-100 px-4 py-2 text-neutral-700 text-xs uppercase font-bold no-underline hover:bg-neutral-200'
                aria-label={`Browse original publisher: ${titlePlain}`}
              >
                Browse original publisher
              </a>
            </div>
          ) : (
            <Link
              to='/posts/categories/39'
              state={{ category: 'News' }}
              className='inline-flex items-center justify-center rounded border-2 border-neutral-300 bg-neutral-100 px-6 py-4 text-neutral-700 text-sm uppercase font-bold no-underline hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500'
            >
              Discover related coverage
            </Link>
          )}
        </div>
      </article>
    </li>
  );
}

export default memo(Post);
