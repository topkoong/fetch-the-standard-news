import PageHeader from '@components/page-header';
import { usePageSeo } from '@hooks/use-page-seo';
import { Link } from 'react-router-dom';

const SITE_ORIGIN = 'https://topkoong.github.io/fetch-the-standard-news';

function About() {
  usePageSeo({
    title: 'About this feed | The Standard Feed',
    description:
      'Learn what The Standard Feed is, how it is built for fast reading, and how to navigate desks and internal story pages.',
    url: `${SITE_ORIGIN}/about`,
  });

  return (
    <article className='max-w-5xl mx-auto px-4 sm:px-6 py-10 text-white'>
      <PageHeader title='About this feed' />
      <section className='surface-panel p-6 sm:p-8 space-y-4'>
        <p className='text-white/90'>
          The Standard Feed is a high-signal reading dashboard that surfaces stories from{' '}
          <span className='font-semibold text-white'>The Standard</span> with a focus on
          fast scanning, clear next actions, and internal reading when you want depth
          before opening the original publisher.
        </p>
        <p className='text-white/90'>
          This experience pairs curated category desks with topic landing pages so you can
          move from headline to context without losing your place.
        </p>
        <ul className='list-disc pl-5 text-white/85 space-y-2'>
          <li>Internal read pages for many stories, built from deploy-time snapshots.</li>
          <li>Category navigation for live desk browsing with load-more pagination.</li>
          <li>
            Accessible layout, recovery actions when a sync hiccups, and clear CTAs.
          </li>
        </ul>
        <div className='pt-4 flex flex-wrap gap-3'>
          <Link
            to='/methodology'
            className='btn-primary no-underline inline-flex items-center justify-center'
          >
            <span className='btn-secondary'>How we sync</span>
          </Link>
          <Link
            to='/coverage'
            className='inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm no-underline hover:bg-white/20'
          >
            View coverage map
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

export default About;
