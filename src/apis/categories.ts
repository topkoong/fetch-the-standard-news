import { THE_STANDARD_CATEGORIES_ENDPOINT } from '@constants/index';
import axios from 'axios';
import type { WpCategory } from 'types/wp-api';

const fetchCategories = async (): Promise<WpCategory[]> => {
  const { data } = await axios.get<WpCategory[]>(
    `${THE_STANDARD_CATEGORIES_ENDPOINT}?per_page=60&orderby=name&order=asc`,
  );
  return data;
};

export default fetchCategories;
