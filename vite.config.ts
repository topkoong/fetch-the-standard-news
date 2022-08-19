import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/fetch-the-standard-news/',
  plugins: [preact()],
});
