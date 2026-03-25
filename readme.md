# Fetch The Standard News - Vite + Preact + TS + TailwindCSS + ESLint + Prettier + Husky

An all in one preset for writing Preact apps with the [vite](https://github.com/vitejs/vite) bundler to fetch the Standard News

## Local Development (Node + pnpm)

This project pins **Node** in [`.nvmrc`](.nvmrc) (`25.8.2`) and **pnpm** in [`package.json`](package.json) (`packageManager: pnpm@9.15.0`). CI uses the same versions.

1. Install Node with [nvm](https://github.com/nvm-sh/nvm): `nvm install && nvm use`
2. Enable Corepack (ships with Node): `corepack enable`
3. Activate the repo’s pnpm release (matches CI): `corepack prepare pnpm@9.15.0 --activate` then `pnpm --version`
4. Install dependencies: `pnpm install` (CI uses `pnpm install --frozen-lockfile`)
5. Run: `pnpm dev` / `pnpm build` / `pnpm lint`
