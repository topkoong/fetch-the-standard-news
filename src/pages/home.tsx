import fetchCategories from '@apis/categories';
import fetchPosts from '@apis/posts';
import cachedCategoriesData from '@assets/cached/categories.json';
import cachedImagesData from '@assets/cached/images.json';
import cachedMobileImagesData from '@assets/cached/mobile-images.json';
import cachedMobilePostsData from '@assets/cached/mobile-posts.json';
import cachedPostsData from '@assets/cached/posts.json';
import { REFETCH_INTERVAL } from '@constants/index';
import useBreakpoints from '@hooks/use-breakpoints';
import { lazy } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { useQuery } from 'react-query';

const PageBreak = lazy(() => import('@components/page-break'));
const PageHeader = lazy(() => import('@components/page-header'));
const Post = lazy(() => import('@components/post'));
const Spinner = lazy(() => import('@components/spinner'));
const CategoryHeader = lazy(() => import('@components/category-header'));

interface Keyable {
  [key: string]: string;
}

interface ImageUrl {
  url: string;
  id: number;
}

function Home() {
  const { isXs, isSm, isMd, isLg, isXl } = useBreakpoints();
  const {
    data: postData,
    error: postError,
    status: postStatus,
  } = useQuery('allposts', fetchPosts, {
    refetchInterval: REFETCH_INTERVAL * 3,
    initialData: isXs || isSm ? cachedMobilePostsData : cachedPostsData,
    placeholderData: isXs || isSm ? cachedMobilePostsData : cachedPostsData,
    staleTime: REFETCH_INTERVAL * 3,
  });
  const {
    data: categoriesData,
    error: categoryError,
    status: categoryStatus,
  } = useQuery('allcategories', fetchCategories, {
    refetchInterval: REFETCH_INTERVAL * 3,
    initialData: cachedCategoriesData,
    placeholderData: cachedCategoriesData,
    staleTime: REFETCH_INTERVAL * 3,
  });

  const nonThaiCategories = useMemo(() => {
    const regEx = /^[A-Za-z0-9]*$/;
    const nonThaiCategoriesObj: any = {};
    categoriesData
      ?.filter((section: any) => regEx.test(section.name))
      ?.forEach((section: any) => {
        nonThaiCategoriesObj[section.id] = section.name;
      });
    return nonThaiCategoriesObj;
  }, [categoriesData]);

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

  const numberOfElementsToBeRendered = useMemo(() => {
    if (isXs) return 1;
    if (isSm) return 1;
    if (isMd) return 2;
    if (isLg) return 3;
    if (isXl) return 4;
    return 8;
  }, [isLg, isMd, isSm, isXl, isXs]);

  const cachedImageUrlById = useMemo(() => {
    const rows = (isXs || isSm ? cachedMobileImagesData : cachedImagesData) as ImageUrl[];
    return new Map(rows.map((row) => [row.id, row.url]));
  }, [isSm, isXs]);

  const postsWithImages = useMemo(
    () =>
      groupPostByCategories.map((category) => ({
        [Object.keys(category)[0]]: Object.values(category)
          .map((posts: any) =>
            posts.map((post: any) => ({
              ...post,
              imageUrl: cachedImageUrlById.get(post?.featured_media),
            })),
          )
          .flat(2),
      })),
    [cachedImageUrlById, groupPostByCategories],
  );

  return (
    <article className='w-full min-h-[60vh] pb-10'>
      <PageHeader title='Toppy × The Standard News' />
      {(postStatus || categoryStatus) === 'loading' ? (
        <div
          className='spinner-container py-24'
          aria-busy='true'
          aria-label='Loading news'
        >
          <Spinner />
        </div>
      ) : (postError || categoryError) instanceof Error ? (
        <div
          className='mx-6 my-8 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-5 text-white shadow-md'
          role='alert'
        >
          <p className='font-semibold uppercase tracking-wide text-sm opacity-90'>
            Something went wrong
          </p>
          <p className='mt-2 text-lg'>
            {(postError as Keyable)?.message || (categoryError as Keyable)?.message}
          </p>
        </div>
      ) : (
        <ul className='px-4 sm:px-6 h-full max-w-[1600px] mx-auto'>
          {categories.map((category, idx) => (
            <li className='w-full my-16 h-full' key={`${idx}-${category}`}>
              <CategoryHeader
                category={category}
                nonThaiCategoriesMapping={nonThaiCategories}
              />
              <PageBreak />
              {postsWithImages && (
                <ul className='grid grid-cols-1 gap-8 md:gap-10 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 my-8'>
                  {postsWithImages[idx][category]
                    .slice(0, numberOfElementsToBeRendered)
                    .map((post: any) => (
                      <Post key={post.id} post={post} group={idx} />
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
