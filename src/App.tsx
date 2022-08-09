import './app.css';

import { useEffect, useState } from 'preact/hooks';

import axios from 'axios';

export function App() {
  const [posts, setPosts] = useState([]);
  const THE_STANDARD_POSTS_ENDPOINT = 'https://thestandard.co/wp-json/wp/v2/posts';
  const getPosts = async () => {
    try {
      const { data } = await axios.get(`${THE_STANDARD_POSTS_ENDPOINT}?per_page=100`);
      setPosts(data);
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    getPosts();
    const interval = setInterval(getPosts, 10000);
    // should clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);
  return (
    <article className="bg-bright-blue w-full">
      <h1 className="text-center font-extrabold leading-tight text-5xl py-8 text-white">
        Fetch The Standard News
      </h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 md:gap-4 px-4">
        {posts.map((post: any) => (
          <li
            className="bg-white border border-4 border-black p-16 grid grid-rows-2"
            key={post.id}
          >
            <header>
              <h2 className="font-bold text-xl text-bright-blue">
                {post.title.rendered}
              </h2>
            </header>
            <button
              className="font-bold text-xl my-2 border border-4 border-black p-8 max-w-xs"
              onClick={() => window.open(post.link)}
            >
              YAY!
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}
