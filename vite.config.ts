import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      devOptions: {
        enabled: true,
        type: 'module',
      },
      includeAssets: ['aurora-sentinel-logo.png', 'no-test.mp3'],
      manifest: {
        name: 'Aurora Sentinel',
        short_name: 'Aurora',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#0ea5e9',
        icons: [
          {
            src: '/aurora-sentinel-logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/aurora-sentinel-logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/socket.io'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 3000,
  },
});
