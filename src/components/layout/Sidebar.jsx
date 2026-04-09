// src/components/layout/Sidebar.jsx
import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore, { useUIStore } from '../../store/authStore';
import { getAppName } from '../../config/constants';
 
const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useUIStore();
  const { logout, user } = useAuthStore();
  const sidebarRef = useRef(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const prevLanguage = useRef(language);
 
  // Close on language change
  useEffect(() => {
    if (prevLanguage.current !== language && isOpen) onClose();
    prevLanguage.current = language;
  }, [language, isOpen, onClose]);
 
  // Close on Escape
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);
 
  // Lock body scroll on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'unset'; };
    }
  }, [isOpen]);
 
  // Focus trap
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const el = sidebarRef.current.querySelectorAll('button, [href]');
      el[0]?.focus();
    }
  }, [isOpen]);
 
  // ── Nav items ────────────────────────────────────────────────────────────
  const menuItems = [
    {
      path: '/',
      label: language === 'ar' ? 'بحث العملاء' : 'Customers',
      color: 'text-indigo-600 dark:text-indigo-400',
      activeBg: 'bg-indigo-50 dark:bg-indigo-900/50',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      path: '/dashboard',
      label: t('dashboard.title'),
      color: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-50 dark:bg-blue-900/50',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      path: '/products',
      label: t('products.title'),
      color: 'text-green-600 dark:text-green-400',
      activeBg: 'bg-green-50 dark:bg-green-900/50',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      path: '/orders',
      label: t('orders.title'),
      color: 'text-purple-600 dark:text-purple-400',
      activeBg: 'bg-purple-50 dark:bg-purple-900/50',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      path: '/statement',
      label: t('pharmacy.statement'),
      color: 'text-orange-600 dark:text-orange-400',
      activeBg: 'bg-orange-50 dark:bg-orange-900/50',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      path: '/profile',
      label: t('profile.title'),
      color: 'text-gray-600 dark:text-gray-400',
      activeBg: 'bg-gray-100 dark:bg-gray-700/60',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];
 
  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/' || location.pathname === '/customers'
      : location.pathname === path;
 
  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    onClose?.();
    navigate('/login');
  };
 
  // ── Shared pieces ────────────────────────────────────────────────────────
  const SidebarHeader = ({ showClose }) => (
    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center me-3 flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
            {getAppName(language)}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {language === 'ar' ? 'بوابة الموظفين' : 'Employee Portal'}
          </p>
        </div>
      </div>
      {showClose && (
        <button
          onClick={onClose}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
 
  const NavList = ({ onItemClick }) => (
    <nav className="flex-1 px-2 py-4 overflow-y-auto">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onItemClick}
          className={`flex items-center px-3 py-2.5 my-0.5 rounded-lg transition-all duration-150 ${
            isActive(item.path)
              ? `${item.activeBg} ${item.color} font-medium`
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span className={`me-3 flex-shrink-0 ${item.color}`}>{item.icon}</span>
          <span className="text-sm">{item.label}</span>
          {isActive(item.path) && (
            <div className="ms-auto w-1.5 h-1.5 rounded-full bg-current opacity-60" />
          )}
        </Link>
      ))}
    </nav>
  );
 
  // ── Employee info block (bottom of nav, above logout) ────────────────────
  const EmployeeBlock = () =>
    user ? (
      <div className="px-4 pb-2">
        <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {(user.userName || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user.userName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ar' ? `كود الموظف: ${user.empId}` : `Emp ID: ${user.empId}`}
            </p>
          </div>
        </div>
      </div>
    ) : null;
 
  const BottomActions = ({ onItemClick }) => (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={handleLogoutClick}
        className="flex items-center w-full px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <svg className="w-5 h-5 me-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="text-sm">{t('common.logout')}</span>
      </button>
    </div>
  );
 
  const LogoutModal = () => (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {language === 'ar' ? 'تأكيد تسجيل الخروج' : 'Confirm Logout'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowLogoutConfirm(false)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={confirmLogout}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-medium text-sm"
          >
            {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
 
  // ── Shared inner content ─────────────────────────────────────────────────
  const SidebarContent = ({ showClose, onItemClick }) => (
    <div className="h-full flex flex-col">
      <SidebarHeader showClose={showClose} />
      <NavList onItemClick={onItemClick} />
      <EmployeeBlock />
      <BottomActions onItemClick={onItemClick} />
    </div>
  );
 
  return (
    <>
      {/* ── Mobile sidebar ── */}
      <div
        ref={sidebarRef}
        className={`
          fixed inset-y-0 start-0 z-50 w-64
          bg-white dark:bg-gray-800 shadow-xl
          transform lg:hidden
          ${isOpen
            ? 'translate-x-0 transition-transform duration-300 ease-in-out'
            : `${language === 'ar' ? 'translate-x-full' : '-translate-x-full'} transition-none`}
        `}
        style={{ display: isOpen ? 'block' : 'none' }}
      >
        <SidebarContent showClose={true} onItemClick={onClose} />
      </div>
 
      {/* ── Logout modal ── */}
      {showLogoutConfirm && <LogoutModal />}
 
      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:start-0 lg:z-40 lg:w-64 lg:block">
        <div className="h-full bg-white dark:bg-gray-800 flex flex-col border-e border-gray-200 dark:border-gray-700">
          <SidebarContent showClose={false} onItemClick={() => {}} />
        </div>
      </div>
    </>
  );
};
 
export default Sidebar;