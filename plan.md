# UI/UX Modernization Plan (Phase 2)

This plan defines incremental, production-safe improvements. Each achievement ships in its own PR with explicit acceptance criteria and validation.

## Achievement 1: Typography Rhythm + Spacing System

### Goal

Create a cleaner reading hierarchy and consistent spacing on mobile and desktop.

### Scope

- Refine heading, body, and CTA text scale for better scanability.
- Normalize vertical rhythm between hero, feature blocks, category sections, and cards.
- Reduce visual noise in overly dense regions (buttons, navbar labels, section cards).

### Implementation Detail

- Update shared component classes in `src/index.css`:
  - title scale, section headings, body copy scale
  - CTA sizing and spacing
  - card padding and section spacing
- Apply targeted layout adjustments in:
  - `src/components/navbar.tsx`
  - `src/pages/home.tsx`
  - `src/pages/posts.tsx`

### Acceptance Criteria

- Headings are visually distinct from body content at all breakpoints.
- CTA text is clear and not oversized relative to card content.
- No section feels cramped on mobile (`<640px`).
- Lint/build remain green.

### Validation

- `pnpm lint`
- `pnpm build`

---

## Achievement 2: Social Proof + Trust Layer

### Goal

Increase credibility and conversion confidence without misleading claims.

### Scope

- Add a dedicated social-proof strip under hero area.
- Add concise testimonial-style trust statements (truthful, generic).
- Keep source credibility front-and-center.

### Implementation Detail

- Add a trust/social proof section in `src/pages/home.tsx`:
  - source credibility chips
  - publisher trust framing
  - proof-oriented microcopy
- Style with existing design system primitives in `src/index.css`.

### Acceptance Criteria

- Social proof appears above first content grid.
- Trust signals remain readable on mobile.
- Wording avoids fabricated entities/metrics.
- Lint/build remain green.

### Validation

- `pnpm lint`
- `pnpm build`

---

## Achievement 3: UX Recovery States + Guidance

### Goal

Ensure users always have a clear next action when content or media is unavailable.

### Scope

- Improve empty-state messaging for home and category pages.
- Improve image fallback messaging at card level.
- Add recovery CTAs routing to internal pages.

### Implementation Detail

- `src/pages/home.tsx`: no-content state with direct desk CTAs.
- `src/pages/posts.tsx`: category-empty state with recovery navigation.
- `src/components/post.tsx`: image-fallback explanation + actionable alternative.

### Acceptance Criteria

- No dead-end states exist.
- All fallbacks provide at least one useful internal action.
- All CTA routes resolve to valid app pages.
- Lint/build remain green.

### Validation

- `pnpm lint`
- `pnpm build`

---

## PR Strategy

1. `docs(plan): add phase-2 UI/UX incremental roadmap`
2. `feat(ui): improve typography rhythm and spacing hierarchy`
3. `feat(ui): add social proof and trust layer to homepage`
4. `feat(ux): improve empty-state recovery and fallback guidance`

Each PR should remain focused and reviewable, with concise before/after intent in description.
