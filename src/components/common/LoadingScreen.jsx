// /src/components/common/LoadingScreen.jsx
import React from 'react';
import { useUIStore } from '../../store/authStore';

const LoadingScreen = () => {
  const { language } = useUIStore();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 dark:border-indigo-400 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;