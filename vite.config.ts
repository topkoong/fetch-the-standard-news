import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/fetch-the-standard-news/',
  plugins: [preact(), tsconfigPaths()],
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});
