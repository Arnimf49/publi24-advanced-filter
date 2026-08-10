import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'src-presentation',
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  build: {
    outDir: '../dist-presentation',
    emptyOutDir: true,
  },
});
