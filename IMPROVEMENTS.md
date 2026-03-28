# Homepage Improvement Guide

**Project:** `fetch-the-standard-news`  
**Stack:** Vite + Preact + TypeScript + TailwindCSS  
**Data source:** `https://thestandard.co/homepage/`

> Each section below is one self-contained PR. Cursor should implement them in order.
> Every PR must use a **conventional commit message** and include a short PR description.

---

## Ground Rules for Every PR

- Conventional commit format: `type(scope): short description`
  - Types: `feat`, `fix`, `refactor`, `style`, `chore`
- Branch naming: `feat/<slug>` or `fix/<slug>`
- PR title = commit subject line
- PR body must include: **What changed**, **Why**, **Screenshots / Before–After** note
- Never merge to `main` without a passing build (`vite build`)

---

## PR 1 — Fix Navbar Z-index & Sticky Overlap

**Branch:** `fix/navbar-overlap`  
**Commit:** `fix(navbar): resolve sticky navbar overlapping page content`

### Problem

The navbar sits on top of hero/body content due to missing or incorrect `z-index` stacking and no offset padding on the first content section below it.

### What to do

1. **In your Navbar component** (likely `src/components/Navbar.tsx` or similar):

   ```tsx
   // Add to the nav wrapper
   className = 'fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm';
   ```

2. **On the root layout / `<main>` element**, add top padding equal to navbar height:

   ```tsx
   // If navbar is h-16 (64px):
   className = 'pt-16';
   ```

3. **On mobile**, ensure the hamburger menu renders _above_ content:

   ```tsx
   // Mobile menu panel
   className = 'fixed inset-x-0 top-16 z-40 bg-white shadow-lg';
   ```

4. **Simplify nav labels** to plain language. Replace any icon-only buttons with labeled ones. Keep the nav to max 5 top-level items — everything else lives in a "More" dropdown or gets cut.

### PR Description

> Fixes the navbar overlapping body content on scroll. Adds `z-50` and `backdrop-blur` for a modern glassmorphism effect. Adds `pt-16` offset to `<main>` so content starts below the bar. Mobile menu is now `z-40` so it stacks correctly.

---

## PR 2 — Hero Section: Persuasive Headline + Above-the-Fold CTA

**Branch:** `feat/hero-section-redesign`  
**Commit:** `feat(hero): add persuasive headline, subheadline, and primary CTA above the fold`

### Problem

There is no strong hero section. The page drops users straight into a news feed with no value proposition, no headline, and no CTA button. The first impression tells visitors nothing about why they should stay.

### What to do

Create a `HeroSection` component at `src/components/HeroSection.tsx`:

```tsx
// src/components/HeroSection.tsx
// Use the FIRST article fetched from thestandard.co/homepage as the hero image.
// The article object shape from the API will have: title, link, image, category.

interface HeroProps {
  featuredArticle: {
    title: string;
    link: string;
    image: string;
    category: string;
  };
}

export function HeroSection({ featuredArticle }: HeroProps) {
  return (
    <section className='relative min-h-[85vh] flex items-end overflow-hidden bg-gray-950'>
      {/* Full-bleed background image */}
      <img
        src={featuredArticle.image}
        alt={featuredArticle.title}
        className='absolute inset-0 w-full h-full object-cover opacity-50'
      />

      {/* Gradient overlay — bottom-up for text legibility */}
      <div className='absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent' />

      {/* Content */}
      <div className='relative z-10 max-w-4xl mx-auto px-6 pb-16 md:pb-24'>
        {/* Category badge */}
        <span
          className='inline-block mb-4 px-3 py-1 text-xs font-semibold tracking-widest uppercase
                         bg-red-600 text-white rounded-full'
        >
          {featuredArticle.category}
        </span>

        {/* Headline — value proposition, not just a news title */}
        <h1 className='text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4'>
          ข่าวที่คุณต้องรู้
          <br />
          <span className='text-red-400'>ก่อนใครในไทย</span>
        </h1>

        {/* Sub-headline */}
        <p className='text-lg md:text-xl text-gray-300 mb-8 max-w-2xl'>
          รวมข่าวสำคัญจาก The Standard — การเมือง เศรษฐกิจ เทคโนโลยี และวัฒนธรรม
          อัปเดตทุกชั่วโมง
        </p>

        {/* Primary CTA — links to the featured article */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <a
            href={featuredArticle.link}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center justify-center gap-2
                       px-8 py-4 text-base font-bold text-white
                       bg-red-600 hover:bg-red-500 active:bg-red-700
                       rounded-lg shadow-lg shadow-red-900/40
                       transition-all duration-200 hover:-translate-y-0.5'
          >
            อ่านข่าวเด่นวันนี้ →
          </a>
          <a
            href='https://thestandard.co'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center justify-center gap-2
                       px-8 py-4 text-base font-bold text-white
                       border-2 border-white/40 hover:border-white
                       rounded-lg transition-all duration-200'
          >
            ดูข่าวทั้งหมด
          </a>
        </div>
      </div>
    </section>
  );
}
```

**Wire it up in `App.tsx`:**

```tsx
// Pass the first article from your fetched data as featuredArticle
<HeroSection featuredArticle={articles[0]} />
```

### PR Description

> Introduces a full-bleed hero section above the fold. Uses the top fetched article's image as the hero background. Adds a bilingual value-proposition headline, sub-headline, and two CTAs (primary red button → featured article, secondary ghost button → The Standard homepage). Both buttons open in a new tab.

---

## PR 3 — News Cards: Bigger Images + Visual Hierarchy

**Branch:** `feat/news-cards-visual-hierarchy`  
**Commit:** `feat(cards): improve image size, typography hierarchy, and card layout`

### Problem

Images are too small. Card titles have no visual weight. There is no clear scan path — everything looks the same.

### What to do

Redesign the `NewsCard` component (or create one at `src/components/NewsCard.tsx`):

```tsx
// src/components/NewsCard.tsx
interface NewsCardProps {
  title: string;
  link: string;
  image: string;
  category: string;
  isFeature?: boolean; // true = large card (1st in a row), false = standard
}

export function NewsCard({
  title,
  link,
  image,
  category,
  isFeature = false,
}: NewsCardProps) {
  return (
    <a
      href={link}
      target='_blank'
      rel='noopener noreferrer'
      className={`group block bg-white rounded-xl overflow-hidden shadow-sm
                  hover:shadow-xl transition-all duration-300 hover:-translate-y-1
                  ${isFeature ? 'md:col-span-2 md:row-span-2' : ''}`}
    >
      {/* Image — aspect-ratio locks prevent layout shift */}
      <div
        className={`overflow-hidden ${isFeature ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}
      >
        <img
          src={image}
          alt={title}
          loading='lazy'
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
        />
      </div>

      <div className={`p-4 ${isFeature ? 'md:p-6' : ''}`}>
        {/* Category badge */}
        <span className='text-xs font-semibold uppercase tracking-wider text-red-600'>
          {category}
        </span>

        {/* Title */}
        <h2
          className={`mt-2 font-bold text-gray-900 leading-snug
                        group-hover:text-red-600 transition-colors
                        ${isFeature ? 'text-xl md:text-2xl' : 'text-base'}`}
        >
          {title}
        </h2>
      </div>
    </a>
  );
}
```

**Grid layout in your main feed section:**

```tsx
// Use a CSS grid with the first card spanning 2 columns on desktop
<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
  {articles.map((article, i) => (
    <NewsCard key={article.link} {...article} isFeature={i === 0} />
  ))}
</div>
```

### PR Description

> Replaces small thumbnail layout with a proper card grid. First card is a feature card (spans 2 columns on desktop). Images use `aspect-ratio` to prevent layout shift. Cards have hover lift + image zoom micro-interactions. Category is displayed as a red uppercase label above the title for clear scan hierarchy.

---

## PR 4 — Spacing System: Less Is More

**Branch:** `refactor/spacing-system`  
**Commit:** `refactor(layout): enforce consistent spacing system and remove visual clutter`

### Problem

Inconsistent padding/margin creates a cramped and noisy layout. White space is not decorative — it is what directs the user's eye.

### What to do

1. **Wrap the entire page in a single max-width container:**

   ```tsx
   // In App.tsx or Layout.tsx
   <main className='min-h-screen bg-gray-50'>
     <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>{/* all sections */}</div>
   </main>
   ```

2. **Apply a section spacing scale** — add this pattern to every `<section>`:

   ```tsx
   <section className="py-12 md:py-20">
   ```

3. **Between a section title and its content**, always use exactly `mb-8`:

   ```tsx
   <h2 className='text-2xl font-bold text-gray-900 mb-8'>ข่าวล่าสุด</h2>
   ```

4. **Card grid gap should be `gap-6`** (24px) on desktop, `gap-4` on mobile. Never `gap-2` or `gap-1`.

5. **Remove any hardcoded `margin` or `padding` that isn't part of the above scale.** Search for `mt-`, `mb-`, `pt-`, `pb-` values that are not multiples of 4 and replace them.

### PR Description

> Enforces a consistent 4-point spacing scale across the entire layout. All sections use `py-12 md:py-20`. Max-width container added. Card grids use `gap-6`. Removes ad-hoc spacing that caused the cramped and inconsistent look.

---

## PR 5 — CTA Section: Bottom-of-Page Conversion Block

**Branch:** `feat/bottom-cta-section`  
**Commit:** `feat(cta): add high-contrast conversion section at the bottom of the page`

### Problem

A homepage needs a CTA above the fold (done in PR 2) AND at the bottom. Users who scroll all the way down are the most interested — give them a clear next step.

### What to do

Create `src/components/CtaSection.tsx`:

```tsx
// src/components/CtaSection.tsx
export function CtaSection() {
  return (
    <section className='my-16 rounded-2xl bg-gray-950 text-white overflow-hidden relative'>
      {/* Decorative gradient blob */}
      <div className='absolute -top-20 -right-20 w-80 h-80 bg-red-600/30 rounded-full blur-3xl' />
      <div className='absolute -bottom-20 -left-20 w-80 h-80 bg-red-900/20 rounded-full blur-3xl' />

      <div className='relative z-10 px-8 py-16 md:py-20 text-center max-w-2xl mx-auto'>
        <p className='text-red-400 text-sm font-semibold uppercase tracking-widest mb-4'>
          The Standard
        </p>
        <h2 className='text-3xl md:text-4xl font-extrabold mb-4 leading-tight'>
          ไม่พลาดทุกความเคลื่อนไหว
          <br />
          ที่สำคัญกับประเทศไทย
        </h2>
        <p className='text-gray-400 text-base mb-8'>
          อ่านข่าวเชิงลึก วิเคราะห์ครบ อัปเดตทุกวัน บน The Standard
        </p>
        <a
          href='https://thestandard.co'
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center justify-center gap-2
                     px-10 py-4 text-base font-bold
                     bg-red-600 hover:bg-red-500
                     text-white rounded-xl
                     shadow-lg shadow-red-900/50
                     transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl'
        >
          ไปที่ The Standard →
        </a>
      </div>
    </section>
  );
}
```

Mount it just before the `</main>` closing tag in `App.tsx`.

### PR Description

> Adds a high-contrast dark CTA block at the bottom of the page. Uses ambient glow blobs for visual depth. Contains a bold headline, supporting copy, and a single primary red button linking to `thestandard.co`. Mirrors the above-the-fold CTA to complete the page's conversion funnel.

---

## PR 6 — Social Proof: Stats & Trust Bar

**Branch:** `feat/social-proof-bar`  
**Commit:** `feat(social-proof): add trust bar with publication stats above the news feed`

### Problem

New visitors have no reason to trust the content. Social proof — reader counts, publication age, awards — builds credibility instantly.

### What to do

Create `src/components/TrustBar.tsx`:

```tsx
// src/components/TrustBar.tsx
const stats = [
  { value: '10M+', label: 'ผู้อ่านต่อเดือน' },
  { value: '2017', label: 'ก่อตั้งเมื่อปี' },
  { value: '24/7', label: 'อัปเดตข่าว' },
  { value: '#1', label: 'สำนักข่าวออนไลน์ไทย' },
];

export function TrustBar() {
  return (
    <div className='bg-white border-y border-gray-100 py-6 my-12'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-6 text-center'>
        {stats.map((s) => (
          <div key={s.label}>
            <div className='text-2xl md:text-3xl font-extrabold text-gray-900'>
              {s.value}
            </div>
            <div className='text-sm text-gray-500 mt-1'>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Place `<TrustBar />` between `<HeroSection />` and the news feed grid in `App.tsx`.

### PR Description

> Adds a 4-stat trust bar between the hero and the news feed. Stats include monthly readers, founding year, update frequency, and brand positioning. Uses clean number + label pattern proven in high-converting media homepages. Separated by subtle border dividers, not heavy boxes.

---

## PR 7 — Loading & Error States

**Branch:** `feat/loading-error-states`  
**Commit:** `feat(ux): add skeleton loading state and error boundary for fetch failures`

### Problem

While articles are loading, users see a blank page. If the fetch fails, there is no fallback. Both are conversion killers.

### What to do

1. **Skeleton card** — create `src/components/SkeletonCard.tsx`:

   ```tsx
   export function SkeletonCard() {
     return (
       <div className='bg-white rounded-xl overflow-hidden animate-pulse'>
         <div className='aspect-[16/10] bg-gray-200' />
         <div className='p-4 space-y-3'>
           <div className='h-3 bg-gray-200 rounded w-1/4' />
           <div className='h-4 bg-gray-200 rounded w-full' />
           <div className='h-4 bg-gray-200 rounded w-3/4' />
         </div>
       </div>
     );
   }
   ```

2. **While loading**, render 9 `<SkeletonCard />` in the same grid as real cards.

3. **Error fallback:**
   ```tsx
   {
     error && (
       <div className='text-center py-20'>
         <p className='text-gray-500 text-lg mb-4'>ไม่สามารถโหลดข่าวได้ในขณะนี้</p>
         <a
           href='https://thestandard.co'
           target='_blank'
           rel='noopener noreferrer'
           className='px-6 py-3 bg-red-600 text-white font-bold rounded-lg'
         >
           ไปที่ The Standard โดยตรง →
         </a>
       </div>
     );
   }
   ```

### PR Description

> Replaces blank screen during fetch with 9 animated skeleton cards that match the real card layout. Adds error fallback with direct link to The Standard as a safety net. Prevents perceived-dead-site effect during slow connections.

---

## PR 8 — Responsive Polish & Accessibility

**Branch:** `fix/responsive-a11y`  
**Commit:** `fix(a11y): improve mobile responsiveness and accessibility across components`

### What to do

1. **All `<a>` elements** that open in `_blank` must have `rel="noopener noreferrer"` (already noted above — verify all instances).

2. **Images must have meaningful `alt` text** — use the article title, not empty string.

3. **Focus rings** — TailwindCSS removes them by default. Add to your `index.css` or `tailwind.config.js`:

   ```css
   /* In your global CSS */
   :focus-visible {
     outline: 2px solid #dc2626;
     outline-offset: 2px;
   }
   ```

4. **Mobile hero font sizes** — ensure the headline does not overflow on small screens:

   ```tsx
   // Use clamp or responsive Tailwind classes
   className = 'text-3xl sm:text-4xl md:text-6xl';
   ```

5. **Navbar on mobile** — hamburger button must have `aria-label="เปิดเมนู"` and toggle `aria-expanded`.

6. **Color contrast** — red `#dc2626` on white passes AA but test gray text `text-gray-400` on white — replace with `text-gray-500` minimum for body copy.

### PR Description

> Accessibility and mobile polish pass. Adds `focus-visible` ring using brand red. Fixes `aria-label` on hamburger button. Ensures all images have descriptive alt text. Tightens hero font sizes on small screens. All `target="_blank"` links use `rel="noopener noreferrer"`.

---

## PR 9 — Performance: Image Lazy Loading + Font Preload

**Branch:** `perf/image-and-font-optimization`  
**Commit:** `perf(assets): add lazy loading to news images and preload hero image`

### What to do

1. **Hero image should NOT be lazy-loaded** (it's above the fold):

   ```tsx
   <img ... loading="eager" fetchPriority="high" />
   ```

2. **All other card images** should be lazy:

   ```tsx
   <img ... loading="lazy" />
   ```

3. **In `index.html`**, add a `<link rel="preconnect">` for the CDN that serves The Standard's images:

   ```html
   <link rel="preconnect" href="https://thestandard.co" />
   ```

4. **Vite config** — if you use a custom font, add `modulepreload` or inline critical CSS. If using system fonts only, this step is done.

5. **Verify bundle size** — run `vite build --report` and ensure no individual chunk exceeds 200KB.

### PR Description

> Performance optimizations: hero image marked `fetchPriority="high"` and `loading="eager"`. All below-fold card images use `loading="lazy"`. Adds `preconnect` hint for The Standard's image CDN. Reduces LCP and improves Lighthouse performance score.

---

## Summary: PR Order & Dependency Map

```
PR 1  fix/navbar-overlap              ← no deps
PR 2  feat/hero-section-redesign      ← depends on PR 1 (correct offset)
PR 3  feat/news-cards-visual-hierarchy ← depends on PR 2 (article data shape)
PR 4  refactor/spacing-system         ← depends on PR 3 (all components exist)
PR 5  feat/bottom-cta-section         ← depends on PR 4 (spacing tokens)
PR 6  feat/social-proof-bar           ← depends on PR 4
PR 7  feat/loading-error-states       ← depends on PR 3
PR 8  fix/responsive-a11y             ← depends on all above
PR 9  perf/image-and-font-optimization ← depends on PR 8
```

---

## Design Tokens Reference (TailwindCSS)

| Token      | Value                                     | Usage                             |
| ---------- | ----------------------------------------- | --------------------------------- |
| Brand red  | `red-600` / `#dc2626`                     | CTAs, badges, active states       |
| Dark bg    | `gray-950`                                | Hero, dark sections               |
| Body text  | `gray-900`                                | Headlines                         |
| Muted text | `gray-500`                                | Labels, metadata                  |
| Surface    | `white`                                   | Cards, navbar                     |
| Page bg    | `gray-50`                                 | Overall page background           |
| Border     | `gray-100`                                | Dividers                          |
| Radius     | `rounded-xl` (12px)                       | Cards, `rounded-lg` (8px) Buttons |
| Shadow     | `shadow-sm` default, `shadow-xl` on hover | Cards                             |

---

## What Each Button Should Link To

| Button             | Destination                                                |
| ------------------ | ---------------------------------------------------------- |
| Hero primary CTA   | `{featuredArticle.link}` — the top fetched article         |
| Hero secondary CTA | `https://thestandard.co`                                   |
| Each news card     | `{article.link}` — that specific article on thestandard.co |
| Bottom CTA         | `https://thestandard.co`                                   |
| Navbar logo        | `/` (back to your homepage)                                |

All external links: `target="_blank" rel="noopener noreferrer"`

---

_Generated by lead review. Implement in PR order. Each PR must pass `vite build` before merge._
