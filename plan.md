# High-End Productized News Experience Plan

This roadmap transforms the current feed into a premium, content-rich, SEO-aware reading product with clear conversion paths and robust fallback behavior.

---

## Outcome We Are Designing For

- Visitors instantly understand the value proposition.
- Users can move from headline scan -> deep reading with minimal friction.
- Every click has an internal destination first (no dead ends).
- The site remains fast on mobile while content depth increases.
- Build pipeline pre-generates structured content artifacts to improve reliability.

---

## Phase 1 - Brand-Led Landing Experience

### Objective

Elevate the homepage from feed listing to editorial product entry point.

### Deliverables

- Strong headline + subheadline with editorial positioning.
- High-intent primary CTA and meaningful secondary CTA.
- Quick-link category chips for direct navigation.
- Benefits/Features section with concise utility framing.
- Trust strip and social proof framing.
- Success indicators that update from live/cached data.
- Content offer block with guided next action.

### UX Principles

- Clarity first: one primary action at a time.
- High contrast and readable line lengths.
- Short, action-oriented copy.
- Mobile parity with desktop hierarchy.

### Acceptance Criteria

- Hero clearly communicates “what this is” and “why now”.
- CTA labels are natural, specific, and non-generic.
- Content modules are scannable within 5-10 seconds.
- No block feels visually disconnected from the page system.

---

## Phase 2 - Internal Reading Journey (Multi-Page)

### Objective

Provide a dedicated internal read page for each story and reduce dependency on external navigation.

### Deliverables

- New route: `/read/:id` for structured internal story reading.
- Story page layout:
  - title, excerpt, categories
  - hero image
  - rendered content body
  - “continue exploring” CTA
  - “browse original publisher” secondary action
- Card CTA behavior:
  - Primary -> internal read page (`/read/:id`)
  - Secondary -> external source link

### Data Model Additions

- `story-pages.json` as structured content artifact
- fields:
  - `id`, `title`, `excerpt`, `contentHtml`, `date`
  - `categoryNames`, `imageUrl`, `sourceUrl`

### Acceptance Criteria

- Clicking “Read now” always opens internal reader page.
- Story page renders even when remote source is slow/unavailable.
- External source remains accessible as a secondary action.

---

## Phase 3 - Build-Time Content Generation in CI/CD

### Objective

Pre-build story data so runtime is reliable, fast, and consistent across deploys.

### Deliverables

- New script to compile structured story index from cached inputs:
  - `cachescripts/build-story-pages-index.sh`
- Deployment workflow step to run script before lint/build.
- `story-pages.json` generated in CI during deploy.

### Pipeline Inputs

- `posts.json`
- `categories.json`
- `images.json`

### Pipeline Output

- `story-pages.json` for reader routes.

### Acceptance Criteria

- Deploy workflow always generates story index.
- Build does not require live API for internal read pages.
- Generated story index is valid JSON and non-empty when posts exist.

---

## Phase 4 - SEO and Information Architecture Expansion

### Objective

Increase discoverability and page depth by adding meaningful internal content pages.

### Deliverables

- Expand top-level and contextual routes (e.g., about, methodology, coverage pages).
- Add topic landing routes (e.g., `/topics/business`, `/topics/world`, `/topics/thailand`, `/topics/culture`) with unique copy and internal CTA paths.
- Add internal linking between:
  - homepage modules
  - category pages
  - story pages
- Strengthen metadata consistency (title/description/open graph patterns) with per-page runtime mapping.
- Ensure CTA language is editorial-grade and conversion-oriented across all templates.

### Acceptance Criteria

- Site exposes multiple crawlable internal paths.
- Every key section links to at least one deeper destination.
- Metadata is coherent with on-page messaging.
- Topic pages provide unique, non-duplicate content blocks and clear next actions.
- Share previews stay consistent with each page’s actual intent.

---

## Phase 5 - Resilience & UX Recovery States

### Objective

Ensure graceful behavior under missing media/content/network issues.

### Deliverables

- Empty-state modules for home and category views.
- Image fallback messaging with guidance.
- Retry actions and recovery navigation CTAs.
- Internal fallback paths when source links are absent.

### Acceptance Criteria

- No dead-end user flows.
- Fallback states remain informative and actionable.
- Recovery CTAs route to valid internal pages.

---

## Content & Copy Standard (Applies Across All Phases)

- Use specific action verbs: “Read now”, “Open the daily brief”, “Explore world coverage”.
- Avoid generic/placeholder terms like “Click this out”.
- Keep CTA microcopy <= 5 words where possible.
- Write for decision-makers: concise, context-rich, low fluff.
- Keep trust claims factual and non-fabricated.

---

## PR-by-PR Execution Plan

1. `docs(plan): add high-end UX and multi-page delivery roadmap`
2. `feat(content): add internal story reader route and CTA flow`
3. `ci(content): generate story-pages index during deployment`
4. `feat(ui): improve premium copy and button messaging`
5. `feat(ux): harden recovery states for media/content fallbacks`

Each PR should remain focused, testable, and independently deployable.
