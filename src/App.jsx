// src/App.jsx
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useAuthStore, { useUIStore } from './store/authStore';

// Lazy-loaded pages
const LoginPage     = lazy(() => import('./pages/Login'));
const CustomersPage = lazy(() => import('./pages/Customers'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const ProductsPage  = lazy(() => import('./pages/Products'));
const OrdersPage    = lazy(() => import('./pages/Orders'));
const StatementPage = lazy(() => import('./pages/Statement'));
const ProfilePage   = lazy(() => import('./pages/Profile'));

// Layout & common
import MainLayout      from './components/layout/MainLayout';
import LoadingScreen   from './components/common/LoadingScreen';
import ErrorBoundary   from './components/common/ErrorBoundary';
import OfflineIndicator from './components/common/OfflineIndicator';

// ── Protected Route ──────────────────────────────────────────────────────────
// Employees: only check authentication — no pharmacy selection gate.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

// ── Public Route ─────────────────────────────────────────────────────────────
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const { i18n } = useTranslation();
  const { theme, language, initializeUI } = useUIStore();

  useEffect(() => { initializeUI(); }, []);

  useEffect(() => {
    if (i18n.language !== language) i18n.changeLanguage(language);
  }, [language, i18n]);

  useEffect(() => {
    const handler = (e) => e.preventDefault();
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* ── Public ── */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* ── Default home: Customer Search ── */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <CustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <CustomersPage />
                </ProtectedRoute>
              }
            />

            {/* ── Other protected pages ── */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/products"  element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
            <Route path="/orders"    element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/statement" element={<ProtectedRoute><StatementPage /></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        <Toaster
          position="top-center"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background:   theme === 'dark' ? '#1f2937' : '#fff',
              color:        theme === 'dark' ? '#f3f4f6' : '#111827',
              borderRadius: '0.5rem',
              padding:      '12px 16px',
              boxShadow:    '0 10px 15px -3px rgba(0,0,0,0.1)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: theme === 'dark' ? '#1f2937' : '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: theme === 'dark' ? '#1f2937' : '#fff' } },
          }}
        />

        <OfflineIndicator />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
