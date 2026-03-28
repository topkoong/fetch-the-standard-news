import {
  MENU_BUTTON_VISIBLE_LABEL,
  NAVBAR_DESK_LINK_CLASS,
  NAVBAR_LINK_CLASS,
  NAVBAR_MOBILE_MENU_PANEL_CLASS,
  NAVBAR_MORE_LINKS,
  NAVBAR_MORE_MENU_LABEL,
  NAVBAR_PRIMARY_LINKS,
  NAVBAR_TOP_BAR_CLASS,
  NAVBAR_WRAPPER_CLASS,
  ROUTE_PATH_HOME,
  ROUTE_PATH_POSTS_CATEGORY_PREFIX,
  SITE_BRAND_NAV_LABEL,
} from '@constants/index';
import { useCategoryData } from '@hooks/use-category-data';
import { useCallback, useId, useState } from 'preact/hooks';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuPanelId = useId();
  const { navCategories } = useCategoryData();

  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleToggleMenu = useCallback(() => {
    setIsMenuOpen((wasOpen) => !wasOpen);
  }, []);

  return (
    <nav className={NAVBAR_WRAPPER_CLASS} aria-label='Primary'>
      <div className={NAVBAR_TOP_BAR_CLASS}>
        <Link
          to={ROUTE_PATH_HOME}
          className='flex-shrink-0 font-extrabold text-xl sm:text-2xl tracking-tight uppercase text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-offset-2 rounded-sm'
        >
          {SITE_BRAND_NAV_LABEL}
        </Link>

        <div className='flex items-center gap-2 lg:hidden'>
          <button
            type='button'
            className='flex items-center gap-2 rounded-md border-2 border-bright-blue px-3 py-2 text-bright-blue transition-colors hover:bg-bright-blue hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-offset-2'
            aria-expanded={isMenuOpen}
            aria-controls={menuPanelId}
            onClick={handleToggleMenu}
          >
            <span className='text-sm font-bold uppercase tracking-wide'>
              {MENU_BUTTON_VISIBLE_LABEL}
            </span>
            {!isMenuOpen ? (
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

        <div className='hidden lg:flex lg:flex-1 lg:flex-wrap lg:items-center lg:justify-between lg:gap-2 lg:px-3'>
          <ul className='flex list-none flex-row flex-wrap items-center gap-1'>
            {NAVBAR_PRIMARY_LINKS.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className={NAVBAR_LINK_CLASS}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className='relative'>
              <details className='group'>
                <summary
                  className={`${NAVBAR_LINK_CLASS} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
                >
                  {NAVBAR_MORE_MENU_LABEL}
                </summary>
                <ul className='absolute left-0 z-50 mt-1 min-w-[12rem] list-none rounded-lg border border-neutral-200 bg-white py-1 shadow-lg'>
                  {NAVBAR_MORE_LINKS.map((item) => (
                    <li key={item.href}>
                      <Link to={item.href} className={NAVBAR_LINK_CLASS}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          </ul>
          <ul className='flex max-w-[78vw] list-none flex-row flex-wrap items-center gap-1 overflow-x-auto'>
            {navCategories.map(({ id, label }) => (
              <li key={id}>
                <Link
                  to={`${ROUTE_PATH_POSTS_CATEGORY_PREFIX}${id}`}
                  state={{ category: label }}
                  className={NAVBAR_DESK_LINK_CLASS}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        id={menuPanelId}
        className={`${isMenuOpen ? '' : 'hidden '}${NAVBAR_MOBILE_MENU_PANEL_CLASS}`}
      >
        <ul className='flex list-none flex-col gap-1 px-4 pb-3 pt-2'>
          {NAVBAR_PRIMARY_LINKS.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                onClick={handleCloseMenu}
                className={NAVBAR_LINK_CLASS}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {NAVBAR_MORE_LINKS.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                onClick={handleCloseMenu}
                className={NAVBAR_LINK_CLASS}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <ul className='flex list-none flex-col gap-1 border-t border-neutral-200 px-4 pb-4 pt-2'>
          {navCategories.map(({ id, label }) => (
            <li key={id}>
              <Link
                to={`${ROUTE_PATH_POSTS_CATEGORY_PREFIX}${id}`}
                state={{ category: label }}
                onClick={handleCloseMenu}
                className={NAVBAR_DESK_LINK_CLASS}
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
