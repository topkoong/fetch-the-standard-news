import Spinner from '@components/Spinner';
import Home from '@pages/Home';
import Posts from '@pages/Posts';
import { lazy, Suspense } from 'preact/compat';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Route, Routes } from 'react-router-dom';

const Navbar = lazy(() => import('@components/Navbar'));

function App() {
  // Create a client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Spinner />}>
        <Navbar />
      </Suspense>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='posts/categories/:id' element={<Posts />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
