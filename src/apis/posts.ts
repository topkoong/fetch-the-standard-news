import { THE_STANDARD_POSTS_ENDPOINT } from '@constants/index';
import axios from 'axios';
import type { WpPost } from 'types/wp-api';

const fetchPosts = async (): Promise<WpPost[]> => {
  const { data } = await axios.get<WpPost[]>(
    `${THE_STANDARD_POSTS_ENDPOINT}?per_page=100&orderby=date&order=desc`,
  );
  return data;
};

export default fetchPosts;
