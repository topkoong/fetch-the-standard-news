import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/fetch-the-standard-news/',
  plugins: [preact(), tsconfigPaths()],
});
