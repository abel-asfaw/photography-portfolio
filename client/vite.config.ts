import { resolve } from 'path';

import stylex from '@stylexjs/unplugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // StyleX must run before react() to keep Fast Refresh working.
  plugins: [
    // StyleX resolves .stylex.ts imports itself, so it needs the alias too.
    stylex({ aliases: { '@/*': [resolve(import.meta.dirname, '*')] } }),
    react(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['client'],
  },
  resolve: {
    alias: [{ find: '@', replacement: resolve(import.meta.dirname, './') }],
  },
});
