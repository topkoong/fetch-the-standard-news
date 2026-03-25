import './app.css';

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
      <Suspense fallback={<Spinner />}>
        <Navbar />
      </Suspense>
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
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
