/**
 * Layout and route tokens for the primary navigation (PR 1 — navbar overlap fix).
 * Keeps Tailwind class strings and paths out of component markup.
 */
export const MAIN_CONTENT_TOP_OFFSET_CLASS = 'pt-16' as const;

/** Single fixed row (64px); category desks live in homepage chips, not a second nav row. */
export const NAVBAR_WRAPPER_CLASS =
  'fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-sm' as const;

export const NAVBAR_TOP_BAR_CLASS =
  'flex h-full w-full flex-shrink-0 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8' as const;

/** Full-width sheet below the 4rem header on small screens only */
export const NAVBAR_MOBILE_MENU_PANEL_CLASS =
  'fixed inset-x-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-neutral-200 bg-white shadow-lg lg:hidden' as const;

export const MENU_BUTTON_VISIBLE_LABEL = 'Menu' as const;

export const SITE_BRAND_NAV_LABEL = 'High-Signal News' as const;

export const NAVBAR_MORE_MENU_LABEL = 'More' as const;

export const ROUTE_PATH_HOME = '/' as const;

export const ROUTE_PATH_ABOUT = '/about' as const;
export const ROUTE_PATH_COVERAGE = '/coverage' as const;
export const ROUTE_PATH_TOPIC_HUBS = '/topics' as const;
export const ROUTE_PATH_TOPIC_BUSINESS = '/topics/business' as const;
export const ROUTE_PATH_METHODOLOGY = '/methodology' as const;
export const ROUTE_PATH_TOPIC_WORLD = '/topics/world' as const;
export const ROUTE_PATH_TOPIC_THAILAND = '/topics/thailand' as const;

export const ROUTE_PATH_POSTS_CATEGORY_PREFIX = '/posts/categories/' as const;

export const NAVBAR_PRIMARY_LINKS = [
  { href: ROUTE_PATH_ABOUT, label: 'About' },
  { href: ROUTE_PATH_COVERAGE, label: 'Coverage' },
  { href: ROUTE_PATH_TOPIC_HUBS, label: 'Topic hubs' },
  { href: ROUTE_PATH_TOPIC_BUSINESS, label: 'Business' },
] as const;

export const NAVBAR_MORE_LINKS = [
  { href: ROUTE_PATH_METHODOLOGY, label: 'Methodology' },
  { href: ROUTE_PATH_TOPIC_WORLD, label: 'World Watch' },
  { href: ROUTE_PATH_TOPIC_THAILAND, label: 'Thailand Desk' },
] as const;

export const NAVBAR_LINK_CLASS =
  'block rounded-lg px-3 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-neutral-700 transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 lg:inline-block lg:py-2' as const;

export const NAVBAR_DESK_LINK_CLASS =
  'block rounded-lg px-3 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-bright-blue transition-colors hover:bg-bright-blue hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bright-blue focus-visible:ring-inset lg:inline-block lg:py-2' as const;
