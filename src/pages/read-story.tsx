/**
 * Full article view for a single story, driven entirely by `story-pages.json`.
 *
 * That index is built in CI (after posts + categories + image URLs) by
 * `cachescripts/build-story-pages-index.sh`. Importing it statically means:
 * - No runtime `fetch()` to the publisher domain for story metadata (CORS-safe).
 * - Whatever was in the JSON at `vite build` time is what users see until the
 *   next deploy.
 *
 * Hero image: `story.imageUrl` is often an absolute CDN URL. Using it in
 * `<img src="...">` is not a CORS request (unlike `fetch`), so remote URLs work
 * without downloading binaries into the repo when `LOCALIZE_IMAGE_ASSETS=0`.
 */
import rawStoryPages from '@assets/cached/story-pages.json';
import PageHeader from '@components/page-header';
import { PUBLIC_SITE_URL } from '@constants/index';
import { absoluteUrlForOpenGraph, usePageSeo } from '@hooks/use-page-seo';
import {
  handleNewsImageLoadError,
  publisherImageReferrerProps,
  resolveImageUrl,
} from '@utils/formatters';
import { useMemo } from 'preact/hooks';
import { Link, useParams } from 'react-router-dom';
import type { StoryPage } from 'types/wp-api';

/** Parsed once at module load; large file but avoids async loading and empty states. */
const STORY_PAGES = rawStoryPages as StoryPage[];

function ReadStory() {
  const { id } = useParams();

  const story = useMemo(
    () => STORY_PAGES.find((row) => String(row.id) === String(id)),
    [id],
  );

  /**
   * Lightweight “related” rail: overlap on human-readable category names, not WP ids.
   * Higher score = more shared labels; we show the top three after sorting.
   */
  const relatedStories = useMemo(() => {
    if (!story) return [];
    const storyCats = new Set(story.categoryNames);
    return STORY_PAGES.filter((row) => row.id !== story.id)
      .map((row) => ({
        row,
        score: row.categoryNames.reduce(
          (acc, category) => acc + (storyCats.has(category) ? 1 : 0),
          0,
        ),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.row);
  }, [story]);

  usePageSeo({
    title: story ? `${story.title} | The Standard Feed` : 'Story | The Standard Feed',
    description:
      story?.excerpt ||
      'Read the full story and explore related coverage on The Standard Feed.',
    url: story ? `${PUBLIC_SITE_URL}/read/${story.id}` : `${PUBLIC_SITE_URL}/read`,
    canonicalUrl: story
      ? `${PUBLIC_SITE_URL}/read/${story.id}`
      : `${PUBLIC_SITE_URL}/read`,
    image: story?.imageUrl
      ? absoluteUrlForOpenGraph(resolveImageUrl(story.imageUrl))
      : undefined,
    ogType: story ? 'article' : 'website',
  });

  /* Route id does not match any row in the current bundle (stale link or typo). */
  if (!story) {
    return (
      <article className='max-w-5xl mx-auto px-4 sm:px-6 py-10 text-white'>
        <PageHeader title='Story unavailable' />
        <div className='surface-panel p-6 text-center'>
          <p className='text-white/90'>
            This story was not found in the current build snapshot.
          </p>
          <div className='mt-4 flex flex-wrap justify-center gap-3'>
            <Link
              to='/posts/categories/39'
              state={{ category: 'News' }}
              className='btn-primary no-underline inline-flex items-center justify-center'
            >
              <span className='btn-secondary'>Go to top stories</span>
            </Link>
            <Link
              to='/'
              className='inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm no-underline hover:bg-white/20'
            >
              Back to homepage
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className='max-w-5xl mx-auto px-4 sm:px-6 py-8 text-white'>
      <PageHeader title={story.title} />
      <section className='surface-panel p-5 sm:p-6 md:p-8'>
        <p className='text-white/80 text-sm sm:text-base'>{story.excerpt}</p>
        <div className='mt-3 flex flex-wrap gap-2'>
          {story.categoryNames.map((name) => (
            <span
              key={name}
              className='rounded-full border border-white/35 px-3 py-1 text-xs sm:text-sm'
            >
              {name}
            </span>
          ))}
        </div>
        <img
          className='mt-5 w-full rounded-xl border border-white/20 bg-white/5 object-cover max-h-[28rem]'
          src={resolveImageUrl(story.imageUrl ?? '')}
          alt={story.title}
          onError={handleNewsImageLoadError}
          {...publisherImageReferrerProps}
        />
        <div
          className='mt-6 prose prose-invert max-w-none prose-p:text-white/90 prose-headings:text-white prose-a:text-cyan-200'
          dangerouslySetInnerHTML={{ __html: story.contentHtml }}
        />
        {!story.contentHtml ? (
          <section className='mt-6 rounded-lg border border-white/25 bg-black/10 p-4 text-white/90'>
            Full article body is currently unavailable in this build snapshot. You can
            continue reading related desks or open the source publisher.
          </section>
        ) : null}
        {relatedStories.length > 0 ? (
          <section className='mt-8' aria-label='Related stories'>
            <h2 className='text-xl font-extrabold'>Related stories</h2>
            <ul className='mt-3 grid grid-cols-1 md:grid-cols-3 gap-3'>
              {relatedStories.map((related) => (
                <li
                  key={related.id}
                  className='rounded-lg border border-white/25 bg-black/10 p-4'
                >
                  <h3 className='font-bold text-sm leading-snug'>{related.title}</h3>
                  <p className='mt-2 text-white/80 text-xs line-clamp-3'>
                    {related.excerpt}
                  </p>
                  <Link
                    to={`/read/${related.id}`}
                    className='mt-3 inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-3 py-2 text-white font-semibold uppercase tracking-wide text-xs no-underline hover:bg-white/20'
                  >
                    Read related
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <div className='mt-8 flex flex-wrap gap-3'>
          <Link
            to='/'
            className='btn-primary no-underline inline-flex items-center justify-center'
          >
            <span className='btn-secondary'>Continue exploring</span>
          </Link>
          <Link
            to='/topics'
            className='inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm no-underline hover:bg-white/20'
          >
            Browse topic hubs
          </Link>
          {story.sourceUrl ? (
            <a
              href={story.sourceUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm no-underline hover:bg-white/20'
            >
              Browse the original publisher
            </a>
          ) : null}
        </div>
      </section>
    </article>
  );
}

export default ReadStory;
