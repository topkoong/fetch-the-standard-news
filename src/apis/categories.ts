import cachedCategories from '@assets/cached/categories.json';
import type { WpCategory } from 'types/wp-api';

/** Bundled at build time — no browser request to thestandard.co (avoids CORS). */
const fetchCategories = async (): Promise<WpCategory[]> => {
  return cachedCategories as WpCategory[];
};

export default fetchCategories;
