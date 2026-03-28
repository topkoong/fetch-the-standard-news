## Execution Order

This plan is delivered across three documents. Read all three before writing any code.

| Document                   | Role                                                  |
| -------------------------- | ----------------------------------------------------- |
| `ENGINEERING_STANDARDS.md` | How to write all code — naming, types, file structure |
| `IMPROVEMENTS.md`          | Phase 1 implementation — 9 PRs, UI/UX, components     |
| `plan.md` (this file)      | Phases 2–5 — reader route, CI, SEO, resilience        |

### Phase 1 PRs → see IMPROVEMENTS.md (PRs 1–9)

All hero, navbar, cards, CTA, trust bar, spacing, skeleton, a11y, and perf work.

Two Phase 1 deliverables not yet in IMPROVEMENTS.md — add as PR 10 and PR 11:

**PR 10**
Branch: `feat/category-chips`
Commit: `feat(nav): add quick-link category chips below hero for direct topic navigation`
Deliverable: A horizontal scrollable row of pill buttons (Politics, Business, Tech, World, Thailand, Culture) each linking to `/topics/:categorySlug`.

**PR 11**
Branch: `feat/benefits-section`
Commit: `feat(sections): add editorial benefits block communicating site value proposition`
Deliverable: A 3-column grid section between the trust bar and news feed. Each column has an icon, a short bold heading, and one sentence. Example columns: "ข่าวเร็ว", "วิเคราะห์ลึก", "อ่านได้ทุกที่".

### Phase 2 PRs — Internal Reader Route

**PR 12**
Branch: `feat/story-reader-route`
Commit: `feat(story-reader): add internal /read/:id route with StoryReadPage layout`

**PR 13**
Branch: `feat/card-internal-cta`
Commit: `feat(cards): wire primary card CTA to internal reader, secondary to external source`

### Phase 3 PRs — CI/CD Build Script

**PR 14**
Branch: `ci/story-pages-index`
Commit: `ci(content): wire build-story-pages-index.sh into GitHub Actions deploy workflow`

Deliverable: add a deploy workflow step that runs `build-story-pages-index.sh` **after** `fetch-the-standard-posts.sh`, `fetch-the-standard-categories.sh`, and `fetch-image-urls.sh` complete. The script already lives in `cachescripts/` — do not rewrite it; only add the workflow step.

### Phase 4 PRs — SEO & Topic Pages

**PR 15**
Branch: `feat/topic-landing-pages`
Commit: `feat(topics): add /topics/:categorySlug landing pages with unique copy and CTAs`

**PR 16** ✅ merged to `main`
Branch: `feat/page-meta`
Commit: `feat(seo): add per-page title, description, and open graph metadata`

### Phase 5 PRs — Resilience

**PR 17** ✅ merged to `main` (shipped with PR 16)
Branch: `feat/empty-states`
Commit: `feat(ux): add empty state modules for home and category views with recovery CTAs`

**PR 18**
Branch: `feat/image-fallbacks`
Commit: `feat(ux): add image fallback and retry behavior for missing media`
