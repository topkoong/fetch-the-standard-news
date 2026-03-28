# CURSOR IMPLEMENTATION SPEC

# fetch-the-standard-news — Homepage Redesign

#

# HOW TO USE THIS FILE

# ─────────────────────────────────────────────────────────────────────────────

# Each PR block below is a complete, self-contained unit of work.

# For every PR block, Cursor must:

# 1. Create a new branch with the exact name in "Branch".

# 2. Execute every step inside "Steps" in order — no skipping.

# 3. Commit with the exact message in "Commit".

# 4. Open a PR with the exact title in "PR Title".

# Do not batch multiple PR blocks into one commit.

# ─────────────────────────────────────────────────────────────────────────────

---

## PREREQUISITE — Understand the project structure

Before starting, run this mental scan of the repo and confirm these files exist.
Adjust any path below if the real path differs.

```
src/
  components/
    Navbar.tsx          ← or Navbar.jsx / Header.tsx
    NewsCard.tsx        ← or ArticleCard.tsx / Card.tsx
    Hero.tsx            ← may not exist yet — will be created in PR-02
  pages/
    Home.tsx            ← or App.tsx / index.tsx
  hooks/
    useNews.ts          ← or wherever the fetch logic lives
  App.tsx
index.css               ← global styles
tailwind.config.ts      ← or tailwind.config.js
```

The API source is: https://thestandard.co/homepage/
Every article object coming back from that API has at minimum:

- `title` (string)
- `link` or `url` (string) — the full thestandard.co article URL
- `image` or `thumbnail` (string) — image URL
- `excerpt` or `description` (string)
- `category` (string or array)
- `date` or `publishedAt` (string)

Verify the actual field names by console-logging one article object before writing
any component code.

---

## PR-01 — Fix navbar overlap

**Branch:** `fix/navbar-sticky-overlap`

**Problem:** The fixed navbar overlaps the page body because the layout has no top offset.

### Steps

**Step 1 — Open the Navbar component file.**
Find the outermost `<nav>` or `<header>` element.
Replace its className with (preserve any existing classes, just add these):

```
fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm
```

**Step 2 — Open `App.tsx` (or the root layout wrapper that wraps all pages).**
Find the outermost `<div>` or `<main>` that contains the page content.
Add `pt-16` to its className. If the navbar is taller than 64 px, use `pt-20`.

**Step 3 — If a mobile hamburger menu exists:**
Ensure the mobile dropdown/drawer also has `z-50` so it renders above all content.

**Step 4 — Verify:** scroll to the very top — navbar must sit above the hero image
with no content hidden beneath it.

### Commit

```
fix(navbar): resolve content overlap by fixing position and adding body offset

- Add `fixed top-0 left-0 right-0 z-50` to navbar outer element
- Add `pt-16` to root layout wrapper to compensate for nav height
- Ensure mobile drawer shares z-50 layer
```

### PR Title

`fix(navbar): resolve sticky positioning and content overlap`

---

## PR-02 — Replace Hero section with above-the-fold conversion block

**Branch:** `feat/hero-above-fold`

**Problem:** No clear value proposition, no dominant CTA, no featured image above the fold.

### Steps

**Step 1 — Create `src/components/Hero.tsx`** with this exact content:

```tsx
import { useEffect, useState } from 'react';

interface HeroProps {
  featuredTitle: string;
  featuredImageUrl: string;
  featuredUrl: string;
}

export function Hero({ featuredTitle, featuredImageUrl, featuredUrl }: HeroProps) {
  return (
    <section
      className='relative w-full min-h-[90vh] flex flex-col lg:flex-row
                        items-center gap-10 px-6 lg:px-20 py-28 bg-white overflow-hidden'
    >
      {/* ── Left: editorial copy ── */}
      <div className='flex-1 flex flex-col gap-6 z-10 max-w-xl'>
        <span
          className='inline-flex items-center gap-2 text-xs font-bold
                         tracking-widest text-red-600 uppercase'
        >
          <span className='w-2 h-2 rounded-full bg-red-600 animate-pulse' />
          The Standard · Live Coverage
        </span>

        <h1
          className='text-5xl lg:text-[4.5rem] font-extrabold leading-[1.08]
                       tracking-tight text-gray-950'
        >
          Stay Ahead
          <br />
          of the Story.
        </h1>

        <p className='text-lg lg:text-xl text-gray-500 leading-relaxed'>
          Thailand's most-trusted independent newsroom —&nbsp; curated headlines,
          delivered in seconds.
        </p>

        <div className='flex flex-wrap gap-3 mt-1'>
          {/* ── PRIMARY CTA — always links to thestandard.co ── */}
          <a
            href='https://thestandard.co/homepage/'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-full
                       bg-red-600 text-white text-base font-bold shadow-lg
                       hover:bg-red-700 active:scale-[0.97] transition-all duration-150'
          >
            Read Today's Top Stories
            <span aria-hidden>→</span>
          </a>

          {/* ── SECONDARY CTA ── */}
          <a
            href='https://thestandard.co/news/'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-full
                       border-2 border-gray-900 text-gray-900 text-base font-semibold
                       hover:bg-gray-900 hover:text-white transition-all duration-150'
          >
            Explore by Topic
          </a>
        </div>
      </div>

      {/* ── Right: featured article image ── */}
      <div
        className='flex-1 relative w-full max-w-2xl rounded-3xl overflow-hidden
                      shadow-2xl aspect-video'
      >
        {featuredImageUrl ? (
          <img
            src={featuredImageUrl}
            alt={featuredTitle}
            className='w-full h-full object-cover'
          />
        ) : (
          // Skeleton placeholder while image loads
          <div className='w-full h-full bg-gray-100 animate-pulse' />
        )}
        {/* Gradient overlay for legibility */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none' />
        {featuredTitle && (
          <p className='absolute bottom-4 left-4 right-4 text-white text-sm font-medium line-clamp-2'>
            {featuredTitle}
          </p>
        )}
      </div>
    </section>
  );
}
```

**Step 2 — Open `Home.tsx` (or wherever the page is assembled).**
Import the Hero component:

```tsx
import { Hero } from '../components/Hero';
```

**Step 3 — Pass the FIRST article from the fetched list into Hero.**
Locate where articles are stored in state (e.g. `articles`, `news`, `posts`).
Above the return statement, derive:

```tsx
const featured = articles[0] ?? null;
```

**Step 4 — Place `<Hero />` as the FIRST element inside the return, before the
article grid:**

```tsx
<Hero
  featuredTitle={featured?.title ?? ''}
  featuredImageUrl={featured?.image ?? featured?.thumbnail ?? ''}
  featuredUrl={featured?.link ?? featured?.url ?? 'https://thestandard.co/homepage/'}
/>
```

**Step 5 — Remove any old hero / banner / intro section** that previously occupied
the top of the page. There must be exactly ONE hero block.

### Commit

```
feat(hero): add above-the-fold hero section with persuasive copy and dual CTAs

- Create Hero component with headline, sub-headline, and live-coverage indicator
- Primary CTA links to thestandard.co/homepage/
- Secondary CTA links to thestandard.co/news/
- Right column displays first fetched article as featured image
- Animated pulse dot on "Live Coverage" label
- Gradient overlay on image for legibility
- Skeleton placeholder shown while image is loading
```

### PR Title

`feat(hero): above-the-fold hero section with CTAs and featured image`

---

## PR-03 — Add social proof trust bar

**Branch:** `feat/social-proof-bar`

**Problem:** No trust signals exist. New visitors have no reason to engage.

### Steps

**Step 1 — Create `src/components/TrustBar.tsx`:**

```tsx
const TRUST_ITEMS = [
  { icon: '📰', label: '1M+ Monthly Readers' },
  { icon: '🏆', label: 'Award-Winning Journalism' },
  { icon: '🇹🇭', label: "Thailand's #1 Independent News" },
  { icon: '🔔', label: 'Breaking News 24 / 7' },
  { icon: '✅', label: 'Editorially Independent' },
  { icon: '🌏', label: 'English & Thai Coverage' },
];

export function TrustBar() {
  return (
    <div
      className='w-full bg-gray-50 border-y border-gray-100 py-4 overflow-x-auto
                    scrollbar-none'
    >
      <div
        className='flex items-center gap-10 px-6 lg:px-20 w-max lg:w-full
                      lg:justify-center'
      >
        {TRUST_ITEMS.map(({ icon, label }) => (
          <div
            key={label}
            className='flex items-center gap-2 text-sm font-medium
                       text-gray-500 whitespace-nowrap shrink-0'
          >
            <span className='text-base leading-none'>{icon}</span>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2 — Open `Home.tsx`.**
Import:

```tsx
import { TrustBar } from '../components/TrustBar';
```

Place `<TrustBar />` **immediately after** `<Hero />` and before the article grid:

```tsx
<Hero ... />
<TrustBar />
{/* article grid below */}
```

### Commit

```
feat(social-proof): add trust signal bar between hero and news feed

- Create TrustBar component with 6 credibility signals
- Horizontally scrollable on mobile, centred on desktop
- Renders immediately after the hero section
```

### PR Title

`feat(social-proof): add trust signal bar below hero`

---

## PR-04 — Redesign news cards with larger images and per-card CTA

**Branch:** `feat/news-card-redesign`

**Problem:**

- Article images are too small and lack visual weight.
- Cards have no category label or urgency signal.
- Clicking a card does not redirect anywhere — or goes to the wrong place.

### Steps

**Step 1 — Open the existing card component** (e.g. `NewsCard.tsx`, `ArticleCard.tsx`,
or wherever a single article is rendered).

**Step 2 — Replace the entire component** with:

```tsx
interface NewsCardProps {
  title: string;
  excerpt?: string;
  imageUrl: string;
  category?: string;
  publishedAt?: string;
  articleUrl: string; // ← must be the FULL thestandard.co article URL
}

export function NewsCard({
  title,
  excerpt,
  imageUrl,
  category,
  publishedAt,
  articleUrl,
}: NewsCardProps) {
  return (
    <a
      href={articleUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='group flex flex-col rounded-2xl overflow-hidden bg-white
                 shadow-md hover:shadow-xl transition-shadow duration-300
                 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500'
    >
      {/* ── Thumbnail ── */}
      <div className='relative w-full aspect-[16/9] overflow-hidden bg-gray-100'>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading='lazy'
            className='w-full h-full object-cover group-hover:scale-105
                       transition-transform duration-500 ease-out'
          />
        ) : (
          <div className='w-full h-full bg-gray-200 animate-pulse' />
        )}

        {/* Category badge */}
        {category && (
          <span
            className='absolute top-3 left-3 px-3 py-1 rounded-full
                           text-[11px] font-bold uppercase tracking-wide
                           bg-red-600 text-white shadow-sm'
          >
            {category}
          </span>
        )}
      </div>

      {/* ── Copy ── */}
      <div className='flex flex-col gap-2 p-5 flex-1'>
        <h3
          className='text-[15px] lg:text-base font-bold leading-snug
                       text-gray-900 group-hover:text-red-600 transition-colors
                       line-clamp-3'
        >
          {title}
        </h3>

        {excerpt && (
          <p className='text-sm text-gray-500 line-clamp-2 leading-relaxed'>{excerpt}</p>
        )}

        <div
          className='flex items-center justify-between mt-auto pt-4
                        border-t border-gray-100'
        >
          {publishedAt && <span className='text-xs text-gray-400'>{publishedAt}</span>}
          <span
            className='ml-auto text-xs font-semibold text-red-600
                           group-hover:underline'
          >
            Read now →
          </span>
        </div>
      </div>
    </a>
  );
}
```

**Step 3 — Open `Home.tsx` (or wherever the grid is rendered).**
Verify the article objects are mapped to `NewsCard` with `articleUrl` set to
`article.link` or `article.url` — whichever field contains the thestandard.co URL.

The grid wrapper must use:

```tsx
<section className='px-6 lg:px-20 py-16 max-w-screen-xl mx-auto'>
  <h2 className='text-2xl lg:text-3xl font-extrabold text-gray-900 mb-8'>
    Latest Stories
  </h2>
  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
    {articles.map((article) => (
      <NewsCard
        key={article.id ?? article.link}
        title={article.title}
        excerpt={article.excerpt ?? article.description}
        imageUrl={article.image ?? article.thumbnail}
        category={
          Array.isArray(article.category) ? article.category[0] : article.category
        }
        publishedAt={article.date ?? article.publishedAt}
        articleUrl={article.link ?? article.url}
      />
    ))}
  </div>
</section>
```

### Commit

```
feat(news-cards): redesign article cards with larger images and redirect CTA

- Replace old card with full 16:9 aspect-ratio thumbnail
- Add category badge overlay (red pill, top-left of image)
- Hover: image scale-105, title turns red, shadow elevates
- "Read now →" label with hover underline
- articleUrl wires every card click to the thestandard.co source article
- Responsive 1 / 2 / 3 column grid with max-w-screen-xl container
- Lazy image loading and animated skeleton placeholder
```

### PR Title

`feat(news-cards): redesign cards with large images, badges, and CTA redirect`

---

## PR-05 — Add bottom CTA conversion section

**Branch:** `feat/bottom-cta`

**Problem:** The page ends without directing the user anywhere.
A homepage must open and close with a clear action.

### Steps

**Step 1 — Create `src/components/BottomCTA.tsx`:**

```tsx
export function BottomCTA() {
  return (
    <section
      className='w-full bg-gray-950 text-white px-6 lg:px-20 py-24
                        flex flex-col items-center text-center gap-6'
    >
      <span className='text-xs font-bold tracking-widest text-red-400 uppercase'>
        Don't miss a beat
      </span>

      <h2
        className='text-4xl lg:text-5xl font-extrabold max-w-2xl leading-tight
                     tracking-tight'
      >
        The news that matters.
        <br />
        <span className='text-red-500'>Read it first.</span>
      </h2>

      <p className='text-gray-400 text-lg max-w-lg leading-relaxed'>
        Join over a million readers who rely on The Standard for clear, independent, and
        in-depth coverage of Thailand and the world.
      </p>

      <div className='flex flex-wrap justify-center gap-4 mt-4'>
        {/* Primary */}
        <a
          href='https://thestandard.co/homepage/'
          target='_blank'
          rel='noopener noreferrer'
          className='px-10 py-4 rounded-full bg-red-600 text-white text-base
                     font-bold shadow-lg hover:bg-red-500 active:scale-[0.97]
                     transition-all duration-150'
        >
          Go to The Standard →
        </a>

        {/* Secondary */}
        <a
          href='https://thestandard.co/membership/?mbsaction=signup'
          target='_blank'
          rel='noopener noreferrer'
          className='px-10 py-4 rounded-full border-2 border-white/40 text-white
                     text-base font-semibold hover:bg-white hover:text-gray-900
                     transition-all duration-150'
        >
          Create Free Account
        </a>
      </div>
    </section>
  );
}
```

**Step 2 — Open `Home.tsx`.**
Import:

```tsx
import { BottomCTA } from '../components/BottomCTA';
```

Place `<BottomCTA />` as the **last section** before `</main>` / the closing root div,
after the article grid:

```tsx
  {/* article grid */}
  <BottomCTA />
</main>
```

### Commit

```
feat(bottom-cta): add full-width conversion section at end of page

- Dark bg section mirrors hero CTA to bookend the page
- "The news that matters. Read it first." headline
- Primary CTA → thestandard.co/homepage/
- Secondary CTA → thestandard.co membership sign-up
- Responsive flex layout, centred on all breakpoints
```

### PR Title

`feat(bottom-cta): add bottom-of-page conversion section`

---

## PR-06 — Global spacing, typography, and whitespace audit

**Branch:** `refactor/global-spacing-typography`

**Problem:**

- Sections have inconsistent vertical rhythm.
- Font sizes do not scale fluidly on mobile.
- Decorative spacers and dead `<div>`s add visual noise.

### Steps

**Step 1 — Open `index.css` (or the global stylesheet).**
Add these rules at the top (after any @import / @tailwind directives):

```css
/* ── Global typography ── */
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

body {
  font-size: 16px;
  line-height: 1.65;
  color: #111827; /* gray-900 */
}

h1 {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  line-height: 1.08;
}
h2 {
  font-size: clamp(1.75rem, 3.5vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
}
h3 {
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 600;
  line-height: 1.35;
}

/* ── Hide scrollbar on trust bar ── */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

**Step 2 — Open `tailwind.config.ts`.**
Add a custom spacing token inside `theme.extend`:

```ts
theme: {
  extend: {
    spacing: {
      section: '5rem',   // use as py-[5rem] or className="py-20"
    },
    maxWidth: {
      content: '1280px', // use as max-w-content for all section containers
    },
  },
},
```

**Step 3 — Audit `Home.tsx` and every section component.**
For each top-level `<section>`:

- Ensure it has `py-20 px-6 lg:px-20` (section vertical rhythm).
- Wrap inner content in `<div className="max-w-screen-xl mx-auto">` if not already.

**Step 4 — Remove all of the following if found:**

- Any `<hr />` used purely as a visual spacer.
- Any empty `<div className="h-8" />` or similar spacer divs.
- Any `mb-XX` on the last child of a section (outer `py` handles the gap).

**Step 5 — Check all `<img>` tags** — every image must have an explicit `alt` attribute.
Missing alts break accessibility and SEO.

### Commit

```
refactor(layout): global spacing, fluid typography, and whitespace cleanup

- Add fluid clamp() font sizes for h1/h2/h3 in global CSS
- Enable font smoothing and smooth scroll on html element
- Add scrollbar-none utility for TrustBar horizontal scroll
- Enforce py-20 / px-6 lg:px-20 rhythm on all sections
- Wrap section content in max-w-screen-xl mx-auto
- Remove decorative spacer divs and redundant hr elements
- Add missing alt attributes to all img tags
```

### PR Title

`refactor(layout): global spacing, fluid typography, and whitespace cleanup`

---

## Quick reference — all 6 PRs in order

| #   | Branch                               | Commit prefix        | What it does                                     |
| --- | ------------------------------------ | -------------------- | ------------------------------------------------ |
| 01  | `fix/navbar-sticky-overlap`          | `fix(navbar)`        | Navbar no longer overlaps content                |
| 02  | `feat/hero-above-fold`               | `feat(hero)`         | Persuasive hero with CTAs and featured image     |
| 03  | `feat/social-proof-bar`              | `feat(social-proof)` | Trust signal bar below hero                      |
| 04  | `feat/news-card-redesign`            | `feat(news-cards)`   | Large-image cards, category badges, CTA redirect |
| 05  | `feat/bottom-cta`                    | `feat(bottom-cta)`   | Closing conversion section                       |
| 06  | `refactor/global-spacing-typography` | `refactor(layout)`   | Spacing, typography, whitespace                  |

---

## What "done" looks like

After all 6 PRs are merged:

- [ ] Navbar is always visible and never hides content
- [ ] Hero headline + CTA visible without any scrolling on 1280px and 390px viewports
- [ ] Every CTA button opens the correct thestandard.co URL in a new tab
- [ ] Each news card click redirects to the article on thestandard.co
- [ ] Trust bar is visible between hero and news feed
- [ ] Bottom of page ends with a dark CTA section — not just a list of cards
- [ ] No decorative spacer elements remain
- [ ] All images have `alt` text
- [ ] Font sizes scale fluidly on mobile without zooming

---

## Notes for Cursor

- **Do not rename existing hooks or API utilities.** Only UI layer changes.
- **Do not add any new dependencies** — everything uses existing Tailwind + React.
- **If a component file does not exist yet**, create it in `src/components/`.
- **If you are unsure of a field name** from the API (e.g. `link` vs `url`),
  add a console.log in development to inspect one article object before writing
  the component.
- **Do not add any hardcoded news content.** All article data must come from the
  existing fetch/hook that calls thestandard.co.
