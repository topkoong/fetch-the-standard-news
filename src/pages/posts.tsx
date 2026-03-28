/**
 * Category (“desk”) listing: paginated grid of posts for one WordPress category id.
 *
 * Data flow (all offline-friendly after build):
 * 1. `posts.json` — full post list; we filter by `post.categories` containing the
 *    numeric id from the URL (`/posts/categories/:id`).
 * 2. `images.json` / `mobile-images.json` — maps `featured_media` id → image URL.
 *    Loaded via `useCachedImageBundle` (same-origin `fetch` of a hashed chunk), not
 *    the WP media API in the browser.
 * 3. `useInfiniteQuery` slices the filtered array client-side for “load more” UX;
 *    there is no second network round-trip per page.
 *
 * Session storage: remembers how many items the user had expanded so we can
 * auto-fetch pages on return navigation (see effects below).
 */
import allPostsJson from '@assets/cached/posts.json';
import { EmptyStatePanel } from '@components/empty-state-panel';
import PostsPageSkeleton from '@components/posts-page-skeleton';
import { PAGE_SIZE, PUBLIC_SITE_URL } from '@constants/index';
import useBreakpoints from '@hooks/use-breakpoints';
import { useCachedImageBundle } from '@hooks/use-cached-image-bundle';
import { usePageSeo } from '@hooks/use-page-seo';
import { resolveImageUrl } from '@utils/formatters';
import { Fragment } from 'preact';
import { lazy } from 'preact/compat';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { useInfiniteQuery } from 'react-query';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { WpPost } from 'types/wp-api';

/** Optional label passed from `<Link state={{ category: 'News' }} />` for headings/SEO. */
interface LinkState {
  category?: string;
}

/** One “page” of infinite query: slice metadata for react-query pagination. */
interface CategoryPostsPage {
  posts: WpPost[];
  /** Index immediately after the last item in `posts` within the full filtered list. */
  nextOffset: number;
  /** Total posts in this category (before paging). */
  totalAvailable: number;
}

function hasCategoryState(state: unknown): state is LinkState {
  return Boolean(state) && typeof state === 'object';
}

const ALL_POSTS = allPostsJson as WpPost[];

const PageBreak = lazy(() => import('@components/page-break'));
const PageHeader = lazy(() => import('@components/page-header'));
const Post = lazy(() => import('@components/post'));
const Spinner = lazy(() => import('@components/spinner'));

function Posts() {
  const { id } = useParams();
  const location = useLocation();
  const category = hasCategoryState(location.state) ? location.state.category : undefined;
  /* One canonical/og:url per desk; `id` comes from the route so deep links share correctly. */
  const postsCanonical = id
    ? `${PUBLIC_SITE_URL}/posts/categories/${id}`
    : `${PUBLIC_SITE_URL}/posts/categories`;
  usePageSeo({
    title: category
      ? `${category} stories | The Standard Feed`
      : 'Category stories | The Standard Feed',
    description: category
      ? `Explore ${category} stories with curated context and fast load-more reading.`
      : 'Explore category stories with curated context and fast load-more reading.',
    url: postsCanonical,
    canonicalUrl: postsCanonical,
    ogType: 'website',
  });

  const { isXs, isSm } = useBreakpoints();
  const isMobile = isXs || isSm;
  /* Wait for the correct desktop/mobile image map before enabling the query. */
  const { imagesReady, imageUrlById } = useCachedImageBundle(isMobile);

  const categoryIdNum = useMemo(() => {
    if (!id) return NaN;
    return Number.parseInt(id, 10);
  }, [id]);

  /* Newest first, same mental model as the old `orderby=date&order=desc` API call. */
  const postsForCategory = useMemo(() => {
    if (!Number.isFinite(categoryIdNum)) return [];
    return ALL_POSTS.filter((p) => p.categories?.includes(categoryIdNum)).sort((a, b) => {
      const da = a.date ? Date.parse(a.date) : 0;
      const db = b.date ? Date.parse(b.date) : 0;
      return db - da;
    });
  }, [categoryIdNum]);

  const fetchCategoryPostsPage = useCallback(
    async ({
      pageParam,
    }: {
      pageParam?: number;
      signal?: AbortSignal;
    }): Promise<CategoryPostsPage> => {
      const offset = pageParam ?? 0;
      const slice = postsForCategory.slice(offset, offset + PAGE_SIZE);
      const postsWithImage: WpPost[] = slice.map((post) => {
        const mediaId = post.featured_media;
        /* `images.json` rows are keyed by WP media id from the bash pipeline. */
        const raw =
          mediaId !== undefined && mediaId !== null && mediaId !== 0
            ? (imageUrlById.get(mediaId) ?? '')
            : '';
        return { ...post, imageUrl: resolveImageUrl(raw) };
      });
      return {
        posts: postsWithImage,
        nextOffset: offset + slice.length,
        totalAvailable: postsForCategory.length,
      };
    },
    [postsForCategory, imageUrlById],
  );

  const queryEnabled = Boolean(id) && imagesReady && Number.isFinite(categoryIdNum);
  const storageKey = id ? `category-visible-count-${id}` : null;
  const [restoreTargetCount, setRestoreTargetCount] = useState(PAGE_SIZE);

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<CategoryPostsPage>(
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
        /* Short final page means there is nothing left to request. */
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

  /* On mount: if user previously loaded N items, remember N for auto-pagination below. */
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

  /* Persist visible count whenever the list grows (manual “Show more” or restore). */
  useEffect(() => {
    if (!storageKey) return;
    if (typeof window === 'undefined') return;
    if (!flattenedPosts.length) return;
    window.sessionStorage.setItem(storageKey, String(flattenedPosts.length));
  }, [flattenedPosts.length, storageKey]);

  /* Silently pull extra pages until we reach the saved count (e.g. back button). */
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
      ) : error ? (
        <EmptyStatePanel
          title='Unable to load this desk right now'
          description='The source may be temporarily unavailable. Retry or open another desk.'
          role='alert'
        >
          <button type='button' className='btn-primary' onClick={() => void refetch()}>
            <span className='btn-secondary'>Retry desk</span>
          </button>
          <Link
            to='/posts/categories/39'
            state={{ category: 'News' }}
            className='inline-flex items-center justify-center rounded-xl border-2 border-white/60 bg-white/10 px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm no-underline hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bright-blue'
          >
            Go to top stories
          </Link>
        </EmptyStatePanel>
      ) : flattenedPosts.length === 0 ? (
        <EmptyStatePanel
          title='No stories found for this desk'
          description='This category may be quiet at the moment. Explore another desk for fresh updates.'
        >
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
        </EmptyStatePanel>
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
