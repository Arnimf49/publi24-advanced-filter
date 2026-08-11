import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

const basePath = process.env.BASE_PATH || '/';
const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`;

export default defineConfig({
  root: 'src-presentation',
  base: normalizedBasePath,
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$presentation-base-path: "${normalizedBasePath}";`,
      },
    },
  },
  build: {
    outDir: '../dist-presentation',
    emptyOutDir: true,
  },
});
