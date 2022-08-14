import './app.css';

import { useEffect, useState } from 'preact/hooks';

import CategoryHeader from './components/CategoryHeader';
import PageBreak from './components/PageBreak';
import PageHeader from './components/PageHeader';
import Post from './components/Post';
import axios from 'axios';

export function App() {
  const [posts, setPosts] = useState<any[]>([]);
  const [wealthPosts, setWealthPosts] = useState([]);
  const [popPosts, setPopPosts] = useState([]);
  const [newsPosts, setNewsPosts] = useState([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [nonThaiCategoriesMapping, setNonThaiCategoriesMapping] = useState<{
    [key: string]: string;
  }>({});
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
      const nonThaiCategories: any = {};
      fetchedCategories
        .filter((section: any) => regEx.test(section.name))
        .forEach((section: any) => {
          nonThaiCategories[section.id] = section.name;
        });
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
      setNonThaiCategoriesMapping({ ...nonThaiCategories });
      console.log('postsWithCategoryNames: ', postsWithCategoryNames);
      const groupPostByCategories: any[] = nonThaiCategoryNames
        .map((nonThaiCategoryName: any) => ({
          [nonThaiCategoryName]: postsWithCategoryNames
            .filter(({ categories }: any) => categories.includes(nonThaiCategoryName))
            .flat(),
        }))
        .filter((elem) => Object.values(elem)[0].length);
      console.log('groupPostByCategories: ', groupPostByCategories);
      setCategories(
        groupPostByCategories.map(
          (groupPostByCategory) => Object.keys(groupPostByCategory)[0],
        ),
      );

      setPosts(groupPostByCategories);

      console.log('nonThaiCategoriesMapping: ', nonThaiCategoriesMapping);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getPosts();
    // const interval = setInterval(getPosts, 1000000);
    // // should clear the interval when the component unmounts
    // return () => clearInterval(interval);
  }, []);

  return (
    <article className="bg-bright-blue w-full">
      <PageHeader title="Fetch The Standard News" />
      {categories && (
        <ul className="px-6">
          {categories.map((category, idx) => (
            <li className="w-100 my-8">
              <CategoryHeader
                category={category}
                nonThaiCategoriesMapping={nonThaiCategoriesMapping}
              />
              <PageBreak />
              {posts && (
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-8 px-6">
                  {posts[idx][category].slice(0, 5).map((post: any) => (
                    <Post post={post} />
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
