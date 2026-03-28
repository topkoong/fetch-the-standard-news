import { PUBLIC_SITE_URL } from '@constants/index';
import { TOPIC_DEFINITIONS } from '@constants/topics';
import { usePageSeo } from '@hooks/use-page-seo';
import { Link, useParams } from 'react-router-dom';

function TopicLanding() {
  const { topic } = useParams();
  const definition = TOPIC_DEFINITIONS.find((item) => item.slug === topic);

  const canonical = definition
    ? `${PUBLIC_SITE_URL}/topics/${definition.slug}`
    : `${PUBLIC_SITE_URL}/topics`;
  usePageSeo({
    title: definition
      ? `${definition.title} | The Standard Feed`
      : 'Topic | The Standard Feed',
    description:
      definition?.description ?? 'Explore curated topic coverage from The Standard Feed.',
    url: canonical,
    canonicalUrl: canonical,
    ogType: 'website',
  });

  if (!definition) {
    return (
      <section className='max-w-4xl mx-auto px-4 sm:px-6 py-12 text-white'>
        <div className='surface-panel p-6 text-center'>
          <h1 className='text-3xl font-extrabold'>Topic not found</h1>
          <p className='mt-3 text-white/90'>
            Choose another topic desk to continue reading.
          </p>
          <Link
            to='/'
            className='btn-primary no-underline inline-flex items-center justify-center mt-5'
          >
            <span className='btn-secondary'>Back to homepage</span>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <article className='max-w-5xl mx-auto px-4 sm:px-6 py-10 text-white'>
      <section className='surface-panel p-6 sm:p-8'>
        <h1 className='text-3xl sm:text-4xl font-extrabold tracking-tight'>
          {definition.title}
        </h1>
        <p className='mt-2 text-xl text-white/90 font-semibold'>{definition.subtitle}</p>
        <p className='mt-4 text-white/90'>{definition.description}</p>
        <div className='mt-5 grid grid-cols-1 md:grid-cols-3 gap-3'>
          {definition.benefits.map((benefit) => (
            <div
              key={benefit}
              className='rounded-lg border border-white/25 bg-black/10 p-4 text-sm sm:text-base'
            >
              {benefit}
            </div>
          ))}
        </div>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link
            to={`/posts/categories/${definition.categoryId}`}
            state={{ category: definition.categoryLabel }}
            className='btn-primary no-underline inline-flex items-center justify-center'
          >
            <span className='btn-secondary'>Open {definition.categoryLabel} desk</span>
          </Link>
          <Link
            to='/'
            className='inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm no-underline hover:bg-white/20'
          >
            Return to dashboard
          </Link>
        </div>
      </section>
    </article>
  );
}

export default TopicLanding;
