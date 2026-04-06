// /src/components/common/MainLayout.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore, { useUIStore, usePharmacyStore } from '../../store/authStore';
import { getAppName, APP_CONFIG } from '../../config/constants';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { language } = useUIStore();
  const { currentPharmacy } = usePharmacyStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Page titles based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return t('dashboard.title');
    if (path === '/products') return t('products.title');
    if (path === '/orders') return t('orders.title');
    if (path === '/statement') return t('statement.title');
    if (path === '/profile') return t('profile.title');
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPharmacy={currentPharmacy}
      />

      {/* Main Content Area */}
      <div className={`lg:pl-64 flex flex-col flex-1`}>
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          pageTitle={getPageTitle()}
        />

        {/* Page Content */}
        <main className="flex-1">
          {/* Page Header with Breadcrumb (Optional) */}
          {currentPharmacy && location.pathname !== '/' && (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <div className="max-w-7xl mx-auto">
                <nav className="text-sm">
                  <ol className="flex items-center space-x-2 rtl:space-x-reverse">
                    <li>
                      <a 
                        href="/" 
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        {t('dashboard.title')}
                      </a>
                    </li>
                    <li className="text-gray-500 dark:text-gray-400">/</li>
                    <li className="text-gray-900 dark:text-white font-medium">
                      {getPageTitle()}
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </main>

        {/* Footer (Optional) */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} {getAppName(language)}. v{APP_CONFIG.version} 
              {' '}{language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;