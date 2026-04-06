// /src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import useAuthStore, { useUIStore } from '../store/authStore';
import { getAppName } from '../config/constants';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useUIStore();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setFocus
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    }
  });
  
  // Watch password for confirmation validation
  const password = watch('password');
  
  // Focus first field on mount
  React.useEffect(() => {
    setFocus('fullName');
  }, [setFocus]);
  
  const onSubmit = async (data) => {
    try {
      const result = await registerUser({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        theme: 'light',
        lang: language
      });
      
      if (result.success) {
        toast.success(t('auth.registerSuccess'));
        navigate('/login');
      } else {
        toast.error(result.error || t('common.error'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(t('errors.somethingWrong'));
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
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
            {t('auth.createAccount')}
          </p>
        </div>
        
        {/* Registration Form */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg px-8 py-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="label">
                {t('auth.fullName')}
              </label>
              <input
                {...register('fullName', {
                  required: t('auth.nameRequired'),
                  minLength: {
                    value: 3,
                    message: t('errors.minLength', { min: 3 })
                  }
                })}
                type="text"
                autoComplete="name"
                className="input"
                placeholder={language === 'ar' ? 'أحمد محمد' : 'Ahmed Mohamed'}
              />
              {errors.fullName && (
                <p className="error-text">{errors.fullName.message}</p>
              )}
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                {t('auth.email')}
              </label>
              <input
                {...register('email', {
                  required: t('auth.emailRequired'),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t('auth.invalidEmail')
                  }
                })}
                type="email"
                autoComplete="email"
                className="input"
                placeholder="example@pharmacy.com"
                dir="ltr"
              />
              {errors.email && (
                <p className="error-text">{errors.email.message}</p>
              )}
            </div>
            
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="label">
                {t('auth.phone')}
              </label>
              <div className="relative">
                <input
                  {...register('phone', {
                    required: t('auth.phoneRequired'),
                    pattern: {
                      value: /^(\+20|0020|20)?1[0125]\d{8}$/,
                      message: t('auth.invalidPhone')
                    }
                  })}
                  type="tel"
                  autoComplete="tel"
                  className="input"
                  placeholder="+201234567890"
                  dir="ltr"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">🇪🇬</span>
                </div>
              </div>
              {errors.phone && (
                <p className="error-text">{errors.phone.message}</p>
              )}
            </div>
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="label">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: t('auth.passwordRequired'),
                    minLength: {
                      value: 6,
                      message: t('auth.passwordTooShort')
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="error-text">{errors.password.message}</p>
              )}
            </div>
            
            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="label">
                {t('profile.confirmPassword')}
              </label>
              <input
                {...register('confirmPassword', {
                  required: t('auth.passwordRequired'),
                  validate: value => value === password || t('auth.passwordMismatch')
                })}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="input"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="error-text">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                {...register('acceptTerms', {
                  required: language === 'ar' 
                    ? 'يجب الموافقة على الشروط والأحكام'
                    : 'You must accept the terms and conditions'
                })}
                type="checkbox"
                className="checkbox mt-1"
              />
              <label htmlFor="acceptTerms" className="ml-2 mr-2 text-sm text-gray-700 dark:text-gray-300">
                {language === 'ar' 
                  ? 'أوافق على الشروط والأحكام وسياسة الخصوصية'
                  : 'I agree to the terms and conditions and privacy policy'
                }
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="error-text">{errors.acceptTerms.message}</p>
            )}
            
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
                t('common.register')
              )}
            </button>
          </form>
          
          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.hasAccount')}{' '}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                {t('common.login')}
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
    </div>
  );
};

export default RegisterPage;