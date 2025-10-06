import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    return {
      resolve: {
        alias: {
          // Fix: `__dirname` is not always available. Use `'./'` which resolves from the current working directory.
          '@': path.resolve('./'),
        }
      }
    };
});