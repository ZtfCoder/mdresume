import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_URL || '/',
  resolve: {
    alias: {
      path: 'path-browserify',
    },
  },
  define: {
    'process.platform': JSON.stringify(''),
    'process.env': '{}',
  },
});
