import PageHeader from '@components/page-header';
import { TOPIC_DEFINITIONS } from '@constants/topics';
import { usePageSeo } from '@hooks/use-page-seo';
import { Link } from 'react-router-dom';

function TopicsHub() {
  usePageSeo({
    title: 'Topic hubs | The Standard Feed',
    description:
      'Browse curated topic hubs for business, world, Thailand, and culture with clear paths to desks and internal stories.',
    url: 'https://topkoong.github.io/fetch-the-standard-news/topics',
  });

  return (
    <article className='max-w-6xl mx-auto px-4 sm:px-6 py-8 text-white'>
      <PageHeader title='Topic hubs' />
      <section className='surface-panel p-5 sm:p-6 md:p-8'>
        <p className='text-white/90 max-w-3xl'>
          Pick a hub for focused framing, then open the matching desk for the live stream.
        </p>
        <ul className='mt-5 grid grid-cols-1 md:grid-cols-2 gap-4'>
          {TOPIC_DEFINITIONS.map((topic) => (
            <li
              key={topic.slug}
              className='rounded-xl border border-white/25 bg-black/10 p-4'
            >
              <h2 className='text-xl font-extrabold'>{topic.title}</h2>
              <p className='mt-1 text-white/90 text-sm'>{topic.subtitle}</p>
              <p className='mt-2 text-white/80 text-sm'>{topic.description}</p>
              <div className='mt-4 flex flex-wrap gap-2'>
                <Link
                  to={`/topics/${topic.slug}`}
                  className='btn-primary no-underline inline-flex items-center justify-center'
                >
                  <span className='btn-secondary'>Open hub</span>
                </Link>
                <Link
                  to={`/posts/categories/${topic.categoryId}`}
                  state={{ category: topic.categoryLabel }}
                  className='inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-4 py-2 text-white font-semibold uppercase tracking-wide text-xs no-underline hover:bg-white/20'
                >
                  Open {topic.categoryLabel} desk
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

export default TopicsHub;
