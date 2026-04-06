// /src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import useAuthStore, { useUIStore } from '../store/authStore';
import webAuthnService from '../services/webauthn';
import { getAppName } from '../config/constants';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, theme } = useUIStore();
  const { login, loginWithBiometric, isLoading } = useAuthStore();
  
  const [showBiometric, setShowBiometric] = useState(false);
  const [biometricEmail, setBiometricEmail] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  
  const from = location.state?.from?.pathname || '/';
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });
  
  // Check if biometric authentication is available
  useEffect(() => {
    const checkBiometric = async () => {
      const available = await webAuthnService.isPlatformAuthenticatorAvailable();
      setIsBiometricAvailable(available);
    };
    checkBiometric();
  }, []);
  
  // Focus email field on mount
  useEffect(() => {
    setFocus('email');
  }, [setFocus]);
  
  // Handle traditional login
  const onSubmit = async (data) => {
    try {
      const result = await login(data);

      if (result.success) {
        toast.success(t('auth.loginSuccess'));

        // Navigate based on pharmacies count for better UX
        // pharmaciesCount = 0: No pharmacies → Dashboard will show message
        // pharmaciesCount = 1: Single pharmacy → Backend auto-selected, navigate directly
        // pharmaciesCount > 1: Multiple pharmacies → PharmacySelector will show if needed
        if (result.pharmaciesCount === 0) {
          // No pharmacies available - show dashboard with message
          navigate('/', { replace: true });
        } else if (result.pharmaciesCount === 1 || result.autoSelectedPharmacy) {
          // Single pharmacy or auto-selected - navigate to intended page
          navigate(from, { replace: true });
        } else {
          // Multiple pharmacies - let ProtectedRoute handle pharmacy selection
          navigate('/', { replace: true });
        }
      } else {
        toast.error(result.error || t('auth.invalidCredentials'));
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('errors.somethingWrong'));
    }
  };
  
  // Handle biometric login
  const handleBiometricLogin = async () => {
    if (!biometricEmail) {
      toast.error(t('auth.emailRequired'));
      return;
    }

    try {
      const result = await webAuthnService.login(biometricEmail, true);

      if (result.success) {
        const loginResult = await loginWithBiometric(biometricEmail, result.data, true);
        toast.success(t('auth.loginSuccess'));

        // Navigate based on pharmacies count for better UX
        if (loginResult.pharmaciesCount === 0) {
          navigate('/', { replace: true });
        } else if (loginResult.pharmaciesCount === 1 || loginResult.autoSelectedPharmacy) {
          navigate(from, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      toast.error(error.message || t('auth.biometricLoginFailed'));
      setShowBiometric(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="mx-auto h-24 w-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg mb-4">
            <svg className="h-14 w-14 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {getAppName(language)}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('auth.title')}
          </p>
        </div>
        
        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg px-8 py-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="label">
                {t('auth.email')}
              </label>
              <input
                {...register('email', {
                  required: t('auth.emailRequired'),
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: t('auth.invalidEmail')
                  }
                })}
                type="email"
                autoComplete="email"
                className="input"
                placeholder={language === 'ar' ? 'example@pharmacy.com' : 'example@pharmacy.com'}
                dir="ltr"
              />
              {errors.email && (
                <p className="error-text">{errors.email.message}</p>
              )}
            </div>
            
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="label">
                {t('auth.password')}
              </label>
              <input
                {...register('password', {
                  required: t('auth.passwordRequired'),
                  minLength: {
                    value: 6,
                    message: t('auth.passwordTooShort')
                  }
                })}
                type="password"
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="error-text">{errors.password.message}</p>
              )}
            </div>
            
            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="checkbox"
                />
                <label htmlFor="rememberMe" className="ml-2 mr-2 text-sm text-gray-700 dark:text-gray-300">
                  {t('auth.rememberMe')}
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="spinner-sm mr-2 ml-2"></span>
                  {t('common.loading')}
                </span>
              ) : (
                t('common.login')
              )}
            </button>
            
            {/* Biometric Login Button */}
            {isBiometricAvailable && (
              <button
                type="button"
                onClick={() => setShowBiometric(true)}
                className="btn btn-outline w-full"
              >
                <svg className="h-5 w-5 mr-2 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                {t('auth.loginWithBiometric')}
              </button>
            )}
          </form>
          
          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.noAccount')}{' '}
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                {t('common.register')}
              </Link>
            </p>
          </div>
        </div>
        
        {/* Language Switcher */}
        <div className="mt-6 text-center">
          <button
            onClick={() => useUIStore.getState().toggleLanguage()}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </div>
      
      {/* Biometric Login Modal */}
      {showBiometric && (
        <div className="modal">
          <div className="overlay" onClick={() => setShowBiometric(false)} />
          <div className="modal-content max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('auth.loginWithBiometric')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {language === 'ar' 
                ? 'أدخل بريدك الإلكتروني لتسجيل الدخول بالبصمة'
                : 'Enter your email to login with biometric'
              }
            </p>
            <input
              type="email"
              value={biometricEmail}
              onChange={(e) => setBiometricEmail(e.target.value)}
              className="input mb-4"
              placeholder={t('auth.email')}
              dir="ltr"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowBiometric(false)}
                className="btn btn-secondary flex-1"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleBiometricLogin}
                className="btn btn-primary flex-1"
              >
                {t('common.login')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;