import './app.css';

import { useEffect, useState } from 'preact/hooks';

import axios from 'axios';

export function App() {
  const [posts, setPosts] = useState<any[]>([]);
  const [wealthPosts, setWealthPosts] = useState([]);
  const [popPosts, setPopPosts] = useState([]);
  const [newsPosts, setNewsPosts] = useState([]);
  const [categories, setCategories] = useState<any[]>([]);
  const THE_STANDARD_POSTS_ENDPOINT = 'https://thestandard.co/wp-json/wp/v2/posts';
  const THE_STANDARD_CATEGORIES_ENDPOINT =
    'https://thestandard.co/wp-json/wp/v2/categories';

  const getPosts = async () => {
    try {
      const [{ data: fetchedPosts }, { data: fetchedCategories }] = await Promise.all([
        axios.get(`${THE_STANDARD_POSTS_ENDPOINT}?per_page=100`),
        axios.get(`${THE_STANDARD_CATEGORIES_ENDPOINT}?per_page=100`),
      ]);
      const regEx = /^[A-Za-z0-9]*$/;
      const tempUnique: any = [];
      const nonThaiCategories: any = {};
      fetchedCategories
        .filter((section: any) => regEx.test(section.name))
        .forEach((section: any) => {
          nonThaiCategories[section.id] = section.name;
        });
      // .filter((nonThaiCategory: any) => {
      //   const isDuplicate = tempUnique.includes(Object.values(nonThaiCategory)[0]);
      //   if (!isDuplicate) {
      //     tempUnique.push(Object.values(nonThaiCategory)[0]);
      //     return true;
      //   }
      //   return false;
      // });
      const nonThaiCategoryNames: string[] = Object.values(nonThaiCategories);
      const postsWithCategoryNames = fetchedPosts
        .map((fetchedPost: any) => ({
          ...fetchedPost,
          categories: fetchedPost.categories
            .map((category: any) =>
              Object.keys(nonThaiCategories).includes(category + '')
                ? nonThaiCategories[category + '']
                : null,
            )
            .filter(Boolean),
        }))
        .filter((fetchedPost: any) => fetchedPost?.categories?.length);

      const groupPostByCategories: any[] = nonThaiCategoryNames
        .map((nonThaiCategoryName: any) => ({
          [nonThaiCategoryName]: postsWithCategoryNames
            .filter(({ categories }: any) => categories.includes(nonThaiCategoryName))
            .flat(),
        }))
        .filter((elem) => Object.values(elem)[0].length);
      setCategories(
        groupPostByCategories.map(
          (groupPostByCategory) => Object.keys(groupPostByCategory)[0],
        ),
      );
      setPosts(groupPostByCategories);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getPosts();
    const interval = setInterval(getPosts, 1000000);
    // should clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <article className="bg-bright-blue w-full">
      <h1 className="text-center font-extrabold leading-tight text-5xl py-8 text-white uppercase">
        Fetch The Standard News
      </h1>
      {categories && (
        <ul className="px-6">
          {categories.map((category, idx) => (
            <li className="w-100 font-semibold text-3xl py-8 text-white uppercase">
              {category}
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-2 border-white"></div>
                <div className="flex-grow border-2 border-white"></div>
              </div>
              {posts && (
                <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 md:gap-8 px-6">
                  {posts[idx][category].slice(0, 5).map((post: any) => (
                    <li
                      className="relative bg-black border border-4 border-black p-8 grid grid-rows-2 after:absolute after:content-[''] after:-translate-x-3 after:-translate-y-3 after:left-0 after:top-0 after:bg-white after:p-8 after:w-full after:h-full after:-z-2"
                      key={
                        post?.id ||
                        Date.now().toString(16) +
                          Math.random().toString(16) +
                          '0'.repeat(16)
                      }
                    >
                      <header className="z-10">
                        <h2 className="font-bold text-xl text-bright-blue">
                          {post?.title?.rendered || ''}
                        </h2>
                      </header>
                      <div className="text-center my-2 z-10">
                        <button
                          className="relative bg-black -z-10 lg:w-40 p-8 after:absolute after:content-[''] after:-translate-x-2 after:-translate-y-2 after:font-bold after:text-xl after:left-0 after:top-0 after:border after:border-4 after:border-black after:bg-white after:w-40 after:h-full after:z-10"
                          onClick={() => window.open(post.link)}
                        >
                          <span className="relative z-20 text-black font-bold w-full h-full -translate-x-2 -translate-y-2 uppercase">
                            Check it out!
                          </span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
      {/* <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 md:gap-8 px-6">
        {posts.map((post: any) => (
          <li
            className="relative bg-black border border-4 border-black p-8 grid grid-rows-2 after:absolute after:content-[''] after:-translate-x-3 after:-translate-y-3 after:left-0 after:top-0 after:bg-white after:p-8 after:w-full after:h-full after:-z-2"
            key={post.id}
          >
            <header className="z-10">
              <h2 className="font-bold text-xl text-bright-blue">
                {post.title.rendered}
              </h2>
            </header>
            <div className="text-center my-2 z-10">
              <button
                className="relative bg-black -z-10 lg:w-40 p-8 after:absolute after:content-[''] after:-translate-x-2 after:-translate-y-2 after:font-bold after:text-xl after:left-0 after:top-0 after:border after:border-4 after:border-black after:bg-white after:w-40 after:h-full after:z-10"
                onClick={() => window.open(post.link)}
              >
                <span className="relative z-20 text-black font-bold w-full h-full -translate-x-2 -translate-y-2 uppercase">
                  Check it out!
                </span>
              </button>
            </div>
          </li>
        ))}
      </ul> */}
    </article>
  );
}
