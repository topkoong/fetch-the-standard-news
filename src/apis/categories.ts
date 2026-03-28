/**
 * Category metadata from a static JSON snapshot (same rationale as `posts.ts`).
 *
 * Populated by `cachescripts/fetch-the-standard-categories.sh` before build in CI.
 * Keeping this bundled avoids live `axios`/`fetch` calls to the WP categories
 * endpoint from the browser and removes CORS as a failure mode for navigation
 * and filters that depend on category ids/names.
 */
import cachedCategories from '@assets/cached/categories.json';
import type { WpCategory } from 'types/wp-api';

const fetchCategories = async (): Promise<WpCategory[]> => {
  return cachedCategories as WpCategory[];
};

export default fetchCategories;
