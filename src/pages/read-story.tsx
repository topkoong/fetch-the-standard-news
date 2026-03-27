import storyPagesUrl from '@assets/cached/story-pages.json?url';
import placeholderImage from '@assets/images/placeholder.png';
import PageHeader from '@components/page-header';
import Spinner from '@components/spinner';
import { usePageSeo } from '@hooks/use-page-seo';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { Link, useParams } from 'react-router-dom';
import type { StoryPage } from 'types/wp-api';

async function fetchStoryPages(signal: AbortSignal): Promise<StoryPage[]> {
  const response = await fetch(storyPagesUrl, { signal });
  if (!response.ok) throw new Error('Unable to load story index');
  return (await response.json()) as StoryPage[];
}

function ReadStory() {
  const { id } = useParams();
  const [rows, setRows] = useState<StoryPage[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setRows(null);
    setLoadError(null);
    void fetchStoryPages(controller.signal)
      .then((data) => setRows(data))
      .catch(() => setLoadError('Story is not available at the moment.'));
    return () => controller.abort();
  }, []);

  const story = useMemo(
    () => rows?.find((row) => String(row.id) === String(id)),
    [id, rows],
  );

  usePageSeo({
    title: story ? `${story.title} | The Standard Feed` : 'Story | The Standard Feed',
    description:
      story?.excerpt ||
      'Read the full story and explore related coverage on The Standard Feed.',
    url: story
      ? `https://topkoong.github.io/fetch-the-standard-news/read/${story.id}`
      : 'https://topkoong.github.io/fetch-the-standard-news/read',
  });

  if (!rows && !loadError) {
    return (
      <section className='min-h-[50vh] spinner-container py-24' aria-busy='true'>
        <Spinner />
      </section>
    );
  }

  if (loadError || !story) {
    return (
      <article className='max-w-5xl mx-auto px-4 sm:px-6 py-10 text-white'>
        <PageHeader title='Story unavailable' />
        <div className='surface-panel p-6 text-center'>
          <p className='text-white/90'>
            We could not load this article right now. Please try another desk.
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
          src={story.imageUrl || placeholderImage}
          alt={story.title}
          onError={(e) => {
            e.currentTarget.src = placeholderImage;
          }}
        />
        <div
          className='mt-6 prose prose-invert max-w-none prose-p:text-white/90 prose-headings:text-white prose-a:text-cyan-200'
          dangerouslySetInnerHTML={{ __html: story.contentHtml }}
        />
        <div className='mt-8 flex flex-wrap gap-3'>
          <Link
            to='/'
            className='btn-primary no-underline inline-flex items-center justify-center'
          >
            <span className='btn-secondary'>Continue exploring</span>
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
