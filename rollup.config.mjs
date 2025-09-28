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
    resolve({
      preferBuiltins: false,
      browser: false,
      exportConditions: ['node', 'import', 'module', 'default'],
      dedupe: [],
    }),
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        module: 'ESNext',
        target: 'ESNext',
        moduleResolution: 'node',
      },
    }),
    terser({
      format: {
        comments: false,
      },
    }),
  ],
  external: ['cloudflare:workers'],
});
