import { QueryClient, QueryClientProvider } from 'react-query';
import { Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Posts from './pages/Posts';

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
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='posts/categories/:id' element={<Posts />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
