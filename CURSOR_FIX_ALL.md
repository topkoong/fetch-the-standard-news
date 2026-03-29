# Combined Fix — Images, Deployment, UI Polish

# Based on live site screenshots at topkoong.github.io/fetch-the-standard-news

---

## What is working (do not touch)

- Routing: `/` homepage, `/read/:id`, topic hubs, about, coverage pages all load
- Hero headline and CTA copy in Thai
- Category chips (Politics, Business, Tech, World, Thailand, Culture)
- Benefits section (ข่าวเร็ว, วิเคราะห์ลึก, อ่านได้ทุกที่)
- Story reader page layout (title, excerpt, category badges, related stories)
- Navigation menu structure and links
- Deployment pipeline itself (GitHub Pages is live)

## What is broken — fix in this exact order

---

## ISSUE 1 — All images are black rectangles (CRITICAL — fix first)

**Root cause:** `images.json` currently contains `cached-media/XXX.jpg` relative paths
from when `LOCALIZE_IMAGE_ASSETS=1` was used. Those binary files were never deployed
because the SSH deploy was failing. The app is serving broken relative paths.

**Fix — 3 commands, run from repo root:**

```bash
# Step 1: Regenerate images.json with full remote URLs (no binary download)
LOCALIZE_IMAGE_ASSETS=0 bash cachescripts/fetch-image-urls.sh

# Step 2: Rebuild story-pages.json with the correct imageUrls
bash cachescripts/build-story-pages-index.sh

# Step 3: Verify — every imageUrl must start with https://
jq '[.[].imageUrl | select(startswith("https://"))] | length' src/assets/cached/story-pages.json
# Output must equal the total story count. If any start with "cached-media/" — stop and report.
```

Then commit the regenerated JSON files:

```bash
git add src/assets/cached/images.json
git add src/assets/cached/mobile-images.json
git add src/assets/cached/story-pages.json
```

**Why `LOCALIZE_IMAGE_ASSETS=0` is safe:** `<img>` tags loading from thestandard.co
are NOT subject to CORS. Only `fetch()` and `XHR` calls are. Browser image loading
from any domain is always permitted.

**Also add this to `.github/workflows/deployment.yml`** on the fetch-image-urls step:

```yaml
- name: Fetch image URLs
  run: bash cachescripts/fetch-image-urls.sh
  env:
    LOCALIZE_IMAGE_ASSETS: '0'
```

---

## ISSUE 2 — Deployment SSH key failure

In `.github/workflows/deployment.yml`, find the `peaceiris/actions-gh-pages` step.
Replace it with exactly this — no other changes:

```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
```

Remove any `deploy_key:` or `personal_token:` line. `secrets.GITHUB_TOKEN` is
built into every GitHub Actions run — no configuration needed.

---

## ISSUE 3 — CI workflow step order

Confirm `.github/workflows/deployment.yml` runs steps in this exact order.
Reorder if needed:

```yaml
- name: Fetch posts
  run: |
    if [ -z "${POST_FETCH_PAGES:-}" ] && [ -f "src/assets/cached/posts.json" ]; then
      echo "Skipping — using committed posts.json"
    else
      bash cachescripts/fetch-the-standard-posts.sh
    fi

- name: Fetch categories
  run: bash cachescripts/fetch-the-standard-categories.sh

- name: Fetch image URLs
  run: bash cachescripts/fetch-image-urls.sh
  env:
    LOCALIZE_IMAGE_ASSETS: '0'

- name: Build story pages index
  run: bash cachescripts/build-story-pages-index.sh

- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Lint
  run: pnpm lint

- name: Build
  run: pnpm build

- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
```

---

## ISSUE 4 — Duplicate category labels on story reader page

**Observed:** The story reader shows "Business · News · Business · Video" — Business appears twice.

**Root cause:** A post can have multiple `category IDs` that all map to the same
category name. The `categoryNames` array is not deduplicated.

**Fix in `cachescripts/build-story-pages-index.sh`** — find the `categoryNames` field
in the jq program and add `unique` after `map`:

```bash
# BEFORE
categoryNames: (
  (.categories // [])
  | map(($catMap[(tostring)] // empty))
  | map(select(length > 0))
),

# AFTER — add unique to remove duplicates
categoryNames: (
  (.categories // [])
  | map(($catMap[(tostring)] // empty))
  | map(select(length > 0))
  | unique
),
```

After editing the script, re-run it:

```bash
bash cachescripts/build-story-pages-index.sh
git add src/assets/cached/story-pages.json
```

---

## ISSUE 5 — Navbar is a double row and cluttered

**Observed:** The navbar renders two full rows of links on desktop, taking up ~160px
of screen real estate and making the page feel cramped.

**Fix:** Collapse to a single row. Top row keeps: About, Coverage, Topic Hubs,
Business, More (dropdown). Remove the second row entirely — those category links
already exist in the category chips section below the hero.

In the Navbar component (find it via `grep -rn "Navbar" src/`):

```tsx
// The nav wrapper must be fixed, single row, max height h-16
className="fixed top-0 left-0 right-0 z-50 h-16
           bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm"

// Primary nav links — max 5 items
// About | Coverage | Topic Hubs | Business | More ▾
// Remove the second row entirely
```

The `<main>` content offset must match:

```tsx
// Wherever the page root or layout wraps content:
className = 'pt-16'; // exactly 64px to clear the navbar
```

---

## ISSUE 6 — Card backgrounds are blue, not white

**Observed:** News cards have a blue background matching the page, making them
indistinguishable from the page background. Images are also black (fixed by Issue 1)
but the card surface colour is wrong regardless.

**Fix:** In the NewsCard component:

```tsx
// Card wrapper must be white with subtle shadow — not blue
className={`group block bg-white rounded-xl overflow-hidden
            shadow-sm hover:shadow-xl
            transition-all duration-300 hover:-translate-y-1
            ${isFeatureCard ? 'md:col-span-2 md:row-span-2' : ''}`}
```

The page background should be `bg-gray-50`, not blue:

```tsx
// In the page layout / App root:
className = 'min-h-screen bg-gray-50';
```

---

## ISSUE 7 — Hero image area is black

This will be resolved by Issue 1 (image URLs fixed). But also verify the hero
`<img>` tag has the correct attributes:

```tsx
<img
  src={featuredArticle.imageUrl} // must be https://thestandard.co/...
  alt={featuredArticle.title}
  loading='eager'
  fetchPriority='high'
  onError={(e) => {
    e.currentTarget.src = '/placeholder-news.jpg';
  }}
  className='absolute inset-0 w-full h-full object-cover opacity-50'
/>
```

If `featuredArticle.imageUrl` is an empty string or `cached-media/xxx.jpg`,
the fix is Issue 1 — regenerate the JSON with remote URLs.

---

## ISSUE 8 — HTML entities rendering as raw text

**Observed in screenshots:** Excerpt text shows `[&hellip;]` literally instead of
rendering as `…`. This is because the excerpt is stored with HTML entities but
rendered as plain text without decoding.

**Fix — add a `decodeHtmlEntities` utility** in `src/utils/formatters.ts`:

```ts
/**
 * Decodes HTML entities in a plain-text string.
 * Uses DOMParser — safe, no innerHTML, no XSS risk.
 */
export function decodeHtmlEntities(text: string): string {
  if (typeof document === 'undefined') return text; // SSR guard
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  return doc.documentElement.textContent ?? text;
}
```

Apply it everywhere an excerpt is rendered:

```tsx
// In NewsCard, StoryReadPage, RelatedStoryCard, anywhere excerpt appears:
<p>{decodeHtmlEntities(article.excerpt)}</p>
```

Also apply it in `build-story-pages-index.sh` — the `stripHtml` jq function
already strips tags but does not decode entities. Add entity decoding after `stripHtml`:

```bash
# In the jq program, update stripHtml to also decode common entities:
def stripHtml:
  gsub("<[^>]*>"; " ")
  | gsub("&nbsp;"; " ")
  | gsub("&hellip;"; "…")
  | gsub("&amp;"; "&")
  | gsub("&lt;"; "<")
  | gsub("&gt;"; ">")
  | gsub("&quot;"; "\"")
  | gsub("&#8220;"; "\u201C")
  | gsub("&#8221;"; "\u201D")
  | gsub("&#8216;"; "\u2018")
  | gsub("&#8217;"; "\u2019")
  | gsub("\\s+"; " ")
  | sub("^\\s+"; "")
  | sub("\\s+$"; "");
```

After editing the script, re-run it and commit:

```bash
bash cachescripts/build-story-pages-index.sh
git add src/assets/cached/story-pages.json
```

---

## All changes go on one branch

```bash
git checkout main
git pull origin main
git checkout -b fix/images-deployment-ui-polish
```

When done, verify:

```bash
# 1. No cached-media paths in story-pages
jq '[.[].imageUrl | select(startswith("cached-media"))] | length' \
  src/assets/cached/story-pages.json
# Must print: 0

# 2. No duplicate categories on any story
jq '[.[] | .categoryNames | length == (.categoryNames | unique | length)] | all' \
  src/assets/cached/story-pages.json
# Must print: true

# 3. Build passes
pnpm lint && pnpm build

# 4. Preview locally — open browser, all card images should show photos
pnpm preview
```

Commit:

```bash
git add .github/workflows/deployment.yml
git add src/assets/cached/
git add src/          # all component fixes
git add cachescripts/build-story-pages-index.sh
git commit -m "fix(images): use remote URLs, fix deployment token, deduplicate categories, polish UI"
git push origin fix/images-deployment-ui-polish
```

---

## PR description must include

- Screenshot of homepage with visible card images (not black)
- Screenshot of story reader page with visible hero image
- Screenshot of DevTools Network tab — zero fetch/XHR to thestandard.co
- Output of `pnpm lint` (0 errors)
- Output of `pnpm build` (0 errors)
- Output of `jq 'length' src/assets/cached/story-pages.json` (must be > 0)

---

## Summary of what each fix addresses

| Screenshot evidence              | Root cause                                                   | Fix                                                                |
| -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------ |
| All images black (every page)    | `imageUrl` has `cached-media/xxx.jpg` — files never deployed | Regenerate with `LOCALIZE_IMAGE_ASSETS=0` for full https:// URLs   |
| Deploy fails with SSH error      | `deploy_key` secret missing                                  | Switch to `github_token: ${{ secrets.GITHUB_TOKEN }}`              |
| Build-story-pages not running    | Wrong CI step order                                          | Add + reorder steps in deployment.yml                              |
| "Business · Business" in reader  | categoryNames not deduplicated                               | Add `unique` to jq categoryNames pipeline                          |
| Double-row navbar                | No collapsed nav design                                      | Single row, max 5 items, remove second row                         |
| Blue card backgrounds            | Missing `bg-white` on card                                   | Set card surface to `bg-white`, page to `bg-gray-50`               |
| `[&hellip;]` literal in excerpts | HTML entities not decoded                                    | Add `decodeHtmlEntities()` utility + entity decode in jq stripHtml |

Do not open any new feature PR until this branch is merged.
