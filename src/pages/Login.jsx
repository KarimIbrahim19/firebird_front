// src/pages/Login.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import useAuthStore, { useUIStore } from '../store/authStore';
import { getAppName } from '../config/constants';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useUIStore();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm({
    defaultValues: { username: '', password: '', rememberMe: false },
  });

  useEffect(() => { setFocus('username'); }, [setFocus]);

  const onSubmit = async (data) => {
    const result = await login({
      email: data.username.trim(),
      password: data.password,
      rememberMe: data.rememberMe,
    });

    if (result.success) {
      toast.success(t('auth.loginSuccess'));
      navigate('/', { replace: true });
    } else {
      toast.error(
        result.error ||
          (t('auth.invalidCredentials'))
      );
    }
  };

  /* ── Shared input class ─────────────────────────────────────────────────
     Always uses explicit dark colors so text is always readable regardless
     of the app theme toggle. The login page has its own dark background.   */
  const inputCls = `
    block w-full py-2.5 rounded-xl text-sm transition-all
    bg-slate-800 border border-slate-600
    text-slate-100 placeholder-slate-500
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
  `;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl px-8 py-10">

          {/* Logo & title */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-indigo-600 items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{getAppName(language)}</h1>
            <p className="text-indigo-400 text-sm mt-1">
              {t('auth.title')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            {/* ── Username ── */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {t('auth.title')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  {...register('username', {
                    required: language === 'ar' ? 'اسم المستخدم مطلوب' : 'Username is required',
                    minLength: { value: 2, message: language === 'ar' ? 'اسم المستخدم قصير جداً' : 'Username is too short' },
                  })}
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  placeholder={t('auth.email')}
                  className={`${inputCls} ps-10 pe-4`}
                />
              </div>
              {errors.username && <p className="mt-1.5 text-xs text-red-400">{errors.username.message}</p>}
            </div>

            {/* ── Password ── */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  {...register('password', {
                    required: language === 'ar' ? 'كلمة المرور مطلوبة' : 'Password is required',
                    minLength: { value: 4, message: language === 'ar' ? 'كلمة المرور يجب أن تكون أكثر من 3 أحرف' : 'Password must be more than 3 characters' },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`${inputCls} ps-10 pe-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 end-0 pe-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {/* ── Remember me ── */}
            <div className="flex items-center">
              <input
                {...register('rememberMe')}
                id="rememberMe"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ms-2 text-sm text-slate-400 cursor-pointer select-none">
                {t('auth.rememberMe')}
              </label>
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full py-2.5 rounded-xl font-semibold text-sm
                bg-indigo-600 hover:bg-indigo-500 text-white
                shadow-lg shadow-indigo-500/25
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-indigo-400
              "
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3v4A12 12 0 014 12z" />
                  </svg>
                  {language === 'ar' ? 'جاري الدخول...' : 'Signing in...'}
                </span>
              ) : (t('auth.title'))}
            </button>
          </form>
        </div>

        {/* Language toggle */}
        <div className="mt-5 text-center">
          <button
            onClick={() => useUIStore.getState().toggleLanguage()}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            {language === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;