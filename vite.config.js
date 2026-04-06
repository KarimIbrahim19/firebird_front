import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');
  const offlineCacheDuration = parseInt(env.VITE_OFFLINE_CACHE_DURATION) || 86400; // 24 hours default
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://10.10.20.80:3001/api';

  // App information from env
  const appName = env.VITE_APP_NAME || 'دار الحكمة';
  const appNameEn = env.VITE_APP_NAME_EN || 'Dar ElHekma';
  const appDescription = env.VITE_APP_DESCRIPTION || 'بوابة إلكترونية لطلبات الصيدليات';
  const appDescriptionEn = env.VITE_APP_DESCRIPTION_EN || 'Pharmacy Portal for Orders Management';

  // Create regex pattern from API base URL for service worker caching
  // Escape special regex characters and create pattern
  const escapedApiUrl = apiBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const apiUrlPattern = new RegExp(`^${escapedApiUrl}/.*`, 'i');

  return {
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: `${appName} - ${appDescription}`,
        short_name: appName,
        description: appDescription,
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        dir: 'rtl',
        lang: 'ar',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['medical', 'shopping'],
        screenshots: [
          {
            src: '/screenshots/home-ar.png',
            sizes: '1080x1920',
            type: 'image/png',
            label: 'الصفحة الرئيسية'
          },
          {
            src: '/screenshots/products-ar.png',
            sizes: '1080x1920',
            type: 'image/png',
            label: 'المنتجات'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: apiUrlPattern, // Use dynamic pattern from env
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: offlineCacheDuration, // Use env variable
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days (images can stay longer)
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@tanstack/react-query', 'zustand', 'react-hook-form'],
          'utils': ['axios', 'date-fns']
        }
      }
    }
  }
  }
});