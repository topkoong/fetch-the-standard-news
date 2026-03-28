/**
 * WordPress-shaped posts for the app, served from a static JSON snapshot.
 *
 * Why not fetch from thestandard.co in the browser?
 * - The WP REST API is a cross-origin request; without permissive CORS headers,
 *   `fetch()` / XHR from GitHub Pages will fail.
 * - Vite bundles this JSON at build time, so the client only ever loads same-origin
 *   assets after deploy.
 *
 * Where does `posts.json` come from?
 * - Locally / CI: `cachescripts/fetch-the-standard-posts.sh` (optional; see
 *   `.github/workflows/deployment.yml` and repo variable `POST_FETCH_PAGES`).
 * - The file in `src/assets/cached/` is what gets compiled into the bundle.
 *
 * Callers (e.g. React Query) still use an async function so the rest of the app
 * does not need to know the data is synchronous under the hood.
 */
import cachedPosts from '@assets/cached/posts.json';
import type { WpPost } from 'types/wp-api';

const fetchPosts = async (): Promise<WpPost[]> => {
  return cachedPosts as WpPost[];
};

export default fetchPosts;
