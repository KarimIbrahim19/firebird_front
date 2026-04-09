// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAuthStore, { useUIStore } from '../../store/authStore';
 
const Header = ({ onMenuClick, pageTitle }) => {
  const { t } = useTranslation();
  const { theme, language, toggleTheme, toggleLanguage } = useUIStore();
  const { user } = useAuthStore();
  const [notificationOpen, setNotificationOpen] = useState(false);
 
  // No notifications yet — placeholder
  const notifications = [];
  const unreadCount = 0;
 
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="h-16 px-4 flex items-center justify-between">
 
        {/* Left: hamburger + page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
 
          <h2 className="hidden lg:block text-xl font-semibold text-gray-900 dark:text-white">
            {pageTitle}
          </h2>
        </div>
 
        {/* Right: employee chip, notifications, theme, language */}
        <div className="flex items-center gap-2">
 
          {/* Employee name badge */}
          {user?.userName && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user.userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300 max-w-[120px] truncate">
                {user.userName}
              </span>
            </div>
          )}
 
          {/* Notifications bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen((o) => !o)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
 
            {notificationOpen && (
              <div className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700`}>
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t('notifications.title')}
                  </h3>
                </div>
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('notifications.noNotifications')}
                  </p>
                </div>
              </div>
            )}
          </div>
 
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
 
          {/* Language toggle */}
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