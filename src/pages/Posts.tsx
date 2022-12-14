import { PAGE_SIZE, THE_STANDARD_POSTS_ENDPOINT } from '@constants/index';
import axios from 'axios';
import { lazy } from 'preact/compat';
import { useState } from 'preact/hooks';
import { useInfiniteQuery } from 'react-query';
import { useLocation, useParams } from 'react-router-dom';
interface LinkState {
  category: string;
}

interface ImageUrl {
  url: string;
  id: number;
}

const PageBreak = lazy(() => import('@components/PageBreak'));
const PageHeader = lazy(() => import('@components/PageHeader'));
const Post = lazy(() => import('@components/Post'));
const Spinner = lazy(() => import('@components/Spinner'));

function Posts() {
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const { id } = useParams();
  const location = useLocation();
  const { category }: LinkState = location.state as LinkState;
  const fetchPosts = async ({
    pageParam = `${THE_STANDARD_POSTS_ENDPOINT}?categories=${id}&per_page=${PAGE_SIZE}&offset=${currentOffset}`,
  }) => {
    try {
      setCurrentOffset((prevOffSet) => prevOffSet + PAGE_SIZE);
      const { data: posts } = await axios.get(pageParam);
      const urls = posts.map(
        (post: any) => post?.['_links']?.['wp:featuredmedia'][0]?.['href'],
      );
      const responses = await Promise.all(urls.map((url: string) => axios.get(url)));
      const imageUrls: ImageUrl[] = responses?.map(({ data }) => ({
        id: data?.id,
        url: data?.guid?.rendered,
      }));
      const postsWithImage = posts.map((post: any) => ({
        ...post,
        imageUrl: imageUrls?.find(
          (imageUrl: ImageUrl) => imageUrl?.id === post?.featured_media,
        )?.url,
      }));
      return { posts: postsWithImage, nextCursor: currentOffset };
    } catch (err) {
      console.error(err);
    }
  };
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      `posts-from-category-${id}`,
      ({
        pageParam = `${THE_STANDARD_POSTS_ENDPOINT}?categories=${id}&per_page=${PAGE_SIZE}&offset=${currentOffset}`,
      }) => fetchPosts(pageParam),
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      },
    );

  return (
    <article className='w-full h-full py-8'>
      <PageHeader title={category} />
      <PageBreak />
      {isLoading ? (
        <div className='spinner-container'>
          <Spinner />
        </div>
      ) : (
        <>
          <ul className='grid grid-cols-1 gap-12 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-6 h-full'>
            {data?.pages?.map((page: any) =>
              page?.posts.map((post: any) => <Post key={post.id} post={post} />),
            )}
          </ul>
          <div className='text-center mt-8 z-10'>
            {isFetchingNextPage ? (
              <div className='spinner-container'>
                <Spinner />
              </div>
            ) : hasNextPage ? (
              <button
                className='btn-primary'
                onClick={() =>
                  fetchNextPage({
                    pageParam: `${THE_STANDARD_POSTS_ENDPOINT}?categories=${id}&per_page=${PAGE_SIZE}&offset=${currentOffset}`,
                  })
                }
                disabled={!hasNextPage || isFetchingNextPage}
              >
                <span className='btn-secondary'>Load more</span>
              </button>
            ) : (
              <h1 className='btn-terinary'>Nothing more to load</h1>
            )}
          </div>
        </>
      )}
    </article>
  );
}

export default Posts;
