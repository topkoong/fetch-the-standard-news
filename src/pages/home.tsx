import fetchCategories from '@apis/categories';
import fetchPosts from '@apis/posts';
import HomeSkeleton from '@components/home-skeleton';
import Spinner from '@components/spinner';
import { REFETCH_INTERVAL } from '@constants/index';
import useBreakpoints from '@hooks/use-breakpoints';
import { useCachedFeedBootstrap } from '@hooks/use-cached-feed-bootstrap';
import { lazy } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { useQuery } from 'react-query';

const PageBreak = lazy(() => import('@components/page-break'));
const PageHeader = lazy(() => import('@components/page-header'));
const Post = lazy(() => import('@components/post'));
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

interface PostWithCategoryLabels extends Omit<WpPost, 'categories'> {
  categories: string[];
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
  const isMobile = isXs || isSm;
  const { cacheReady, imageUrlById } = useCachedFeedBootstrap(isMobile);

  const {
    data: postData,
    error: postError,
    status: postStatus,
  } = useQuery('allposts', fetchPosts, {
    refetchInterval: REFETCH_INTERVAL * 3,
    staleTime: REFETCH_INTERVAL * 3,
  });
  const {
    data: categoriesData,
    error: categoryError,
    status: categoryStatus,
  } = useQuery('allcategories', fetchCategories, {
    refetchInterval: REFETCH_INTERVAL * 3,
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
    const postsByCategory = new Map<string, PostWithCategoryLabels[]>();
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

  const sectionsWithImages = useMemo(
    () =>
      categorySections.map((section) => ({
        ...section,
        posts: section.posts.map((post) => ({
          ...post,
          imageUrl: imageUrlById.get(post.featured_media ?? 0),
        })),
      })),
    [categorySections, imageUrlById],
  );

  const showInitialShell = !cacheReady;
  const showQuerySpinner =
    cacheReady && (postStatus === 'loading' || categoryStatus === 'loading');

  return (
    <article className='w-full min-h-[60vh] pb-10'>
      <PageHeader title='Toppy × The Standard News' />
      {showInitialShell ? (
        <HomeSkeleton />
      ) : showQuerySpinner ? (
        <div
          className='spinner-container py-24'
          aria-busy='true'
          aria-label='Refreshing news'
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
