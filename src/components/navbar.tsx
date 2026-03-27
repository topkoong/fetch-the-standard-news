import { useCategoryData } from '@hooks/use-category-data';
import { useCallback, useId, useState } from 'preact/hooks';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);
  const { navCategories } = useCategoryData();

  return (
    <nav
      className='sticky top-0 z-50 flex flex-wrap items-center justify-between bg-white/96 backdrop-blur-sm py-3 lg:py-4 lg:px-8 shadow-md border-b border-neutral-200'
      aria-label='Primary'
    >
      <div className='flex w-full justify-between px-4 sm:px-6 lg:w-auto lg:border-b-0 lg:pb-0 border-b border-neutral-200/80 pb-4'>
        <Link
          to='/'
          className='flex-shrink-0 font-extrabold text-xl sm:text-2xl tracking-tight uppercase text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-offset-2 rounded-sm'
        >
          High-Signal News
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
        <ul className='flex flex-col list-none gap-1 px-4 pb-3 lg:flex-row lg:gap-1 lg:pb-0 lg:px-3'>
          <li>
            <Link
              to='/topics'
              onClick={close}
              className='block rounded-lg px-3 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-neutral-700 transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 lg:inline-block lg:py-2'
            >
              Topic Hubs
            </Link>
          </li>
          <li>
            <Link
              to='/topics/business'
              onClick={close}
              className='block rounded-lg px-3 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-neutral-700 transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 lg:inline-block lg:py-2'
            >
              Business Briefing
            </Link>
          </li>
          <li>
            <Link
              to='/topics/world'
              onClick={close}
              className='block rounded-lg px-3 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-neutral-700 transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 lg:inline-block lg:py-2'
            >
              World Watch
            </Link>
          </li>
          <li>
            <Link
              to='/topics/thailand'
              onClick={close}
              className='block rounded-lg px-3 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-neutral-700 transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 lg:inline-block lg:py-2'
            >
              Thailand Desk
            </Link>
          </li>
        </ul>
        <ul className='flex flex-col list-none gap-1 px-4 pb-4 lg:flex-row lg:gap-1 lg:pb-0 lg:px-3 lg:ml-auto lg:max-w-[78vw] lg:overflow-x-auto'>
          {navCategories.map(({ id, label }) => (
            <li key={id}>
              <Link
                to={`/posts/categories/${id}`}
                state={{ category: label }}
                onClick={close}
                className='block rounded-lg px-3 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-bright-blue transition-colors hover:bg-bright-blue hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-inset lg:inline-block lg:py-2'
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
