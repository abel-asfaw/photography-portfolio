import { resolve } from 'path';
import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';

import postcss from './postcss.config';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 3000,
        allowedHosts: ['client'],
    },
    resolve: {
        alias: [{ find: '@', replacement: resolve(__dirname, './') }],
    },
    css: {
        postcss,
    },
});
