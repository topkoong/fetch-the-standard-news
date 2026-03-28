# Engineering Standards — Enterprise TypeScript (Netflix-Grade)

**Project:** `fetch-the-standard-news`  
**Stack:** Vite + Preact + TypeScript + TailwindCSS

> Hand this file to Cursor alongside `IMPROVEMENTS.md` and `plan.md`.
> Every instruction here is **binding**. If generated code violates a rule in this document, Cursor must fix it before moving to the next step.

---

## 1. The Prime Directive

> "Code is read far more than it is written. Name things for the next engineer, not for the compiler."

At Netflix scale, any engineer can open any file and understand it in under 60 seconds. Every variable, type, function, component, and file in this project must achieve that standard.

---

## 2. File & Folder Structure

```
src/
├── assets/                         # Static assets (SVG icons, fonts)
├── components/
│   ├── common/                     # Shared, layout-agnostic primitives
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Skeleton.tsx
│   │   └── index.ts                # Barrel export for every subfolder
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── index.ts
│   └── sections/                   # Full-page section blocks
│       ├── HeroSection.tsx
│       ├── NewsGrid.tsx
│       ├── TrustBar.tsx
│       ├── CtaSection.tsx
│       └── index.ts
├── hooks/
│   ├── useStandardNews.ts          # Data-fetching hook
│   ├── useBreakpoint.ts
│   └── index.ts
├── services/
│   ├── standardNewsService.ts      # API/scraping integration layer
│   └── index.ts
├── store/                          # Global state (if added later)
├── types/
│   ├── news.types.ts               # Domain types
│   ├── api.types.ts                # API response shapes
│   ├── ui.types.ts                 # UI/component prop types
│   └── index.ts
├── utils/
│   ├── formatters.ts               # Pure data-transformation helpers
│   ├── validators.ts
│   └── index.ts
├── constants/
│   ├── routes.constants.ts
│   ├── api.constants.ts
│   └── index.ts
├── config/
│   └── app.config.ts               # Environment-aware runtime config
└── pages/
    ├── HomePage.tsx
    └── StoryReadPage.tsx
```

### Rules

- **Folders**: `kebab-case` — never `CamelCase`, never `snake_case`
- **Component files**: `PascalCase.tsx` — always matches the exported component name exactly
- **Non-component TS files**: `camelCase.suffix.ts` where suffix is the module role: `.types`, `.hook`, `.service`, `.utils`, `.constants`, `.config`
- **Every folder has an `index.ts` barrel file** — no direct deep imports between feature folders
- **No `index.tsx` for components** — always use the component name: `Button.tsx`, not `index.tsx`

---

## 3. TypeScript: All Domain Types

### 3.1 `src/types/news.types.ts`

```typescript
/**
 * Represents a single news article as parsed from The Standard homepage.
 * All fields are required and explicitly typed — no implicit `any`.
 */
export interface NewsArticle {
  readonly id: string; // Derived: slugified from sourceUrl path segment
  readonly title: string;
  readonly excerpt: string; // First ~160 chars of body copy or alt text fallback
  readonly imageUrl: string;
  readonly sourceUrl: string; // Canonical link to thestandard.co article
  readonly categoryName: string;
  readonly categorySlug: string; // URL-safe, lowercased, hyphenated
  readonly publishedAt: string; // ISO 8601 — e.g. "2026-03-28T10:00:00Z"
}

/**
 * A lightweight reference used in list views — avoids carrying full article payload.
 */
export type NewsArticlePreview = Pick<
  NewsArticle,
  'id' | 'title' | 'imageUrl' | 'sourceUrl' | 'categoryName' | 'publishedAt'
>;

/**
 * Full story as compiled by the build-time script in Phase 3.
 * The `contentHtml` field is only available on build-generated story pages.
 */
export interface StoryPage extends NewsArticle {
  readonly contentHtml: string;
}

/**
 * Category domain entity — also used for topic landing pages (Phase 4).
 */
export interface NewsCategory {
  readonly slug: string; // e.g. "politics", "tech", "world"
  readonly displayName: string; // Thai display label: "การเมือง", "เทคโนโลยี"
  readonly sourceUrl: string; // https://thestandard.co/category/news/politics/
  readonly articleCount: number;
}

/**
 * Stat item displayed in TrustBar — always factual, never fabricated.
 */
export interface TrustStatItem {
  readonly value: string; // e.g. "10M+", "#1", "2017"
  readonly label: string; // Short description label (Thai)
}
```

---

### 3.2 `src/types/api.types.ts`

```typescript
/**
 * Generic wrapper for all async data-fetching states.
 * Discriminated union — exhaustive switch/case guarantees all states are handled.
 *
 * @example
 * switch (result.status) {
 *   case 'idle':    // show placeholder
 *   case 'loading': // show skeletons
 *   case 'success': // render data
 *   case 'error':   // show error state
 * }
 */
export type AsyncResult<TData> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: TData }
  | { readonly status: 'error'; readonly error: FetchError };

/**
 * Structured error — never throw raw Error objects across module boundaries.
 */
export interface FetchError {
  readonly message: string;
  readonly statusCode?: number;
  readonly timestamp: string; // ISO 8601
}

/**
 * Shape returned by standardNewsService.fetchHomepageArticles()
 */
export interface HomepageApiResponse {
  readonly articles: NewsArticle[];
  readonly fetchedAt: string; // ISO 8601 — used for stale-content detection
  readonly sourceUrl: string; // https://thestandard.co/homepage/
}

/**
 * Index file generated by the CI build script (Phase 3).
 * Stored as public/story-pages.json and imported at runtime.
 */
export interface StoryPagesIndex {
  readonly version: string; // Semver: "1.0.0" — bump on schema change
  readonly generatedAt: string; // ISO 8601
  readonly totalCount: number;
  readonly stories: StoryPage[];
}
```

---

### 3.3 `src/types/ui.types.ts`

```typescript
/**
 * Card display variant — controls image ratio and title size.
 * 'feature' = first card in a row (2-col span on desktop).
 * 'standard' = regular grid card.
 * 'compact' = sidebar/list item (no image).
 */
export type CardVariant = 'feature' | 'standard' | 'compact';

/**
 * Breakpoint tokens — mirror Tailwind's default breakpoints.
 */
export type BreakpointKey = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Button intent — drives color and weight, never hard-coded per instance.
 */
export type ButtonIntent = 'primary' | 'secondary' | 'ghost';

/**
 * Button size scale.
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Navigation link item — used in Navbar and Footer.
 */
export interface NavLinkItem {
  readonly label: string;
  readonly href: string;
  readonly isExternal: boolean;
  readonly isActive?: boolean;
}

/**
 * SEO metadata shape injected into <head> per page.
 */
export interface PageMeta {
  readonly title: string;
  readonly description: string;
  readonly ogImageUrl?: string;
  readonly canonicalUrl?: string;
}
```

---

## 4. Component Naming & Prop Interface Rules

### 4.1 Prop interface naming

**Rule:** Every component's prop type is named `<ComponentName>Props`. Always an `interface`, never an inline object type or `type` alias.

```typescript
// ✅ CORRECT
interface NewsCardProps {
  readonly article: NewsArticlePreview
  readonly variant: CardVariant
  readonly onCardClick?: (articleId: string) => void
}

export function NewsCard({ article, variant, onCardClick }: NewsCardProps) { ... }

// ❌ WRONG — anonymous prop shapes
export function NewsCard({ article, variant }: { article: any; variant: string }) { ... }

// ❌ WRONG — suffix is not 'Props'
interface NewsCardPropTypes { ... }
type NewsCardConfig = { ... }
```

### 4.2 Children-bearing components

```typescript
import type { ComponentChildren } from 'preact';

interface SectionWrapperProps {
  readonly children: ComponentChildren;
  readonly className?: string;
  readonly as?: keyof JSX.IntrinsicElements; // 'section' | 'div' | 'article'
}
```

### 4.3 Event handler naming

| Pattern          | ✅ Correct                            | ❌ Wrong                          |
| ---------------- | ------------------------------------- | --------------------------------- |
| Prop name        | `onCardClick`, `onMenuToggle`         | `click`, `handleClick`, `clickFn` |
| Internal handler | `handleCardClick`, `handleMenuToggle` | `onClick`, `doClick`, `fn`        |
| Async handler    | `handleArticleFetch`                  | `fetch`, `getData`, `load`        |

```typescript
// Prop definition
interface HeroSectionProps {
  readonly featuredArticle: NewsArticlePreview
  readonly onReadNowClick: (articleId: string) => void   // ← "on" prefix always
}

// Internal implementation
function HeroSection({ featuredArticle, onReadNowClick }: HeroSectionProps) {
  // Handler is "handle" + the prop event name without "on"
  function handleReadNowClick(): void {
    onReadNowClick(featuredArticle.id)
  }
  ...
}
```

---

## 5. Hook Naming & Return Types

**Rule:** All custom hooks are named `use<Domain><Noun>`. Returns must be explicitly typed.

```typescript
// src/hooks/useStandardNews.ts

import type { AsyncResult, HomepageApiResponse } from '@/types'

export interface UseStandardNewsReturn {
  readonly result: AsyncResult<HomepageApiResponse>
  readonly refetch: () => Promise<void>
}

export function useStandardNews(): UseStandardNewsReturn {
  ...
}
```

```typescript
// src/hooks/useBreakpoint.ts

import type { BreakpointKey } from '@/types'

export interface UseBreakpointReturn {
  readonly activeBreakpoint: BreakpointKey
  readonly isAbove: (breakpoint: BreakpointKey) => boolean
  readonly isBelow: (breakpoint: BreakpointKey) => boolean
}

export function useBreakpoint(): UseBreakpointReturn { ... }
```

**Never return plain tuples from hooks** — named object shapes are self-documenting:

```typescript
// ✅ CORRECT — named, readable
const { result, refetch } = useStandardNews();

// ❌ WRONG — positional, fragile
const [data, loading, error, refetch] = useStandardNews();
```

---

## 6. Service Layer Naming

All API/IO work lives in `src/services/`. Services are plain modules (no classes), exporting named async functions.

```typescript
// src/services/standardNewsService.ts

import type { HomepageApiResponse, StoryPagesIndex } from '@/types'
import { API_CONSTANTS } from '@/constants'

/**
 * Fetches and parses the live homepage feed from thestandard.co.
 * Throws FetchError on non-2xx responses or parse failure.
 */
export async function fetchHomepageArticles(): Promise<HomepageApiResponse> { ... }

/**
 * Loads the pre-built story index generated during CI (Phase 3).
 * Falls back gracefully when the JSON file is absent.
 */
export async function loadStoryPagesIndex(): Promise<StoryPagesIndex | null> { ... }

/**
 * Looks up a single story by ID from the pre-built index.
 */
export async function findStoryById(storyId: string): Promise<StoryPage | null> { ... }
```

**Naming rules:**

- Functions that retrieve a collection: `fetch<Noun>s` or `load<Noun>s`
- Functions that retrieve one item: `find<Noun>By<Key>`
- Functions that write/mutate: `create<Noun>`, `update<Noun>`, `delete<Noun>`
- Never: `get`, `getData`, `doFetch`, `retrieveStuff`

---

## 7. Constants Naming

```typescript
// src/constants/api.constants.ts

/**
 * All external URLs this app depends on.
 * Never hardcode these inline — always reference API_CONSTANTS.
 */
export const API_CONSTANTS = {
  THE_STANDARD_HOMEPAGE_URL: 'https://thestandard.co/homepage/',
  THE_STANDARD_BASE_URL: 'https://thestandard.co',
  STORY_PAGES_INDEX_PATH: '/story-pages.json',
  FETCH_TIMEOUT_MS: 8_000,
  STALE_CONTENT_THRESHOLD_MS: 5 * 60 * 1_000, // 5 minutes
} as const;

export type ApiConstantsKey = keyof typeof API_CONSTANTS;
```

```typescript
// src/constants/routes.constants.ts

export const ROUTE_PATHS = {
  HOME: '/',
  STORY_READ: '/read/:id',
  TOPIC: '/topics/:categorySlug',
  ABOUT: '/about',
} as const;

/**
 * Type-safe route builder — never concatenate strings directly.
 */
export function buildStoryReadPath(storyId: string): string {
  return `/read/${storyId}`;
}

export function buildTopicPath(categorySlug: string): string {
  return `/topics/${categorySlug}`;
}
```

**Rules:**

- All constant objects: `SCREAMING_SNAKE_CASE`
- `as const` on every constant object — prevents widening
- No magic strings or numbers inline — always reference the constant
- Numeric literals over 999: use `_` separator (`1_000`, `8_000`, `1_000_000`)

---

## 8. Variable Naming Inside Functions

### Boolean variables: always `is`, `has`, `can`, `should` prefix

```typescript
// ✅ CORRECT
const isLoading: boolean = result.status === 'loading';
const hasArticles: boolean = articles.length > 0;
const isFeatureCard: boolean = variant === 'feature';
const canRetry: boolean = fetchAttemptCount < MAX_RETRY_COUNT;

// ❌ WRONG
const loading = true;
const articles_exist = false;
const feature = variant === 'feature';
```

### Collections: always plural

```typescript
// ✅ CORRECT
const articles: NewsArticle[] = []
const categorySlugList: string[] = categories.map(c => c.slug)
const trustStatItems: TrustStatItem[] = [...]

// ❌ WRONG
const articleData = []
const categoryInfo = []
const stats = []
```

### Derived/computed values: noun phrases, not verbs

```typescript
// ✅ CORRECT
const featuredArticle: NewsArticlePreview = articles[0];
const remainingArticles: NewsArticlePreview[] = articles.slice(1);
const formattedPublishedDate: string = formatRelativeDate(article.publishedAt);

// ❌ WRONG
const first = articles[0];
const rest = articles.slice(1);
const date = formatRelativeDate(article.publishedAt);
```

### Callbacks / iteratee params: always typed, never single-letter

```typescript
// ✅ CORRECT
const articleIds = articles.map((article: NewsArticle) => article.id);
const publishedArticles = articles.filter((article: NewsArticle) =>
  Boolean(article.publishedAt),
);

// ❌ WRONG
const ids = articles.map((a) => a.id);
const filtered = articles.filter((x) => x.publishedAt);
```

---

## 9. Utility Function Naming

All utilities in `src/utils/formatters.ts` and `src/utils/validators.ts` follow this pattern:

```typescript
// src/utils/formatters.ts

/**
 * Converts an ISO 8601 timestamp to Thai locale relative time.
 * @example formatRelativeDate("2026-03-28T10:00:00Z") → "2 ชั่วโมงที่แล้ว"
 */
export function formatRelativeDate(isoTimestamp: string): string { ... }

/**
 * Derives a URL-safe, lowercase, hyphenated ID from a source URL path.
 * @example deriveArticleId("https://thestandard.co/bma-ai-traffic/") → "bma-ai-traffic"
 */
export function deriveArticleId(sourceUrl: string): string { ... }

/**
 * Truncates body copy to the specified character limit with ellipsis.
 */
export function truncateExcerpt(text: string, maxLength: number = 160): string { ... }

/**
 * Ensures an image URL is absolute. Falls back to a local placeholder asset.
 */
export function resolveImageUrl(rawUrl: string): string { ... }
```

```typescript
// src/utils/validators.ts

/**
 * Guards against empty/malformed articles before rendering.
 */
export function isValidNewsArticle(candidate: unknown): candidate is NewsArticle { ... }

/**
 * Checks whether a URL points to an external domain.
 */
export function isExternalUrl(url: string): boolean { ... }
```

**Naming pattern:** `verb + noun` — always describes what the function _does_, not what it _returns_.

- `format`, `derive`, `resolve`, `build`, `parse` → transformers
- `is`, `has`, `can` → predicates / type guards
- `validate`, `assert` → validators that throw on failure

---

## 10. Enum vs. Union Type

**Rule:** Prefer `union types` over `enum` in TypeScript for external-facing values. Use `const enum` only for internal integer flags never exposed as strings.

```typescript
// ✅ CORRECT — string union (tree-shakeable, readable in runtime errors)
export type CardVariant = 'feature' | 'standard' | 'compact';
export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

// ✅ CORRECT — const object as enum substitute when you need iteration
export const CATEGORY_SLUGS = {
  POLITICS: 'politics',
  BUSINESS: 'business',
  TECH: 'tech',
  WORLD: 'world',
  THAILAND: 'thailand',
  CULTURE: 'culture',
} as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[keyof typeof CATEGORY_SLUGS];

// ❌ WRONG — TypeScript enum (emits runtime code, not tree-shakeable)
enum CardVariant {
  Feature = 'feature',
  Standard = 'standard',
}
```

---

## 11. `as const`, `readonly`, and Immutability

**Rule:** All data flowing from the API or config layer is `readonly`. Never mutate fetched data — derive new objects.

```typescript
// ✅ Correct — immutable interface fields
interface NewsArticle {
  readonly id: string
  readonly title: string
}

// ✅ Correct — immutable arrays from service layer
export async function fetchHomepageArticles(): Promise<readonly NewsArticle[]> { ... }

// ✅ Correct — const config never mutated
const APP_CONFIG = {
  MAX_HERO_ARTICLES: 1,
  MAX_GRID_ARTICLES: 9,
  SKELETON_CARD_COUNT: 9,
} as const

// ❌ Wrong — mutable data from fetch
let articles: NewsArticle[] = await fetchHomepageArticles()
articles.push(extraArticle)  // This must never happen
```

---

## 12. File-Level Naming Checklist (Cursor must verify before each commit)

Before generating or modifying any file, Cursor must confirm all of the following:

```
[ ] Component file name matches exported function name exactly (PascalCase)
[ ] Prop interface is named <ComponentName>Props
[ ] All props are readonly
[ ] No `any` type present anywhere in the file
[ ] All boolean variables start with is/has/can/should
[ ] All collection variables are plural nouns
[ ] All async functions return Promise<ExplicitType> — not Promise<any>
[ ] All event handler props start with "on", all internal handlers start with "handle"
[ ] No magic strings or numbers — all reference named constants
[ ] Every exported function has a JSDoc comment (at minimum one line)
[ ] Barrel index.ts updated if a new export was added
[ ] `as const` applied to all constant objects
```

---

## 13. Full Per-Phase Type Coverage Map

This maps every deliverable in `plan.md` to the type it must use. Cursor must not create any deliverable without its corresponding type being defined first.

| Deliverable            | Type/Interface Required                                     |
| ---------------------- | ----------------------------------------------------------- |
| Hero section           | `NewsArticlePreview`, `HeroSectionProps`                    |
| News card              | `NewsArticlePreview`, `CardVariant`, `NewsCardProps`        |
| Trust bar              | `TrustStatItem[]`, `TrustBarProps`                          |
| CTA section            | `CtaSectionProps` (optional href overrides)                 |
| Navbar                 | `NavLinkItem[]`, `NavbarProps`                              |
| Footer                 | `NavLinkItem[]`, `FooterProps`                              |
| Story read page        | `StoryPage`, `PageMeta`, `StoryReadPageProps`               |
| Story pages index (CI) | `StoryPagesIndex`, `StoryPage[]`                            |
| Topic landing page     | `NewsCategory`, `PageMeta`, `TopicPageProps`                |
| useStandardNews hook   | `UseStandardNewsReturn`, `AsyncResult<HomepageApiResponse>` |
| standardNewsService    | `HomepageApiResponse`, `StoryPagesIndex`, `FetchError`      |
| Skeleton card          | `SkeletonCardProps` (just `variant: CardVariant`)           |
| Empty state            | `EmptyStateProps` (message, ctaLabel, ctaHref)              |
| Button primitive       | `ButtonIntent`, `ButtonSize`, `ButtonProps`                 |
| Badge primitive        | `BadgeProps` (label, intent)                                |

---

## 14. `tsconfig.json` Requirements

Cursor must ensure these flags are enabled in `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "strict": true, // Enables all strict checks
    "noImplicitAny": true, // No silent `any`
    "strictNullChecks": true, // null/undefined are distinct types
    "noUncheckedIndexedAccess": true, // arr[0] returns T | undefined
    "exactOptionalPropertyTypes": true, // ? and undefined are distinct
    "noImplicitReturns": true, // All code paths must return
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./src/*"] // Enables @/ absolute imports
    }
  }
}
```

---

## 15. Conventional Commit Reference for This Project

| Scope            | Maps to                                 |
| ---------------- | --------------------------------------- |
| `(hero)`         | HeroSection component                   |
| `(navbar)`       | Navbar component                        |
| `(cards)`        | NewsCard, NewsGrid components           |
| `(cta)`          | CtaSection component                    |
| `(social-proof)` | TrustBar component                      |
| `(layout)`       | Spacing, containers, page structure     |
| `(types)`        | Anything in `src/types/`                |
| `(services)`     | Anything in `src/services/`             |
| `(hooks)`        | Anything in `src/hooks/`                |
| `(constants)`    | Anything in `src/constants/`            |
| `(ci)`           | GitHub Actions workflows, build scripts |
| `(story-reader)` | /read/:id route and StoryReadPage       |
| `(topics)`       | /topics/:categorySlug routes            |
| `(a11y)`         | Accessibility fixes                     |
| `(perf)`         | Performance — loading, bundle, LCP      |
| `(config)`       | tsconfig, vite.config, tailwind.config  |

**Full commit message format:**

```
type(scope): imperative short description (max 72 chars)

[optional body — what & why, not how]
[optional footer — Closes #issue]
```

---

## 16. ESLint Rules to Enforce (add to `.eslintrc`)

```jsonc
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/consistent-type-imports": ["error", { "prefer": "type-imports" }],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "interface",
        "format": ["PascalCase"],
        "custom": { "regex": "^[A-Z]", "match": true }
      },
      { "selector": "typeAlias", "format": ["PascalCase"] },
      { "selector": "enum", "format": ["UPPER_CASE"] },
      {
        "selector": "variable",
        "types": ["boolean"],
        "format": ["camelCase"],
        "prefix": ["is", "has", "can", "should"]
      },
      { "selector": "function", "format": ["camelCase", "PascalCase"] }
    ],
    "no-magic-numbers": ["error", { "ignore": [0, 1, -1], "ignoreArrayIndexes": true }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

---

_This document is the single source of truth for code style. `IMPROVEMENTS.md` tells Cursor **what** to build. `plan.md` tells Cursor **why**. This document tells Cursor **how to write it**. All three must be read together._
