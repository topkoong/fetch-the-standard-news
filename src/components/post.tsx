import placeholderImage from '@assets/images/placeholder.png';
import useIntersectionObserver from '@hooks/use-intersection-observer';
import { memo } from 'preact/compat';
import { useRef } from 'preact/hooks';

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export interface WpPostShape {
  id: number;
  title?: { rendered?: string };
  link?: string;
  imageUrl?: string;
}

interface PostProps {
  post: WpPostShape;
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
          />
        </div>
        <div className='text-center mt-auto pt-2'>
          <button
            type='button'
            className='btn-primary w-full max-w-xs mx-auto'
            onClick={() =>
              post.link && window.open(post.link, '_blank', 'noopener,noreferrer')
            }
            aria-label={`Open article: ${titlePlain}`}
          >
            <span className='btn-secondary text-lg lg:text-xl'>Read article</span>
          </button>
        </div>
      </article>
    </li>
  );
}

export default memo(Post);
