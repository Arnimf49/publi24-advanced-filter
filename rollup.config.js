import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const isPromoter = process.env.PROMOTER === 'true';
const isWatchMode = !!process.env.ROLLUP_WATCH;

const makeStyledSource = (root, file) => ({
  input: `src/${root}/${file}`,
  output: {
    file: `dist/${root}/${file.replace(/\.ts$/, '.js')}`,
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
    json(),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      'process.env.PROMOTER': JSON.stringify(isPromoter ? 'true' : 'false'),
      'process.env.WATCH_MODE': JSON.stringify(isWatchMode),
    }),
    resolve({ browser: true, extensions: ['.js', '.ts', '.tsx', '.json'] }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: !isProduction,
      inlineSources: !isProduction,
    }),
    postcss({
      extract: path.resolve(`dist/${root}/styles.css`),
      modules: {
        generateScopedName: isProduction
          ? '[hash:base64:5]'
          : '[name]__[local]___[hash:base64:5]',
      },
      use: {
        sass: {
          silenceDeprecations: ['legacy-js-api'],
        },
      },
      plugins: [
        autoprefixer(),
        isProduction ? cssnano() : null,
      ].filter(Boolean),
      sourceMap: !isProduction,
    }),
  ],
  watch: {}
})

const makeSimpleSource = (root, file) => ({
  input: `src/${root}/${file}`,
  output: {
    file: `dist/${root}/${file.replace(/\.ts$/, '.js')}`,
    format: 'iife',
    sourcemap: !isProduction,
  },
  plugins: [
    json(),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      'process.env.WATCH_MODE': JSON.stringify(isWatchMode),
    }),
    resolve({ browser: true, extensions: ['.js', '.ts', '.tsx', '.json'] }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: !isProduction,
      inlineSources: !isProduction,
    }),
  ]
})

export default [
  makeStyledSource('publi24', 'index.ts'),
  makeSimpleSource('publi24', 'search_parser.ts'),
  makeSimpleSource('publi24', 'search_image_parser.ts'),

  makeStyledSource('nimfomane', 'index.ts'),
];
