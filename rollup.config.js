import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'iife',
      sourcemap: !isProduction,
      globals: {
        'react': 'React',
        'react-dom/client': 'ReactDOM',
        'react-dom': 'ReactDOM'
      }
    },
    external: ['react', 'react-dom/client', 'react-dom'],
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: !isProduction,
        inlineSources: !isProduction,
      }),
      postcss({
        extract: path.resolve('dist/styles.css'),
        modules: {
          generateScopedName: isProduction
            ? '[hash:base64:5]'
            : '[name]__[local]___[hash:base64:5]',
        },
        use: ['sass'],
        plugins: [
          autoprefixer(),
          isProduction ? cssnano() : null,
        ].filter(Boolean),
        sourceMap: !isProduction,
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      }),
    ],
    watch: {
      // Optional: Add watch options if needed, e.g., clearScreen: false
    }
  },

  {
    input: 'src/search_parser.ts',
    output: {
      file: 'dist/search_parser.js',
      format: 'iife',
      sourcemap: !isProduction,
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: !isProduction,
        inlineSources: !isProduction,
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      }),
    ]
  },

  {
    input: 'src/search_image_parser.ts',
    output: {
      file: 'dist/search_image_parser.js',
      format: 'iife',
      sourcemap: !isProduction,
    },
    plugins: [
      resolve({ browser: true }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: !isProduction,
        inlineSources: !isProduction,
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      }),
    ]
  }
];
