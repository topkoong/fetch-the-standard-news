import placeholderImage from '@assets/images/placeholder.png';
import useIntersectionObserver from '@hooks/use-intersection-observer';
import { memo } from 'preact/compat';
import { useRef } from 'preact/hooks';
import type { WpRenderedText } from 'types/wp-api';

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
    link?: string;
    imageUrl?: string;
  };
  /** When set, non-first groups use a blur placeholder until the card scrolls into view. */
  group?: number;
}

function Post({ post, group }: PostProps) {
  const ref = useRef<HTMLImageElement | null>(null);
  const entry = useIntersectionObserver(ref, {});
  const isVisible = !!entry?.isIntersecting;
  const titlePlain = stripHtml(post?.title?.rendered ?? '') || 'Article';
  const usePlaceholder = group !== undefined && group !== 0 && !isVisible;

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
            src={usePlaceholder ? placeholderImage : post?.imageUrl || placeholderImage}
            alt={titlePlain}
            loading='lazy'
            decoding='async'
            referrerPolicy='no-referrer'
            onError={(event) => {
              event.currentTarget.src = placeholderImage;
            }}
          />
        </div>
        <p className='text-neutral-600 text-sm leading-relaxed'>
          Get the full context and verified details from The Standard newsroom.
        </p>
        <div className='text-center mt-auto pt-2'>
          {post.link ? (
            <a
              href={post.link}
              target='_blank'
              rel='noopener noreferrer'
              className='btn-primary w-full max-w-xs mx-auto no-underline inline-flex items-center justify-center'
              aria-label={`Open article: ${titlePlain}`}
            >
              <span className='btn-secondary text-lg lg:text-xl'>Read full story</span>
            </a>
          ) : (
            <span
              className='inline-block rounded border-2 border-neutral-300 bg-neutral-100 px-6 py-4 text-neutral-500 text-sm uppercase font-bold'
              aria-disabled='true'
            >
              Link unavailable
            </span>
          )}
        </div>
      </article>
    </li>
  );
}

export default memo(Post);
