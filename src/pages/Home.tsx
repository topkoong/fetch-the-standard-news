import '../app.css';

import fetchCategories from '@apis/categories';
// import fetchImage from '@apis/images';
import fetchPosts from '@apis/posts';
import CategoryHeader from '@components/CategoryHeader';
import PageBreak from '@components/PageBreak';
import PageHeader from '@components/PageHeader';
import Post from '@components/Post';
import Spinner from '@components/Spinner';
import { REFETCH_INTERVAL } from '@constants/index';
// import { useEffect, useMemo, useState } from 'preact/hooks';
// import { useQueries, useQuery } from 'react-query';
import { useMemo } from 'preact/hooks';
import { useQuery } from 'react-query';

// import axios from 'axios';
import cachedCategoryData from '../assets/cached/categories.json';
import cachedImagesData from '../assets/cached/images.json';
import cachedPostsData from '../assets/cached/posts.json';

interface Keyable {
  [key: string]: string;
}

interface ImageUrl {
  url: string;
  id: number;
}

function Home() {
  // const [imageUrls, setImageUrls] = useState<ImageUrl[]>([]);
  const {
    data: postData,
    error: postError,
    status: postStatus,
  } = useQuery('allposts', fetchPosts, {
    refetchInterval: REFETCH_INTERVAL * 3,
    initialData: cachedPostsData,
    placeholderData: cachedPostsData,
    staleTime: 1000,
  });
  const {
    data: categoryData,
    error: categoryError,
    status: categoryStatus,
  } = useQuery('allcategories', fetchCategories, {
    refetchInterval: REFETCH_INTERVAL * 3,
    initialData: cachedCategoryData,
    placeholderData: cachedCategoryData,
    staleTime: 1000,
  });

  const nonThaiCategories = useMemo(() => {
    const regEx = /^[A-Za-z0-9]*$/;
    const nonThaiCategoriesObj: any = {};
    categoryData
      ?.filter((section: any) => regEx.test(section.name))
      ?.forEach((section: any) => {
        nonThaiCategoriesObj[section.id] = section.name;
      });
    return nonThaiCategoriesObj;
  }, [categoryData]);

  const nonThaiCategoryNames = useMemo(() => {
    const nonThaiCategoryNamesArr: string[] = Object.values(nonThaiCategories);
    return nonThaiCategoryNamesArr;
  }, [nonThaiCategories]);

  const postsWithCategoryNames = useMemo(
    () =>
      postData
        ?.map((fetchedPost: any) => ({
          ...fetchedPost,
          categories: fetchedPost?.categories
            ?.map((category: any) =>
              Object.keys(nonThaiCategories).includes(`${category}`)
                ? nonThaiCategories[`${category}`]
                : null,
            )
            ?.filter(Boolean),
        }))
        ?.filter((fetchedPost: any) => fetchedPost?.categories?.length),
    [nonThaiCategories, postData],
  );

  const groupPostByCategories = useMemo(
    () =>
      nonThaiCategoryNames
        ?.map((nonThaiCategoryName: any) => ({
          [nonThaiCategoryName]: postsWithCategoryNames
            ?.filter(({ categories }: any) => categories.includes(nonThaiCategoryName))
            ?.flat(),
        }))
        ?.filter((elem) => elem && Object.values(elem)[0]?.length),
    [nonThaiCategoryNames, postsWithCategoryNames],
  );

  const categories = useMemo(
    () =>
      groupPostByCategories?.map(
        (groupPostByCategory) => Object.keys(groupPostByCategory)[0],
      ),
    [groupPostByCategories],
  ) as any[];

  // Use cache image instead

  // const rawImageUrls: string[] = useMemo(
  //   () =>
  //     groupPostByCategories
  //       ?.map((category) =>
  //         Object.values(category)?.map((posts: any) =>
  //           posts.map((post: any) => post?.['_links']?.['wp:featuredmedia'][0]?.['href']),
  //         ),
  //       )
  //       ?.flat(2),
  //   [groupPostByCategories],
  // );

  // const imageResults = useQueries({
  //   queries: rawImageUrls?.map((url: string) => ({
  //     queryKey: ['imageUrl', url],
  //     queryFn: () => fetchImage(url),
  //   })),
  //   initialData: cachedPostsData,
  //   placeholderData: cachedPostsData,
  //   staleTime: 1000,
  // });

  // useEffect(() => {
  //   const imgUrls: ImageUrl[] = imageResults?.map(({ data }) => ({
  //     id: data?.id,
  //     url: data?.guid?.rendered,
  //   }));
  //   setImageUrls(imgUrls);
  // }, [imageResults]);

  const postsWithImages = useMemo(
    () =>
      groupPostByCategories.map((category) => ({
        [Object.keys(category)[0]]: Object.values(category)
          .map((posts: any) =>
            posts.map((post: any) => ({
              ...post,
              imageUrl: cachedImagesData?.find(
                (imageUrl: ImageUrl) => imageUrl?.id === post?.featured_media,
              )?.url,
            })),
          )
          .flat(2),
      })),
    [groupPostByCategories],
  );

  return (
    <article className='bg-bright-blue w-full h-full pb-4'>
      <PageHeader title='Fetch The Standard News' />
      {(postStatus || categoryStatus) === 'loading' ? (
        <div className='spinner-container h-full'>
          <Spinner />
        </div>
      ) : (postError || categoryError) instanceof Error ? (
        <span>
          Error:
          {(postError as Keyable)?.message || (categoryError as Keyable)?.message}
        </span>
      ) : (
        <ul className='px-6 h-full'>
          {categories.map((category, idx) => (
            <li
              className='w-full my-16 h-full'
              key={
                category +
                Date.now().toString(16) +
                Math.random().toString(16) +
                '0'.repeat(16)
              }
            >
              <CategoryHeader
                category={category}
                nonThaiCategoriesMapping={nonThaiCategories}
              />
              <PageBreak />
              {postsWithImages && (
                <ul className='grid grid-cols-1 gap-12 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-6 my-8'>
                  {postsWithImages[idx][category].slice(0, 5).map((post: any) => (
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
