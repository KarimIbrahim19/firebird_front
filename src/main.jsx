// /src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/index.css';
import './i18n/config';

// Lazy load React Query DevTools only in development
const ReactQueryDevtools = import.meta.env.DEV
  ? React.lazy(() =>
      import('@tanstack/react-query-devtools').then((module) => ({
        default: module.ReactQueryDevtools,
      }))
    )
  : () => null;

// Get cache and retry settings from env
const CACHE_DURATION = parseInt(import.meta.env.VITE_CACHE_DURATION) || 300; // seconds
const API_RETRY_COUNT = parseInt(import.meta.env.VITE_API_RETRY_COUNT) || 3;

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_DURATION * 1000, // Convert seconds to milliseconds
      gcTime: CACHE_DURATION * 2 * 1000, // 2x staleTime for garbage collection
      retry: API_RETRY_COUNT,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Initialize UI settings from localStorage
const initializeUI = () => {
  try {
    const uiStorage = localStorage.getItem('ui-storage');
    if (uiStorage) {
      const { state } = JSON.parse(uiStorage);
      
      // Set theme
      if (state?.theme) {
        document.documentElement.setAttribute('data-theme', state.theme);
      }
      
      // Set language and direction
      if (state?.language) {
        document.documentElement.setAttribute('dir', state.language === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', state.language);
      }
    }
  } catch (error) {
    console.error('Error initializing UI settings:', error);
    // Set defaults
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('dir', 'rtl');
    document.documentElement.setAttribute('lang', 'ar');
  }
};

// Initialize UI settings before rendering
initializeUI();

// Register Service Worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              if (window.confirm('تحديث جديد متاح. هل تريد التحديث الآن؟')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Handle online/offline status
window.addEventListener('online', () => {
  console.log('Back online');
  queryClient.refetchQueries();
});

window.addEventListener('offline', () => {
  console.log('Offline mode');
});

// Handle app visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Refetch critical data when app becomes visible
    queryClient.invalidateQueries({ queryKey: ['current-pharmacy'] });
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
  }
});

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && (
        <React.Suspense fallback={null}>
          <ReactQueryDevtools />
        </React.Suspense>
      )}
    </QueryClientProvider>
  </React.StrictMode>
);

// Remove loading screen after app renders
setTimeout(() => {
  const loadingScreen = document.querySelector('.app-loading');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => {
      loadingScreen.remove();
    }, 300);
  }
}, 100);