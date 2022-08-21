import { PAGE_SIZE, THE_STANDARD_POSTS_ENDPOINT } from '../constants';
import { useLocation, useParams } from 'react-router-dom';

import PageBreak from '../components/PageBreak';
import PageHeader from '../components/PageHeader';
import Post from '../components/Post';
import Spinner from '../components/Spinner';
import axios from 'axios';
import { useInfiniteQuery } from 'react-query';
import { useState } from 'preact/hooks';

interface LinkState {
  category: string;
}

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
      const { data } = await axios.get(pageParam);
      return { posts: data, nextCursor: currentOffset };
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
    <article className="bg-bright-blue w-full h-full py-8">
      <PageHeader title={category} />
      <PageBreak />
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <Spinner />
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-8 px-6 h-full">
            {data?.pages?.map((page: any) =>
              page?.posts.map((post: any) => <Post key={post.id} post={post} />),
            )}
          </ul>
          <div className="text-center mt-8 z-10">
            {isFetchingNextPage ? (
              <div className="flex items-center justify-center h-full">
                <Spinner />
              </div>
            ) : hasNextPage ? (
              <button
                className="cursor-pointer relative bg-black w-40 md:w-48 lg:w-52 p-8 after:absolute after:content-[''] after:-translate-x-2 after:-translate-y-2 after:font-bold after:left-0 after:top-0 after:border after:border-4 after:border-black after:bg-white after:w-40 after:md:w-48 after:lg:w-52 after:h-full after:z-10"
                onClick={() =>
                  fetchNextPage({
                    pageParam: `${THE_STANDARD_POSTS_ENDPOINT}?categories=${id}&per_page=${PAGE_SIZE}&offset=${currentOffset}`,
                  })
                }
                disabled={!hasNextPage || isFetchingNextPage}
              >
                <span className="relative z-20 text-black font-bold w-full h-full -translate-x-2 -translate-y-2 uppercase text-2xl">
                  Load more
                </span>
              </button>
            ) : (
              <h1 className="text-center font-extrabold leading-tight text-5xl py-8 text-white uppercase">
                Nothing more to load
              </h1>
            )}
          </div>
        </>
      )}
    </article>
  );
}

export default Posts;
