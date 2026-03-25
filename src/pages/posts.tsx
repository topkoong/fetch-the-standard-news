import cachedImagesData from '@assets/cached/images.json';
import cachedMobileImagesData from '@assets/cached/mobile-images.json';
import { PAGE_SIZE, THE_STANDARD_POSTS_ENDPOINT } from '@constants/index';
import useBreakpoints from '@hooks/use-breakpoints';
import axios from 'axios';
import { Fragment } from 'preact';
import { lazy } from 'preact/compat';
import { useCallback, useMemo } from 'preact/hooks';
import { useInfiniteQuery } from 'react-query';
import { useLocation, useParams } from 'react-router-dom';

interface LinkState {
  category: string;
}

interface CachedImageRow {
  id: number;
  url: string;
}

const PageBreak = lazy(() => import('@components/page-break'));
const PageHeader = lazy(() => import('@components/page-header'));
const Post = lazy(() => import('@components/post'));
const Spinner = lazy(() => import('@components/spinner'));

function Posts() {
  const { id } = useParams();
  const location = useLocation();
  const { category }: LinkState = location.state as LinkState;
  const { isXs, isSm } = useBreakpoints();

  const imageUrlById = useMemo(() => {
    const rows = (
      isXs || isSm ? cachedMobileImagesData : cachedImagesData
    ) as CachedImageRow[];
    return new Map(rows.map((row) => [row.id, row.url]));
  }, [isSm, isXs]);

  const fetchCategoryPostsPage = useCallback(
    async ({ pageParam, signal }: { pageParam?: number; signal?: AbortSignal }) => {
      const offset = pageParam ?? 0;
      const url = `${THE_STANDARD_POSTS_ENDPOINT}?categories=${id}&per_page=${PAGE_SIZE}&offset=${offset}&orderby=date&order=desc`;
      const { data: posts } = await axios.get(url, { signal });

      const postsWithImage = await Promise.all(
        posts.map(async (post: any) => {
          const mediaId = post?.featured_media;
          if (mediaId && imageUrlById.has(mediaId)) {
            return { ...post, imageUrl: imageUrlById.get(mediaId) };
          }
          const href = post?.['_links']?.['wp:featuredmedia']?.[0]?.['href'];
          if (!href) {
            return { ...post, imageUrl: undefined };
          }
          const { data } = await axios.get(href, { signal });
          return {
            ...post,
            imageUrl: data?.guid?.rendered,
          };
        }),
      );

      return {
        posts: postsWithImage,
        nextOffset: offset + posts.length,
      };
    },
    [id, imageUrlById],
  );

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(`posts-from-category-${id}`, fetchCategoryPostsPage, {
      getNextPageParam: (lastPage) => {
        if (!lastPage?.posts?.length || lastPage.posts.length < PAGE_SIZE) {
          return undefined;
        }
        return lastPage.nextOffset;
      },
    });

  return (
    <article className='w-full min-h-[50vh] py-8 max-w-[1600px] mx-auto'>
      <PageHeader title={category} />
      <PageBreak />
      {isLoading ? (
        <div
          className='spinner-container py-20'
          aria-busy='true'
          aria-label='Loading posts'
        >
          <Spinner />
        </div>
      ) : (
        <Fragment>
          <ul className='grid grid-cols-1 gap-8 md:gap-10 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 sm:px-6 h-full'>
            {data?.pages?.map((page: any) =>
              page?.posts.map((post: any) => <Post key={post.id} post={post} />),
            )}
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
                <span className='btn-secondary'>Load more</span>
              </button>
            ) : (
              <p className='btn-tertiary'>You&apos;re all caught up.</p>
            )}
          </div>
        </Fragment>
      )}
    </article>
  );
}

export default Posts;
