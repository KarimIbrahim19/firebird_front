// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../store/authStore';
import { getAppName, APP_CONFIG } from '../../config/constants';
import Sidebar from './Sidebar';
import Header from './Header';
 
const MainLayout = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { language } = useUIStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
 
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/customers')
      return t('clients.title');
    if (path === '/dashboard') return t('dashboard.title');
    if (path === '/products')  return t('products.title');
    if (path === '/orders')    return t('orders.title');
    if (path === '/statement') return t('statement.title');
    if (path === '/profile')   return t('profile.title');
    return '';
  };
 
  const isHome =
    location.pathname === '/' || location.pathname === '/customers';
 
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
 
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
 
      {/* Main content shifted right on desktop */}
      <div className="lg:ps-64 flex flex-col min-h-screen">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          pageTitle={getPageTitle()}
        />
 
        <main className="flex-1">
          {/* Breadcrumb (hidden on home / customers page) */}
          {/*!isHome && (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2.5">
              <nav className="text-sm max-w-7xl mx-auto">
                <ol className="flex items-center gap-2">
                  <li>
                    <a
                      href="/"
                      className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                    >
                      {t('clients.title')}
                    </a>
                  </li>
                  <li className="text-gray-400 dark:text-gray-600">/</li>
                  <li className="text-gray-900 dark:text-white font-medium">
                    {getPageTitle()}
                  </li>
                </ol>
              </nav>
            </div>
          )*/}
 
          {children}
        </main>
 
        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} {getAppName(language)}. v{APP_CONFIG.version}{' '}
              {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
 
export default MainLayout;