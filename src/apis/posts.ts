import { THE_STANDARD_POSTS_ENDPOINT } from '@constants/index';
import axios from 'axios';

const fetchPosts = async (): Promise<any> => {
  const { data } = await axios.get(`${THE_STANDARD_POSTS_ENDPOINT}?per_page=100`);
  return data;
};

export default fetchPosts;
