import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';

const basePath = process.env.BASE_PATH || '/';
const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`;

export default defineConfig({
  root: 'src-presentation',
  base: normalizedBasePath,
  plugins: [
    react(),
    checker({
      typescript: {
        tsconfigPath: './src-presentation/tsconfig.json',
      },
      enableBuild: false,
    }),
  ],
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
