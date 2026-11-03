import { resolve } from 'path';

import stylex from '@stylexjs/unplugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Tests need StyleX compiled, but not its dev server hook: that starts a
// polling timer which is only cleared when an HTTP server closes, and Vitest
// never opens one, so the run hangs for 10s at exit. Written against
// @stylexjs/unplugin 0.19.1; recheck when upgrading.
const stylexPlugin = {
  ...stylex({ aliases: { '@/*': [resolve(__dirname, '*')] } }),
  configureServer: undefined,
};

export default defineConfig({
  plugins: [stylexPlugin, react()],
  resolve: {
    alias: [{ find: '@', replacement: resolve(__dirname, './') }],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
});
