# Blocking Fix — CORS, Empty Story Pages, Slow Image Fetch, Deployment Failure

Do everything in this document on a single branch before any other PR.

```
git checkout main
git pull origin main
git checkout -b fix/cors-pipeline-deployment
```

Commit: `fix(ci): resolve CORS, empty story-pages, slow image fetch, and deployment`

---

## Why these are all one PR

All four issues are in the same data pipeline and block the same deploy:

- The frontend calls `fetch()` to thestandard.co at runtime → CORS error in browser
- `story-pages.json` is `[]` → nothing to render even if CORS were fixed
- Image binary download in CI → deploy takes minutes before it even reaches the CORS problem
- SSH key misconfiguration → deploy never completes regardless

Fix them in the order below. Do not skip ahead.

---

## Step 1 — Fix the CI workflow

Open `.github/workflows/deployment.yml`.

### 1a — Fix the step order and add missing script

The workflow must run the four cache scripts in this exact order before `pnpm lint`
and `pnpm build`. Find the existing fetch steps and reorder them. If any step is
missing, add it. The correct order is:

```yaml
- name: Fetch posts
  run: |
    if [ -z "${POST_FETCH_PAGES:-}" ] && [ -f "src/assets/cached/posts.json" ]; then
      echo "Skipping fetch-the-standard-posts.sh — using committed posts.json"
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

- name: Lint
  run: pnpm lint

- name: Build
  run: pnpm build
```

`LOCALIZE_IMAGE_ASSETS: "0"` is the key change for the image fetch step.
It means the script resolves image URLs from the WordPress media API (fast — one
request per post) but does NOT download the binary files to public/cached-media/.
Images are served directly from thestandard.co CDN via `<img>` tags at runtime.
Loading images via an `<img>` tag is not a CORS request — only `fetch()` and
`XMLHttpRequest` calls are subject to CORS. This is safe.

### 1b — Fix the deployment step

Find the `peaceiris/actions-gh-pages` step. Replace it with exactly this:

```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
```

Remove any `deploy_key:` or `personal_token:` line that may exist on that step.
`secrets.GITHUB_TOKEN` is automatically injected by GitHub Actions into every
workflow run — no secrets configuration is needed.

---

## Step 2 — Verify story-pages.json locally before touching the frontend

Run the pipeline locally from the repository root to confirm the script produces
real data:

```bash
bash cachescripts/fetch-the-standard-categories.sh
LOCALIZE_IMAGE_ASSETS=0 bash cachescripts/fetch-image-urls.sh
bash cachescripts/build-story-pages-index.sh
```

Then check the output:

```bash
jq 'length' src/assets/cached/story-pages.json
# Must print a number greater than 0. If it prints 0, stop and report the error.

jq '.[0] | {id, title, imageUrl, sourceUrl}' src/assets/cached/story-pages.json
# Must print a real article object with non-empty fields.
```

Do not proceed to Step 3 until this confirms real data.

Commit the generated `src/assets/cached/story-pages.json` to the branch:

```bash
git add src/assets/cached/story-pages.json
git add src/assets/cached/images.json
git add src/assets/cached/categories.json
```

These committed JSON files are what Vite will bundle at build time. Committing them
means the CI workflow can skip the slow fetch steps on subsequent deploys.

---

## Step 3 — Fix the CORS error in the frontend

The browser cannot call `fetch('https://thestandard.co/...')` — thestandard.co
does not set CORS headers for third-party domains. The data must come from the
JSON files that were pre-built at CI time, not from runtime network calls.

### 3a — Find every runtime fetch to thestandard.co

Run these greps from the repository root:

```bash
grep -rn "thestandard.co" src/
grep -rn "fetch(" src/
grep -rn "axios" src/
grep -rn "articles.json" src/
grep -rn "story-pages" src/
```

Every result that makes a network call to thestandard.co at browser runtime must
be replaced. This includes any `useEffect` that calls `fetch()`, any service
function that calls `axios.get()`, or any hook that calls the API.

### 3b — Replace runtime fetch with a static Vite import

The correct pattern is a direct import. Vite resolves JSON imports at build time
and bundles them into the JS output. The browser never makes a network request.

**Find the hook or service that fetches articles.** It will look something like:

```ts
// BEFORE — causes CORS error in browser
useEffect(() => {
  fetch('https://thestandard.co/...')
    .then((res) => res.json())
    .then((data) => setArticles(data));
}, []);
```

**Replace the entire hook body with a static import:**

```ts
// AFTER — no network call, no CORS, bundled by Vite at build time
import rawStoryPages from '@/assets/cached/story-pages.json';
import type { StoryPage } from '@/types';

export function useStandardNews() {
  const storyPages = rawStoryPages as StoryPage[];
  return {
    articles: storyPages,
    isLoading: false,
    error: null,
  };
}
```

If the hook uses `AsyncResult<T>` from the types file, return it as a
success state immediately — no loading state is needed because the data is
synchronously available from the import:

```ts
import rawStoryPages from '@/assets/cached/story-pages.json';
import type { StoryPage } from '@/types';
import type { AsyncResult } from '@/types';

export function useStandardNews(): { result: AsyncResult<StoryPage[]> } {
  return {
    result: {
      status: 'success',
      data: rawStoryPages as StoryPage[],
    },
  };
}
```

### 3c — Also check for the articles.json fetch

The file `scripts/fetch-content.mjs` writes to `public/data/articles.json`.
Search for any frontend code that reads from `public/data/articles.json`:

```bash
grep -rn "data/articles" src/
grep -rn "articles.json" src/
```

If any component or hook fetches `/data/articles.json` at runtime
(e.g. `fetch('/data/articles.json')`), replace that import path with the
static import from `@/assets/cached/story-pages.json` instead. The story-pages
data is richer and is the canonical source.

---

## Step 4 — Delete the duplicate fetch script

`scripts/fetch-content.mjs` and `public/data/articles.json` are superseded by the
bash scripts and the static import approach. Delete them:

```bash
rm scripts/fetch-content.mjs
rm public/data/articles.json   # may not exist — that is fine
```

Open `package.json`. Find any script that references `fetch-content.mjs`, for
example:

```json
"prebuild": "node scripts/fetch-content.mjs"
```

Delete that line entirely. The bash scripts in the CI workflow handle data fetching —
there must be no Node.js fetch script in the build chain.

---

## Step 5 — Add TypeScript support for JSON imports

If Vite or TypeScript complains about importing a `.json` file, add this to
`tsconfig.json` under `compilerOptions`:

```jsonc
"resolveJsonModule": true
```

If Vite complains, confirm that `vite.config.ts` does not have anything that
disables JSON imports (it should work by default).

---

## Step 6 — Verify locally

Run the full build locally:

```bash
pnpm lint     # must pass with 0 errors
pnpm build    # must pass with 0 TypeScript errors
pnpm preview  # open browser, verify news cards render with real content
```

Open browser DevTools → Network tab. Filter by "thestandard.co".

```
Expected: zero fetch/XHR requests to thestandard.co
Acceptable: <img> tag requests to thestandard.co (these are not CORS, they are fine)
Not acceptable: any fetch() or XHR to thestandard.co
```

Also confirm in the build output:

```bash
ls dist/assets/ | grep story-pages
# Must show a file like story-pages-[hash].json with non-zero size
```

---

## Step 7 — Run automated checks before committing

```bash
grep -rn "thestandard.co" src/ | grep -v "//.*thestandard"
# Should only show string literals in constants, never in fetch() calls

grep -rn "fetch(" src/
# Must return zero results pointing to thestandard.co

pnpm lint     # 0 errors
pnpm build    # 0 errors
```

---

## Step 8 — Commit everything together

```bash
git add .github/workflows/deployment.yml
git add src/assets/cached/story-pages.json
git add src/assets/cached/images.json
git add src/assets/cached/categories.json
git add src/          # all frontend CORS fixes
git rm scripts/fetch-content.mjs
git rm public/data/articles.json   # skip if file does not exist
git commit -m "fix(ci): resolve CORS, empty story-pages, slow image fetch, and deployment"
git push origin fix/cors-pipeline-deployment
```

Open a PR. Title: `fix(ci): resolve CORS, empty story-pages, slow image fetch, and deployment`

PR description must include:

- Output of `jq 'length' src/assets/cached/story-pages.json` (must be > 0)
- Output of `pnpm lint` (0 errors)
- Output of `pnpm build` (0 errors)
- Screenshot of DevTools Network tab showing zero fetch requests to thestandard.co
- Screenshot of the app running locally with news cards visible

Do not merge until all four items above are in the PR description.

---

## What each fix does and why

| Problem                         | Root cause                                                                             | Fix                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| CORS error in browser           | Frontend calls `fetch('https://thestandard.co/...')` at runtime                        | Replace with static `import` from bundled JSON — Vite resolves at build time       |
| `story-pages.json` is `[]`      | `build-story-pages-index.sh` not running in CI, or running before `images.json` exists | Add step to workflow in correct order after all three fetch scripts                |
| Image fetch takes too long      | CI downloads 200+ image binaries sequentially                                          | Set `LOCALIZE_IMAGE_ASSETS=0` — resolves URLs only (fast), no binary download      |
| Deployment fails with SSH error | `peaceiris/actions-gh-pages` configured with SSH key that does not exist               | Switch to `github_token: ${{ secrets.GITHUB_TOKEN }}` — built in, no config needed |
| Duplicate data pipeline         | `fetch-content.mjs` fetches homepage HTML in parallel to bash REST API pipeline        | Delete `fetch-content.mjs` — bash scripts are authoritative                        |
