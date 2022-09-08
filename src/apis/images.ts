import axios from 'axios';

const fetchImage = async (url: string) => {
  const { data } = await axios.get(url);
  return data;
};

export default fetchImage;
