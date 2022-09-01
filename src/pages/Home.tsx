import '../app.css';

import CategoryHeader from '@components/CategoryHeader';
import PageBreak from '@components/PageBreak';
import PageHeader from '@components/PageHeader';
import Post from '@components/Post';
import Spinner from '@components/Spinner';
import {
  REFETCH_INTERVAL,
  THE_STANDARD_CATEGORIES_ENDPOINT,
  THE_STANDARD_POSTS_ENDPOINT,
} from '@constants/index';
import axios from 'axios';
import { useState } from 'preact/hooks';
import { useQuery } from 'react-query';

function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [nonThaiCategoriesMapping, setNonThaiCategoriesMapping] = useState<{
    [key: string]: string;
  }>({});

  const getPosts = async () => {
    try {
      const [{ data: fetchedPosts }, { data: fetchedCategories }] = await Promise.all([
        axios.get(`${THE_STANDARD_POSTS_ENDPOINT}?per_page=30`),
        axios.get(`${THE_STANDARD_CATEGORIES_ENDPOINT}?per_page=60`),
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
              Object.keys(nonThaiCategories).includes(`${category}`)
                ? nonThaiCategories[`${category}`]
                : null,
            )
            .filter(Boolean),
        }))
        .filter((fetchedPost: any) => fetchedPost?.categories?.length);
      setNonThaiCategoriesMapping(nonThaiCategories);
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

      console.log('nonThaiCategoriesMapping: ', nonThaiCategoriesMapping);
    } catch (err) {
      console.error(err);
    }
  };

  const { status, isFetching } = useQuery(['allposts'], async () => getPosts(), {
    // Refetch the data every 5 minutes
    refetchInterval: REFETCH_INTERVAL,
  });

  return (
    <article className='bg-bright-blue w-full'>
      <PageHeader title='Fetch The Standard News' />
      {isFetching || status === 'loading' ? (
        <div className='spinner-container'>
          <Spinner />
        </div>
      ) : (
        <ul className='px-6'>
          {categories.map((category, idx) => (
            <li className='w-full my-8' key={category}>
              <CategoryHeader
                category={category}
                nonThaiCategoriesMapping={nonThaiCategoriesMapping}
              />
              <PageBreak />
              {posts && (
                <ul className='grid grid-cols-1 gap-12 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-6 my-8'>
                  {posts[idx][category].slice(0, 5).map((post: any) => (
                    <Post key={post.id} post={post} />
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

export default Home;
