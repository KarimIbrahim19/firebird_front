// /src/components/common/Sidebar.jsx
import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore, { useUIStore, usePharmacyStore } from '../../store/authStore';
import { getAppName } from '../../config/constants';

const Sidebar = ({ isOpen, onClose, currentPharmacy }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useUIStore();
  const { logout, pharmaciesCount } = useAuthStore();
  const sidebarRef = useRef(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const prevLanguage = useRef(language);

  // Close sidebar immediately when language changes
  useEffect(() => {
    if (prevLanguage.current && prevLanguage.current !== language) {
      if (isOpen) {
        // Force close without animation
        onClose();
      }
    }
    prevLanguage.current = language;
  }, [language, isOpen, onClose]);

  // Close sidebar on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const focusableElements = sidebarRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusableElements[0]?.focus();
    }
  }, [isOpen]);

  const menuItems = [
    { 
      path: '/', 
      icon: '🏠', 
      label: t('dashboard.title'),
      color: 'text-blue-600 dark:text-blue-400'
    },
    { 
      path: '/products', 
      icon: '📦', 
      label: t('products.title'),
      color: 'text-green-600 dark:text-green-400'
    },
    { 
      path: '/orders', 
      icon: '📋', 
      label: t('orders.title'),
      color: 'text-purple-600 dark:text-purple-400'
    },
    { 
      path: '/statement', 
      icon: '📊', 
      label: t('pharmacy.statement'),
      color: 'text-orange-600 dark:text-orange-400'
    },
    { 
      path: '/profile', 
      icon: '👤', 
      label: t('profile.title'),
      color: 'text-gray-600 dark:text-gray-400'
    },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    onClose();
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform lg:hidden ${
          isOpen ? 'translate-x-0 transition-transform duration-300 ease-in-out' : `${language === 'ar' ? 'translate-x-full' : '-translate-x-full'} transition-none`
        }`}
        style={{ display: isOpen ? 'block' : 'none' }}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 ml-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  {getAppName(language)}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'بوابة الصيدليات' : 'Pharmacy Portal'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center px-3 py-2.5 my-1 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className={`text-xl mr-3 ml-3 ${isActive(item.path) ? '' : item.color}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive(item.path) && (
                  <div className="ms-auto w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* Pharmacy Info */}
          {currentPharmacy && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t('pharmacy.currentPharmacy')}
                </p>
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {currentPharmacy.name}
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">{t('pharmacy.balance')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currentPharmacy.balance?.toLocaleString()} {t('common.currency')}
                    </span>
                  </div>
                  {currentPharmacy.creditLimit && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">{t('pharmacy.creditLimit')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {currentPharmacy.creditLimit.toLocaleString()} {t('common.currency')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Switch Pharmacy Button */}
                {pharmaciesCount > 1 && (
                  <button
                    onClick={() => {
                      const { switchPharmacy } = usePharmacyStore.getState();
                      switchPharmacy();
                      onClose();
                    }}
                    className="w-full mt-3 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-1.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    {t('pharmacy.switchPharmacy')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Settings and Logout Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <Link
              to="/settings"
              onClick={onClose}
              className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 me-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{t('profile.settings')}</span>
            </Link>

            <button
              onClick={handleLogoutClick}
              className="flex items-center w-full px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-5 h-5 me-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center me-4">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'تأكيد تسجيل الخروج' : 'Confirm Logout'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {language === 'ar' ? 'هل أنت متأكد من رغبتك في تسجيل الخروج؟' : 'Are you sure you want to logout?'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                >
                  {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:block`}>
        <div
          className={`h-full bg-white dark:bg-gray-800 flex flex-col border-e border-gray-200 dark:border-gray-700`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 ml-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {getAppName(language)}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'خدمة الصيدليات' : 'Pharmacy Portal'}
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 my-1 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className={`text-xl mr-3 ml-3 ${isActive(item.path) ? '' : item.color}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive(item.path) && (
                  <div className="ms-auto w-1.5 h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* Pharmacy Info */}
          {currentPharmacy && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t('pharmacy.currentPharmacy')}
                </p>
                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {currentPharmacy.name}
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">{t('pharmacy.balance')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currentPharmacy.balance?.toLocaleString()} {t('common.currency')}
                    </span>
                  </div>
                  {currentPharmacy.creditLimit && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">{t('pharmacy.creditLimit')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {currentPharmacy.creditLimit.toLocaleString()} {t('common.currency')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Switch Pharmacy Button */}
                {pharmaciesCount > 1 && (
                  <button
                    onClick={() => {
                      const { switchPharmacy } = usePharmacyStore.getState();
                      switchPharmacy();
                    }}
                    className="w-full mt-3 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-1.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    {t('pharmacy.switchPharmacy')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Settings and Logout Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <Link
              to="/settings"
              className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 me-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{t('profile.settings')}</span>
            </Link>

            <button
              onClick={handleLogoutClick}
              className="flex items-center w-full px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-5 h-5 me-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;