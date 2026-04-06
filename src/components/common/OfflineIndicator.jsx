// /src/components/common/OfflineIndicator.jsx
import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store/authStore';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(!navigator.onLine);
  const { language } = useUIStore();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Show "Back Online" message briefly
      setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 transition-all duration-300 ${
      showIndicator ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
        isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-gray-900 dark:bg-gray-800 text-white'
      }`}>
        <div className={`w-3 h-3 rounded-full ${
          isOnline ? 'bg-white' : 'bg-red-500'
        } animate-pulse`} />
        <span className="text-sm font-medium">
          {isOnline 
            ? (language === 'ar' ? 'تم استعادة الاتصال' : 'Back Online')
            : (language === 'ar' ? 'أنت غير متصل بالإنترنت' : 'You are offline')
          }
        </span>
        <button
          onClick={() => setShowIndicator(false)}
          className="ml-auto mr-0 p-1 hover:bg-white/20 rounded"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default OfflineIndicator;