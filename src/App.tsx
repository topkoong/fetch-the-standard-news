import { QueryClient, QueryClientProvider, useInfiniteQuery } from 'react-query';
import { Route, Routes } from 'react-router-dom';

import { Home } from './Home';
import { Posts } from './components/Posts';

function App() {
  // Create a client
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="posts/categories/:id" element={<Posts />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
