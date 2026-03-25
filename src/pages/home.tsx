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

interface WpCategory {
  id: number;
  name: string;
}

interface WpPost {
  id: number;
  categories?: number[];
  featured_media?: number;
  title?: { rendered?: string };
  link?: string;
}

interface CachedImageRow {
  id: number;
  url: string;
}

interface PostWithCategoryLabels extends Omit<WpPost, 'categories'> {
  categories: string[];
}

interface PostCardModel extends PostWithCategoryLabels {
  imageUrl?: string;
}

interface CategorySection {
  categoryName: string;
  posts: PostWithCategoryLabels[];
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const m = (err as { message?: unknown }).message;
    return typeof m === 'string' ? m : 'Unknown error';
  }
  return 'Unknown error';
}

const ASCII_NAME = /^[A-Za-z0-9]*$/;

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

  const nonThaiCategoryIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    (categoriesData as WpCategory[] | undefined)
      ?.filter((section) => ASCII_NAME.test(section.name))
      ?.forEach((section) => {
        map[String(section.id)] = section.name;
      });
    return map;
  }, [categoriesData]);

  const asciiCategoryNames = useMemo(
    () => Object.values(nonThaiCategoryIdToName),
    [nonThaiCategoryIdToName],
  );

  const postsWithCategoryLabels = useMemo((): PostWithCategoryLabels[] => {
    const idKeys = new Set(Object.keys(nonThaiCategoryIdToName));
    return (
      (postData as WpPost[] | undefined)
        ?.map((fetchedPost) => ({
          ...fetchedPost,
          categories:
            fetchedPost.categories
              ?.map((categoryId) =>
                idKeys.has(String(categoryId))
                  ? nonThaiCategoryIdToName[String(categoryId)]
                  : null,
              )
              ?.filter((label): label is string => Boolean(label)) ?? [],
        }))
        ?.filter((p) => p.categories.length > 0) ?? []
    );
  }, [nonThaiCategoryIdToName, postData]);

  const categorySections = useMemo((): CategorySection[] => {
    const postsByCategory = new Map<string, PostCardModel[]>();
    for (const name of asciiCategoryNames) {
      postsByCategory.set(name, []);
    }
    for (const post of postsWithCategoryLabels) {
      for (const catName of post.categories) {
        const bucket = postsByCategory.get(catName);
        if (bucket) {
          bucket.push(post);
        }
      }
    }
    return asciiCategoryNames
      .map((categoryName) => ({
        categoryName,
        posts: postsByCategory.get(categoryName) ?? [],
      }))
      .filter((section) => section.posts.length > 0);
  }, [asciiCategoryNames, postsWithCategoryLabels]);

  const numberOfElementsToBeRendered = useMemo(() => {
    if (isXs) return 1;
    if (isSm) return 1;
    if (isMd) return 2;
    if (isLg) return 3;
    if (isXl) return 4;
    return 8;
  }, [isLg, isMd, isSm, isXl, isXs]);

  const cachedImageUrlById = useMemo(() => {
    const rows = (
      isXs || isSm ? cachedMobileImagesData : cachedImagesData
    ) as CachedImageRow[];
    return new Map(rows.map((row) => [row.id, row.url]));
  }, [isSm, isXs]);

  const sectionsWithImages = useMemo(
    () =>
      categorySections.map((section) => ({
        ...section,
        posts: section.posts.map((post) => ({
          ...post,
          imageUrl: cachedImageUrlById.get(post.featured_media ?? 0),
        })),
      })),
    [cachedImageUrlById, categorySections],
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
      ) : postError || categoryError ? (
        <div
          className='mx-6 my-8 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-5 text-white shadow-md'
          role='alert'
        >
          <p className='font-semibold uppercase tracking-wide text-sm opacity-90'>
            Something went wrong
          </p>
          <p className='mt-2 text-lg'>
            {[postError, categoryError]
              .filter(Boolean)
              .map((e) => errorMessage(e))
              .join(' · ')}
          </p>
        </div>
      ) : (
        <ul className='px-4 sm:px-6 h-full max-w-[1600px] mx-auto'>
          {sectionsWithImages.map(({ categoryName, posts }, idx) => (
            <li className='w-full my-16 h-full' key={`${idx}-${categoryName}`}>
              <CategoryHeader
                category={categoryName}
                categoryIdToName={nonThaiCategoryIdToName}
              />
              <PageBreak />
              <ul className='grid grid-cols-1 gap-8 md:gap-10 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 my-8'>
                {posts.slice(0, numberOfElementsToBeRendered).map((post) => (
                  <Post key={post.id} post={post} group={idx} />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default Home;
