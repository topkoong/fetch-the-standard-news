import { useCallback, useId, useState } from 'preact/hooks';
import { Link } from 'react-router-dom';

const NAV_CATEGORIES: Record<string, string> = {
  '39': 'News',
  '11': 'World',
  '12': 'Thailand',
  '13': 'Business',
  '14': 'Sport',
  '26': 'Film',
  '27': 'Music',
  '33': 'Travel',
  '58822': 'Economic',
};

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  return (
    <nav
      className='sticky top-0 z-50 flex flex-wrap items-center justify-between bg-white/95 backdrop-blur-sm py-3 lg:py-4 lg:px-10 shadow-md border-t-4 border-bright-blue'
      aria-label='Primary'
    >
      <div className='flex w-full justify-between px-4 sm:px-6 lg:w-auto lg:border-b-0 lg:pb-0 border-b border-neutral-200 pb-4'>
        <Link
          to='/'
          className='flex-shrink-0 font-semibold text-2xl sm:text-3xl tracking-tight uppercase text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-offset-2 rounded-sm'
        >
          The Standard Feed
        </Link>
        <div className='flex items-center lg:hidden'>
          <button
            type='button'
            className='flex items-center rounded-md border-2 border-bright-blue px-3 py-2 text-bright-blue transition-colors hover:bg-bright-blue hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-offset-2'
            aria-expanded={isOpen}
            aria-controls={menuId}
            onClick={toggle}
          >
            <span className='sr-only'>{isOpen ? 'Close menu' : 'Open menu'}</span>
            {!isOpen ? (
              <svg
                className='h-5 w-5 fill-current'
                viewBox='0 0 20 20'
                aria-hidden='true'
              >
                <path d='M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z' />
              </svg>
            ) : (
              <svg
                className='h-5 w-5'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                aria-hidden='true'
              >
                <path strokeLinecap='round' d='M6 18L18 6M6 6l12 12' />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div
        id={menuId}
        className={`w-full flex-grow lg:flex lg:w-auto lg:items-center ${
          isOpen ? 'flex' : 'hidden'
        }`}
      >
        <ul className='flex flex-col list-none gap-1 px-4 pb-4 lg:flex-row lg:gap-0 lg:pb-0 lg:px-3 lg:ml-auto'>
          {Object.entries(NAV_CATEGORIES).map(([id, label]) => (
            <li key={id}>
              <Link
                to={`/posts/categories/${id}`}
                state={{ category: label }}
                onClick={close}
                className='block rounded-md px-3 py-2.5 text-sm font-bold uppercase tracking-wide text-bright-blue transition-colors hover:bg-bright-blue hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-inset lg:inline-block lg:py-2'
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
