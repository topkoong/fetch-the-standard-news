import PostsPageSkeleton from '@components/posts-page-skeleton';
import { PAGE_SIZE, THE_STANDARD_POSTS_ENDPOINT } from '@constants/index';
import useBreakpoints from '@hooks/use-breakpoints';
import { useCachedImageBundle } from '@hooks/use-cached-image-bundle';
import { usePageSeo } from '@hooks/use-page-seo';
import axios from 'axios';
import { Fragment } from 'preact';
import { lazy } from 'preact/compat';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useInfiniteQuery } from 'react-query';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { WpPost } from 'types/wp-api';

interface LinkState {
  category?: string;
}

interface CategoryPostsPage {
  posts: WpPost[];
  nextOffset: number;
  totalAvailable: number;
}

interface WpMediaResponse {
  guid?: {
    rendered?: string;
  };
}

function hasCategoryState(state: unknown): state is LinkState {
  return Boolean(state) && typeof state === 'object';
}

const PageBreak = lazy(() => import('@components/page-break'));
const PageHeader = lazy(() => import('@components/page-header'));
const Post = lazy(() => import('@components/post'));
const Spinner = lazy(() => import('@components/spinner'));

function Posts() {
  const { id } = useParams();
  const location = useLocation();
  const category = hasCategoryState(location.state) ? location.state.category : undefined;
  usePageSeo({
    title: category
      ? `${category} stories | The Standard Feed`
      : 'Category stories | The Standard Feed',
    description: category
      ? `Explore ${category} stories with curated context and fast load-more reading.`
      : 'Explore category stories with curated context and fast load-more reading.',
    url: id
      ? `https://topkoong.github.io/fetch-the-standard-news/posts/categories/${id}`
      : 'https://topkoong.github.io/fetch-the-standard-news/posts/categories',
  });

  const { isXs, isSm } = useBreakpoints();
  const isMobile = isXs || isSm;
  const { imagesReady, imageUrlById } = useCachedImageBundle(isMobile);

  const fetchCategoryPostsPage = useCallback(
    async ({
      pageParam,
      signal,
    }: {
      pageParam?: number;
      signal?: AbortSignal;
    }): Promise<CategoryPostsPage> => {
      const offset = pageParam ?? 0;
      const url = `${THE_STANDARD_POSTS_ENDPOINT}?categories=${id}&per_page=${PAGE_SIZE}&offset=${offset}&orderby=date&order=desc`;
      const response = await axios.get<WpPost[]>(url, { signal });
      const posts = response.data;
      const totalHeader = response.headers['x-wp-total'];
      const totalAvailable =
        typeof totalHeader === 'string' ? Number.parseInt(totalHeader, 10) : 0;

      const fallbackMediaHrefs = new Map<number, string>();
      for (const post of posts) {
        const mediaId = post.featured_media;
        if (!mediaId || imageUrlById.has(mediaId)) continue;
        const href = post._links?.['wp:featuredmedia']?.[0]?.href;
        if (href) fallbackMediaHrefs.set(mediaId, href);
      }

      const fetchedMediaById = new Map<number, string | undefined>();
      await Promise.all(
        Array.from(fallbackMediaHrefs.entries()).map(async ([mediaId, href]) => {
          const { data } = await axios.get<WpMediaResponse>(href, { signal });
          fetchedMediaById.set(mediaId, data.guid?.rendered);
        }),
      );

      const postsWithImage: WpPost[] = posts.map((post) => {
        const mediaId = post.featured_media;
        const imageUrl = mediaId
          ? imageUrlById.get(mediaId) ?? fetchedMediaById.get(mediaId)
          : undefined;
        return { ...post, imageUrl };
      });

      return {
        posts: postsWithImage,
        nextOffset: offset + posts.length,
        totalAvailable: Number.isFinite(totalAvailable) ? totalAvailable : 0,
      };
    },
    [id, imageUrlById],
  );

  const queryEnabled = Boolean(id) && imagesReady;
  const storageKey = id ? `category-visible-count-${id}` : null;
  const [restoreTargetCount, setRestoreTargetCount] = useState(PAGE_SIZE);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<CategoryPostsPage>(
      `posts-from-category-${id}`,
      fetchCategoryPostsPage,
      {
        enabled: queryEnabled,
        getNextPageParam: (lastPage) => {
          if (!lastPage?.posts?.length) {
            return undefined;
          }
          if (
            lastPage.totalAvailable > 0 &&
            lastPage.nextOffset >= lastPage.totalAvailable
          ) {
            return undefined;
          }
          if (lastPage.posts.length < PAGE_SIZE) {
            return undefined;
          }
          return lastPage.nextOffset;
        },
      },
    );

  const pages = data?.pages ?? [];
  const flattenedPosts = useMemo(() => pages.flatMap((page) => page.posts), [pages]);
  const showSkeleton = !imagesReady || (isLoading && pages.length === 0);

  useEffect(() => {
    if (!storageKey) return;
    if (typeof window === 'undefined') return;
    const raw = window.sessionStorage.getItem(storageKey);
    if (!raw) return;
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed > PAGE_SIZE) {
      setRestoreTargetCount(parsed);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    if (typeof window === 'undefined') return;
    if (!flattenedPosts.length) return;
    window.sessionStorage.setItem(storageKey, String(flattenedPosts.length));
  }, [flattenedPosts.length, storageKey]);

  useEffect(() => {
    if (!queryEnabled) return;
    if (!hasNextPage || isFetchingNextPage) return;
    if (flattenedPosts.length >= restoreTargetCount) return;
    void fetchNextPage();
  }, [
    fetchNextPage,
    flattenedPosts.length,
    hasNextPage,
    isFetchingNextPage,
    queryEnabled,
    restoreTargetCount,
  ]);

  return (
    <article className='w-full min-h-[50vh] py-8 max-w-[1600px] mx-auto'>
      <PageHeader title={category ?? 'Category'} />
      <p className='text-white/90 text-center max-w-3xl mx-auto px-4 text-sm sm:text-base mb-3'>
        Explore timely, high-impact stories in this category and uncover the details
        behind each headline.
      </p>
      <PageBreak />
      {showSkeleton ? (
        <PostsPageSkeleton />
      ) : flattenedPosts.length === 0 ? (
        <section className='mx-3 sm:mx-6 my-10 rounded-xl border-2 border-white/30 bg-white/10 p-6 text-center text-white'>
          <h2 className='text-xl font-extrabold uppercase tracking-wide'>
            No stories found for this desk
          </h2>
          <p className='mt-2 text-white/90'>
            This category may be quiet at the moment. Explore another desk for fresh
            updates.
          </p>
          <div className='mt-4 flex justify-center gap-3 flex-wrap'>
            <Link
              to='/posts/categories/39'
              state={{ category: 'News' }}
              className='btn-primary no-underline inline-flex items-center justify-center'
            >
              <span className='btn-secondary'>Go to top stories</span>
            </Link>
            <Link
              to='/'
              className='inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm no-underline hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bright-blue'
            >
              Back to homepage
            </Link>
          </div>
        </section>
      ) : (
        <Fragment>
          <ul className='grid grid-cols-1 gap-5 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-3 sm:px-6 h-full'>
            {flattenedPosts.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </ul>
          <div className='text-center mt-8 z-10'>
            {isFetchingNextPage ? (
              <div
                className='spinner-container py-8'
                aria-busy='true'
                aria-label='Loading more posts'
              >
                <Spinner />
              </div>
            ) : hasNextPage ? (
              <button
                type='button'
                className='btn-primary mx-auto'
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
                aria-label='Load more articles'
              >
                <span className='btn-secondary'>Show more stories</span>
              </button>
            ) : (
              <p className='btn-tertiary'>You&apos;ve reached the latest updates.</p>
            )}
          </div>
        </Fragment>
      )}
    </article>
  );
}

export default Posts;
