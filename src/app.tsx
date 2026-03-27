import HomeSkeleton from '@components/home-skeleton';
import PostsPageSkeleton from '@components/posts-page-skeleton';
import Spinner from '@components/spinner';
import { REFETCH_INTERVAL } from '@constants/index';
import { lazy, Suspense } from 'preact/compat';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Route, Routes } from 'react-router-dom';

const Navbar = lazy(() => import('@components/navbar'));
const Home = lazy(() => import('@pages/home'));
const Posts = lazy(() => import('@pages/posts'));
const ReadStory = lazy(() => import('@pages/read-story'));
const TopicLanding = lazy(() => import('@pages/topic-landing'));

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: REFETCH_INTERVAL * 3,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <a
        href='#main-content'
        className='sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded-md'
      >
        Skip to main content
      </a>
      <Suspense fallback={<Spinner />}>
        <Navbar />
      </Suspense>
      <main id='main-content'>
        <Routes>
          <Route
            path='/'
            element={
              <Suspense
                fallback={
                  <div className='min-h-[50vh] bg-bright-blue'>
                    <HomeSkeleton />
                  </div>
                }
              >
                <Home />
              </Suspense>
            }
          />
          <Route
            path='posts/categories/:id'
            element={
              <Suspense
                fallback={
                  <div className='min-h-[40vh] bg-bright-blue py-8'>
                    <PostsPageSkeleton />
                  </div>
                }
              >
                <Posts />
              </Suspense>
            }
          />
          <Route
            path='read/:id'
            element={
              <Suspense fallback={<Spinner />}>
                <ReadStory />
              </Suspense>
            }
          />
          <Route
            path='topics/:topic'
            element={
              <Suspense fallback={<Spinner />}>
                <TopicLanding />
              </Suspense>
            }
          />
        </Routes>
      </main>
    </QueryClientProvider>
  );
}

export default App;
