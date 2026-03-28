import { THE_STANDARD_POSTS_ENDPOINT } from '@constants/index';
import { loadArticles } from '@hooks/use-news';
import axios from 'axios';
import type { WpPost } from 'types/wp-api';

function mapArticleToWpPost(raw: unknown, index: number): WpPost {
  const a = (raw ?? {}) as Record<string, unknown>;
  const idVal = a.id ?? index + 1;
  const id =
    typeof idVal === 'number' && Number.isFinite(idVal)
      ? idVal
      : Number.parseInt(String(idVal), 10) || index + 1;
  const title =
    typeof a.title === 'string'
      ? a.title
      : typeof a.title === 'object' &&
        a.title !== null &&
        'rendered' in (a.title as object)
      ? String((a.title as { rendered?: unknown }).rendered ?? '')
      : '';
  const link =
    (typeof a.link === 'string' && a.link) || (typeof a.url === 'string' && a.url) || '';
  const image =
    (typeof a.image === 'string' && a.image) ||
    (typeof a.thumbnail === 'string' && a.thumbnail) ||
    (typeof a.featured_image === 'string' && a.featured_image) ||
    '';
  const excerpt =
    (typeof a.excerpt === 'string' && a.excerpt) ||
    (typeof a.description === 'string' && a.description) ||
    '';
  const date =
    (typeof a.date === 'string' && a.date) ||
    (typeof a.publishedAt === 'string' && a.publishedAt) ||
    undefined;

  return {
    id,
    title: { rendered: title || 'Article' },
    link,
    imageUrl: image || undefined,
    featured_media: 0,
    categories: [39],
    date,
    excerpt: excerpt ? { rendered: excerpt } : undefined,
  };
}

const fetchPosts = async (): Promise<WpPost[]> => {
  try {
    const articles = await loadArticles();
    if (Array.isArray(articles) && articles.length > 0) {
      return articles.map((item, index) => mapArticleToWpPost(item, index));
    }
  } catch {
    /* fall through to WordPress */
  }

  const { data } = await axios.get<WpPost[]>(
    `${THE_STANDARD_POSTS_ENDPOINT}?per_page=100&orderby=date&order=desc`,
  );
  return data;
};

export default fetchPosts;
