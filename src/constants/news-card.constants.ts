/** Layout and copy for `NewsCard` (IMPROVEMENTS.md PR 3). */
export const ROUTE_PATH_READ_PREFIX = '/read/' as const;

export const ROUTE_PATH_NEWS_DESK_FALLBACK = '/posts/categories/39' as const;

export const ROUTE_STATE_NEWS_DESK_CATEGORY = 'News' as const;

export const NEWS_CARD_EXTERNAL_REL = 'noopener noreferrer' as const;

export const NEWS_CARD_FALLBACK_CATEGORY_LABEL = 'News' as const;

export const NEWS_CARD_PUBLISHER_LINK_LABEL = 'Browse original publisher' as const;

export const NEWS_CARD_DISCOVER_LINK_LABEL = 'Discover related coverage' as const;

export const NEWS_CARD_FEATURE_LI_CLASS = 'md:col-span-2 md:row-span-2' as const;

export const NEWS_CARD_ARTICLE_CLASS =
  'group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl' as const;

export const NEWS_CARD_IMAGE_WRAPPER_FEATURE_CLASS =
  'aspect-[16/9] overflow-hidden bg-neutral-100' as const;

export const NEWS_CARD_IMAGE_WRAPPER_STANDARD_CLASS =
  'aspect-[16/10] overflow-hidden bg-neutral-100' as const;

export const NEWS_CARD_IMAGE_CLASS =
  'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105' as const;

export const NEWS_CARD_BODY_PADDING_FEATURE_CLASS = 'p-4 md:p-6' as const;

export const NEWS_CARD_BODY_PADDING_STANDARD_CLASS = 'p-4' as const;

export const NEWS_CARD_CATEGORY_CLASS =
  'text-xs font-semibold uppercase tracking-wider text-red-600' as const;

export const NEWS_CARD_TITLE_FEATURE_CLASS =
  'mt-2 text-xl font-bold leading-snug text-gray-900 transition-colors group-hover:text-red-600 md:text-2xl' as const;

export const NEWS_CARD_TITLE_STANDARD_CLASS =
  'mt-2 text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-red-600' as const;

export const NEWS_CARD_EXCERPT_CLASS =
  'line-clamp-2 border-t border-neutral-100 px-4 pb-3 pt-2 text-sm leading-relaxed text-neutral-600' as const;

export const NEWS_CARD_FOOTER_CLASS =
  'mt-auto flex flex-col gap-2 border-t border-neutral-100 p-4' as const;

export const NEWS_CARD_PUBLISHER_ANCHOR_CLASS =
  'inline-flex items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-100 px-4 py-2 text-xs font-bold uppercase tracking-wide text-neutral-700 no-underline hover:bg-neutral-200' as const;

export const NEWS_CARD_DISCOVER_LINK_CLASS =
  'inline-flex items-center justify-center rounded-lg border-2 border-neutral-300 bg-neutral-100 px-4 py-2 text-sm font-bold uppercase tracking-wide text-neutral-700 no-underline hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500' as const;
