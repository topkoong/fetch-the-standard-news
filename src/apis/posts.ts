import cachedPosts from '@assets/cached/posts.json';
import type { WpPost } from 'types/wp-api';

/** Bundled at build time — no browser request to thestandard.co (avoids CORS). */
const fetchPosts = async (): Promise<WpPost[]> => {
  return cachedPosts as WpPost[];
};

export default fetchPosts;
