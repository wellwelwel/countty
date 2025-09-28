// @ts-check

import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    file: 'server/index.js',
    format: 'esm',
  },
  plugins: [
    resolve(),
    typescript({
      tsconfig: './tsconfig.json',
    }),
    terser({
      format: {
        comments: false,
      },
    }),
  ],
});
