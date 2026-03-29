/** Tailwind bundles for the homepage hero (IMPROVEMENTS.md PR 2). */
/** Dark slab behind hero marketing + photo; keeps white/light headline text readable. */
export const HERO_SECTION_ROOT_CLASS =
  'relative min-h-[85vh] flex items-end overflow-hidden bg-gray-950' as const;

export const HERO_BACKGROUND_IMAGE_CLASS =
  'absolute inset-0 h-full w-full object-cover opacity-50' as const;

export const HERO_GRADIENT_OVERLAY_CLASS =
  'absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent' as const;

export const HERO_CONTENT_WRAPPER_CLASS =
  'relative z-10 mx-auto max-w-4xl px-6 pb-16 md:pb-24' as const;

export const HERO_BADGE_CLASS =
  'mb-4 inline-block rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white' as const;

export const HERO_HEADLINE_CLASS =
  'mb-4 text-4xl font-extrabold leading-tight text-white md:text-6xl' as const;

export const HERO_HEADLINE_ACCENT_CLASS = 'text-red-400' as const;

export const HERO_SUBHEADLINE_CLASS =
  'mb-8 max-w-2xl text-lg text-gray-300 md:text-xl' as const;

export const HERO_CTA_ROW_CLASS = 'flex flex-col gap-4 sm:flex-row' as const;

export const HERO_PRIMARY_CTA_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-red-900/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-500 active:bg-red-700' as const;

export const HERO_SECONDARY_CTA_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/40 px-8 py-4 text-base font-bold text-white transition-all duration-200 hover:border-white' as const;

/** Thai marketing copy — value proposition (not the post title). */
export const HERO_VALUE_HEADLINE_LINE_1 = 'ข่าวที่คุณต้องรู้' as const;

export const HERO_VALUE_HEADLINE_ACCENT = 'ก่อนใครในไทย' as const;

export const HERO_VALUE_SUBHEADLINE =
  'รวมข่าวสำคัญจาก The Standard — การเมือง เศรษฐกิจ เทคโนโลยี และวัฒนธรรม อัปเดตทุกชั่วโมง' as const;

export const HERO_PRIMARY_CTA_LABEL = 'อ่านข่าวเด่นวันนี้ →' as const;

export const HERO_SECONDARY_CTA_LABEL = 'ดูข่าวทั้งหมด' as const;

export const HERO_PRIMARY_CTA_EXTERNAL_REL = 'noopener noreferrer' as const;

/** When post title HTML strips to empty. */
export const HERO_FALLBACK_ARTICLE_TITLE = 'Featured story' as const;

/** When the first category id has no ASCII-mapped label. */
export const HERO_FALLBACK_CATEGORY_LABEL = 'News' as const;
