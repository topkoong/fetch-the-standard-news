# Fetch The Standard News - Vite + Preact + TS + TailwindCSS + ESLint + Prettier + Husky

An all in one preset for writing Preact apps with the [vite](https://github.com/vitejs/vite) bundler to fetch the Standard News

## Local Development (Node + pnpm)

This project pins **Node** in [`.nvmrc`](.nvmrc) (`25.8.2`) and **pnpm** in [`package.json`](package.json) (`packageManager: pnpm@9.15.0`). CI uses the same versions.

1. Install Node with [nvm](https://github.com/nvm-sh/nvm): `nvm install && nvm use`
2. Enable Corepack (ships with Node): `corepack enable`
3. Activate the repo’s pnpm release (matches CI): `corepack prepare pnpm@9.15.0 --activate` then `pnpm --version`
4. Install dependencies: `pnpm install` (CI uses `pnpm install --frozen-lockfile`)
5. Run: `pnpm dev` / `pnpm build` / `pnpm lint`

## Cache scripts (`cachescripts/`)

Bash utilities that pull **The Standard** WordPress REST data into `src/assets/cached/` so the app can ship with JSON bundles and avoid fragile runtime-only fetches. Run every command from the **repository root** with **bash**, **curl**, and **jq** installed.

### Recommended order

1. **Posts** — produces the post arrays everything else depends on.
2. **Categories** — taxonomy names for grouping and story metadata.
3. **Image URLs** — resolves featured media to image URLs (and optionally downloads files).
4. **Story index** — compiles `story-pages.json` for internal `/read/:id` pages.

GitHub Actions **Deploy to Github Pages** (see [`.github/workflows/deployment.yml`](.github/workflows/deployment.yml)) runs steps 1–4 before `pnpm lint` and `pnpm build`, so production deploys stay aligned with the same pipeline.

### Script reference

| Script                                                                              | Purpose                                                                                                                                                                                               | Writes to `src/assets/cached/`                       |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [`fetch-the-standard-posts.sh`](cachescripts/fetch-the-standard-posts.sh)           | Paginates `wp/v2/posts` (newest first), merges pages into one array, copies into the app bundle. Also emits audit metadata.                                                                           | `posts.json`, `mobile-posts.json`, `posts-meta.json` |
| [`fetch-the-standard-categories.sh`](cachescripts/fetch-the-standard-categories.sh) | Paginates `wp/v2/categories` and merges all category objects.                                                                                                                                         | `categories.json`                                    |
| [`fetch-image-urls.sh`](cachescripts/fetch-image-urls.sh)                           | Reads cached posts, follows each post’s `wp:featuredmedia` link, picks a sensible image size, builds id→url maps for desktop and mobile caches. Optionally downloads bytes to `public/cached-media/`. | `images.json`, `mobile-images.json`                  |
| [`build-story-pages-index.sh`](cachescripts/build-story-pages-index.sh)             | Joins posts + categories + images with `jq` into a flat `story-pages.json` list (title, excerpt, HTML body, category names, image URL, source link). **Requires** the three JSON inputs above.        | `story-pages.json`                                   |
| [`test-fetch.sh`](cachescripts/test-fetch.sh)                                       | One-request smoke test that the posts endpoint returns JSON (no merge step).                                                                                                                          | _(none — stdout only)_                               |

### Environment variables

| Variable                | Scripts                       | Meaning                                                                                                                                               |
| ----------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST_FETCH_PAGES`      | `fetch-the-standard-posts.sh` | Number of 100-post pages to fetch, or `all` (default). Use a small number for quick local runs.                                                       |
| `LOCALIZE_IMAGE_ASSETS` | `fetch-image-urls.sh`         | `1` (default): download images when possible, validate `Content-Type: image/*`, rewrite JSON to `cached-media/...` paths. `0`: keep remote URLs only. |

### Temporary working directories

Scripts use subfolders under `cachescripts/` (for example `posts-json/`, `categories-json/`, `images-json/`) while downloading and merging. Those paths are cleaned up after a successful run; committed artifacts live only under `src/assets/cached/` and optionally `public/cached-media/`.

### Quick checks

```bash
bash cachescripts/test-fetch.sh
POST_FETCH_PAGES=2 bash cachescripts/fetch-the-standard-posts.sh
bash cachescripts/fetch-the-standard-categories.sh
bash cachescripts/fetch-image-urls.sh
bash cachescripts/build-story-pages-index.sh
```
