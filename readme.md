# Fetch The Standard News - Vite + Preact + TS + TailwindCSS + ESLint + Prettier + Husky

An all in one preset for writing Preact apps with the [vite](https://github.com/vitejs/vite) bundler to fetch the Standard News

## Local Development (Node + pnpm)

This project pins **Node** in [`.nvmrc`](.nvmrc) (`25.8.2`) and **pnpm** in [`package.json`](package.json) (`packageManager: pnpm@9.15.0`). CI uses the same versions.

1. Install Node with [nvm](https://github.com/nvm-sh/nvm): `nvm install && nvm use`
2. Enable Corepack (ships with Node): `corepack enable`
3. Activate the repo’s pnpm release (matches CI): `corepack prepare pnpm@9.15.0 --activate` then `pnpm --version`
4. Install dependencies: `pnpm install` (CI uses `pnpm install --frozen-lockfile`)
5. Run: `pnpm dev` / `pnpm build` / `pnpm lint`

## Refreshing cached JSON (optional)

Shell scripts in [`cachescripts/`](cachescripts/) refetch WordPress data into `src/assets/cached/`. Run from the **repository root** with **bash**, **curl**, and **jq** installed.

| Script                                                                                           | Output                                                    |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| [`cachescripts/fetch-the-standard-posts.sh`](cachescripts/fetch-the-standard-posts.sh)           | `posts.json`, `mobile-posts.json`                         |
| [`cachescripts/fetch-the-standard-categories.sh`](cachescripts/fetch-the-standard-categories.sh) | `categories.json`                                         |
| [`cachescripts/fetch-image-urls.sh`](cachescripts/fetch-image-urls.sh)                           | `images.json`, `mobile-images.json` (run **after** posts) |

Posts fetch uses `orderby=date&order=desc`. By default **10 pages** (1000 posts) are downloaded. Override with `POST_FETCH_PAGES=25 bash cachescripts/fetch-the-standard-posts.sh` or `POST_FETCH_PAGES=all` for every page (slow, very large).

Smoke test API: `bash cachescripts/test-fetch.sh`
