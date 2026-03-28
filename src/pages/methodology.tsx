import PageHeader from '@components/page-header';
import { PUBLIC_SITE_URL } from '@constants/index';
import { usePageSeo } from '@hooks/use-page-seo';
import { Link } from 'react-router-dom';

function Methodology() {
  const canonical = `${PUBLIC_SITE_URL}/methodology`;
  usePageSeo({
    title: 'Methodology | The Standard Feed',
    description:
      'How The Standard Feed pulls WordPress content, caches assets in CI, and serves internal story pages with predictable deploy snapshots.',
    url: canonical,
    canonicalUrl: canonical,
    ogType: 'website',
  });

  return (
    <article className='max-w-5xl mx-auto px-4 sm:px-6 py-10 text-white'>
      <PageHeader title='Methodology' />
      <section className='surface-panel p-6 sm:p-8 space-y-4'>
        <p className='text-white/90'>
          Stories and categories originate from The Standard&apos;s public WordPress REST
          API. During deployment we refresh cached JSON bundles for posts, categories, and
          media mappings, then compile a structured story index for internal read routes.
        </p>
        <p className='text-white/90'>
          That means most reading paths work from artifacts shipped with the build, while
          category desks can still call the API for pagination when you load more stories.
        </p>
        <ul className='list-disc pl-5 text-white/85 space-y-2'>
          <li>Deploy pipeline runs cache scripts before lint and build.</li>
          <li>Images are resolved with local fallbacks when assets are available.</li>
          <li>When the network blips, retry actions and desk links keep flows moving.</li>
        </ul>
        <div className='pt-4 flex flex-wrap gap-3'>
          <Link
            to='/about'
            className='btn-primary no-underline inline-flex items-center justify-center'
          >
            <span className='btn-secondary'>About this feed</span>
          </Link>
          <Link
            to='/coverage'
            className='inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm no-underline hover:bg-white/20'
          >
            Explore coverage
          </Link>
          <Link
            to='/posts/categories/39'
            state={{ category: 'News' }}
            className='inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm no-underline hover:bg-white/20'
          >
            Open news desk
          </Link>
        </div>
      </section>
    </article>
  );
}

export default Methodology;
