// /src/components/common/Header.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore, usePharmacyStore } from '../../store/authStore';

const Header = ({ onMenuClick, pageTitle }) => {
  const { t } = useTranslation();
  const { theme, language, toggleTheme, toggleLanguage } = useUIStore();
  const { currentPharmacy } = usePharmacyStore();
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Mock notifications (in real app, fetch from API)
  const notifications = [
    // { id: 1, text: 'طلب جديد #1234', time: '5 دقائق', read: false },
    // { id: 2, text: 'تم تأكيد الطلب #1233', time: 'ساعة واحدة', read: true },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="h-16 px-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page Title (Desktop) */}
          <h2 className="hidden lg:block text-xl font-semibold text-gray-900 dark:text-white">
            {pageTitle}
          </h2>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* Current Pharmacy Name */}
          {currentPharmacy && (
            <div className="hidden md:flex items-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg">
              <svg className="w-4 h-4 mr-2 ml-2 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                {currentPharmacy.name}
              </span>
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationOpen && (
              <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700`}>
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t('notifications.title')}
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <p className="text-sm text-gray-900 dark:text-white">
                          {notification.text}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('notifications.noNotifications')}
                      </p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                      {t('notifications.markAllAsRead')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {language === 'ar' ? 'EN' : 'ع'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;