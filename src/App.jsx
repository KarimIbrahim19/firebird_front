// /src/App.jsx
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useAuthStore, { useUIStore, usePharmacyStore } from './store/authStore';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/Login'));
const RegisterPage = lazy(() => import('./pages/Register'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const ProductsPage = lazy(() => import('./pages/Products'));
const OrdersPage = lazy(() => import('./pages/Orders'));
const StatementPage = lazy(() => import('./pages/Statement'));
const ProfilePage = lazy(() => import('./pages/Profile'));

// Components
import MainLayout from './components/layout/MainLayout';
import PharmacySelector from './components/pharmacy/PharmacySelector';
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';
import OfflineIndicator from './components/common/OfflineIndicator';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const { currentPharmacy, isLoading } = usePharmacyStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Save the location user tried to access, so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show loading screen while fetching current pharmacy
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!currentPharmacy) {
    return <PharmacySelector />;
  }

  return <MainLayout>{children}</MainLayout>;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Main App Component
function App() {
  const { i18n } = useTranslation();
  const { theme, language, initializeUI } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  
  // Initialize UI settings on mount
  useEffect(() => {
    initializeUI();
  }, []);
  
  // Sync i18n with UI store language
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);
  
  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        try {
          // Fetch current pharmacy if authenticated
          const { fetchCurrentPharmacy } = usePharmacyStore.getState();
          await fetchCurrentPharmacy();
        } catch (error) {
          console.error('Failed to fetch current pharmacy:', error);
        }
      }
    };
    
    checkAuth();
  }, [isAuthenticated]);
  
  // Register PWA install prompt
  useEffect(() => {
    let deferredPrompt;
    
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button/banner if needed
      // You can store this in a state and show a custom install UI
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/products" 
              element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/statement" 
              element={
                <ProtectedRoute>
                  <StatementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      404
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                      {i18n.language === 'ar' ? 'الصفحة غير موجودة' : 'Page not found'}
                    </p>
                    <a 
                      href="/" 
                      className="btn btn-primary"
                    >
                      {i18n.language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </Suspense>
        
        {/* Global Components */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          toastOptions={{
            duration: 4000,
            style: {
              background: theme === 'dark' ? '#1f2937' : '#fff',
              color: theme === 'dark' ? '#f3f4f6' : '#111827',
              borderRadius: '0.5rem',
              padding: '12px 16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: theme === 'dark' ? '#1f2937' : '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: theme === 'dark' ? '#1f2937' : '#fff',
              },
            },
          }}
        />
        
        <OfflineIndicator />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;