import { TOPIC_DEFINITIONS } from '@constants/topics';
import { Link } from 'react-router-dom';

/**
 * plan.md PR 10 — horizontal pills to topic landing pages (`/topics/:slug`).
 * Scrollable on small viewports so all six topics stay one tap away.
 */
export function CategoryChips() {
  return (
    <nav
      className='w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-2'
      aria-label='Browse topics'
    >
      <p className='text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2'>
        Topics
      </p>
      <div className='-mx-4 px-4 overflow-x-auto overflow-y-hidden pb-1'>
        <ul className='flex flex-nowrap gap-2 snap-x snap-mandatory min-w-min'>
          {TOPIC_DEFINITIONS.map((topic) => (
            <li key={topic.slug} className='snap-start shrink-0'>
              <Link
                to={`/topics/${topic.slug}`}
                className='inline-flex items-center justify-center rounded-full border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 text-sm font-semibold no-underline whitespace-nowrap shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50'
              >
                {topic.categoryLabel}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
