import PageHeader from '@components/page-header';
import { PUBLIC_SITE_URL } from '@constants/index';
import { TOPIC_DEFINITIONS } from '@constants/topics';
import { usePageSeo } from '@hooks/use-page-seo';
import { Link } from 'react-router-dom';

function Coverage() {
  const canonical = `${PUBLIC_SITE_URL}/coverage`;
  usePageSeo({
    title: 'Coverage map | The Standard Feed',
    description:
      'Navigate topic hubs and category desks for business, world, Thailand, culture, and daily news from The Standard Feed.',
    url: canonical,
    canonicalUrl: canonical,
    ogType: 'website',
  });

  return (
    <article className='max-w-5xl mx-auto px-4 sm:px-6 py-10 text-white'>
      <PageHeader title='Coverage map' />
      <section className='surface-panel p-6 sm:p-8'>
        <p className='text-white/90 max-w-3xl'>
          Use topic hubs for editorial framing, then open the matching desk for the live
          stream. Daily headlines stay on the news desk for a fast first pass.
        </p>
        <ul className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
          <li className='rounded-xl border border-white/25 bg-black/10 p-4'>
            <h2 className='text-lg font-extrabold'>News desk</h2>
            <p className='mt-2 text-white/85 text-sm'>
              Broad daily headlines and breaking context.
            </p>
            <div className='mt-4 flex flex-wrap gap-2'>
              <Link
                to='/posts/categories/39'
                state={{ category: 'News' }}
                className='btn-primary no-underline inline-flex items-center justify-center'
              >
                <span className='btn-secondary'>Open news desk</span>
              </Link>
            </div>
          </li>
          {TOPIC_DEFINITIONS.map((topic) => (
            <li
              key={topic.slug}
              className='rounded-xl border border-white/25 bg-black/10 p-4'
            >
              <h2 className='text-lg font-extrabold'>{topic.title}</h2>
              <p className='mt-2 text-white/85 text-sm'>{topic.subtitle}</p>
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
        <div className='mt-8 flex flex-wrap gap-3'>
          <Link
            to='/methodology'
            className='inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm no-underline hover:bg-white/20'
          >
            Read methodology
          </Link>
          <Link
            to='/'
            className='inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm no-underline hover:bg-white/20'
          >
            Back to dashboard
          </Link>
        </div>
      </section>
    </article>
  );
}

export default Coverage;
