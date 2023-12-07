/// <reference types="vitest" />
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';
import cssAutoImport from 'vite-plugin-css-auto-import';

export default defineConfig({
  plugins: [cssAutoImport(), solid(), tsconfigPaths()],
  test: {
    environment: 'happy-dom',
    globals: true,
    // includeSource: ['src/**/*.ts', 'src/**/*.tsx'],
    // deps: {
    //   optimizer: {
    //     web: {
    //       include: ['src/**/*.ts', 'src/**/*.tsx'],
    //     },
    //   },
    // },
  },
});