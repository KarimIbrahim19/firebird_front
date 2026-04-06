// /src/pages/Profile.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import useAuthStore, { useUIStore } from '../store/authStore';
import { userAPI, authAPI } from '../api/client';
import webAuthnService from '../services/webauthn';
import { APP_CONFIG, getAppName, getAppDescription } from '../config/constants';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const { theme, language, setTheme, setLanguage } = useUIStore();
  const [activeTab, setActiveTab] = useState('personal');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Forms
  const profileForm = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Fetch biometric devices
  const { data: biometricDevices, refetch: refetchDevices } = useQuery({
    queryKey: ['biometric-devices'],
    queryFn: async () => {
      const devices = await webAuthnService.listDevices();
      return devices.map(device => webAuthnService.formatDeviceInfo(device));
    },
    enabled: activeTab === 'security',
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await userAPI.updateProfile(data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser(data.data);
      toast.success(t('profile.profileUpdated'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('common.error'));
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await userAPI.changePassword(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('profile.passwordChanged'));
      setShowPasswordModal(false);
      passwordForm.reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t('common.error'));
    },
  });

  // Register biometric
  const handleRegisterBiometric = async () => {
    try {
      const result = await webAuthnService.register();
      if (result.success) {
        toast.success(t('auth.biometricRegistered'));
        refetchDevices();
      }
    } catch (error) {
      toast.error(error.message || t('common.error'));
    }
  };

  // Remove biometric device
  const handleRemoveDevice = async (credentialId) => {
    try {
      const result = await webAuthnService.deleteDevice(credentialId);
      if (result.success) {
        toast.success(t('auth.biometricRemoved'));
        refetchDevices();
      }
    } catch (error) {
      toast.error(error.message || t('common.error'));
    }
  };

  // Handle profile update
  const onSubmitProfile = (data) => {
    updateProfileMutation.mutate(data);
  };

  // Handle password change
  const onSubmitPassword = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const tabs = [
    { id: 'personal', label: t('profile.personalInfo'), icon: '👤' },
    { id: 'preferences', label: t('profile.preferences'), icon: '⚙️' },
    { id: 'security', label: t('profile.security'), icon: '🔒' },
    { id: 'about', label: t('profile.about'), icon: 'ℹ️' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('profile.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('profile.manageYourAccount')}
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <img
            className="w-20 h-20 rounded-full"
            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
            alt={user?.name}
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {t('auth.lastLogin')}: {new Date(user?.lastLogin || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 rtl:space-x-reverse px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2 ml-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
              <div>
                <label className="label">{t('auth.fullName')}</label>
                <input
                  {...profileForm.register('name', { required: true })}
                  type="text"
                  className="input"
                />
              </div>
              <div>
                <label className="label">{t('auth.email')}</label>
                <input
                  {...profileForm.register('email')}
                  type="email"
                  className="input"
                  disabled
                />
              </div>
              <div>
                <label className="label">{t('auth.phone')}</label>
                <input
                  {...profileForm.register('phone', {
                    pattern: /^(\+20|0020|20)?1[0125]\d{8}$/,
                  })}
                  type="tel"
                  className="input"
                  dir="ltr"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="btn btn-primary"
                >
                  {updateProfileMutation.isPending ? t('common.loading') : t('common.save')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="btn btn-secondary"
                >
                  {t('profile.changePassword')}
                </button>
              </div>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('profile.theme')}
                </h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                      theme === 'light'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    ☀️ {t('profile.light')}
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                      theme === 'dark'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    🌙 {t('profile.dark')}
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('profile.language')}
                </h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setLanguage('ar')}
                    className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                      language === 'ar'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {t('profile.arabic')}
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                      language === 'en'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {t('profile.english')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('profile.biometricAuth')}
                </h3>

                {biometricDevices && biometricDevices.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {biometricDevices.map((device) => (
                      <div
                        key={device.credentialId}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {device.displayName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('profile.addedOn')}: {device.formattedCreated}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('profile.lastUsed')}: {device.formattedLastUsed}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveDevice(device.credentialId)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t('profile.noBiometricDevices')}
                  </p>
                )}

                <button
                  onClick={handleRegisterBiometric}
                  className="btn btn-primary"
                >
                  {t('auth.registerBiometric')}
                </button>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('profile.appInfo')}
                </h3>

                <div className="space-y-4">
                  {/* App Name */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">{t('profile.appName')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{getAppName(language)}</span>
                  </div>

                  {/* Version */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">{t('profile.version')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">v{APP_CONFIG.version}</span>
                  </div>

                  {/* Description */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('profile.description')}</p>
                    <p className="text-gray-900 dark:text-white">{getAppDescription(language)}</p>
                  </div>

                  {/* Build Date */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">{t('profile.buildDate')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{new Date().getFullYear()}</span>
                  </div>

                  {/* License */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">{t('profile.license')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">MIT</span>
                  </div>
                </div>

                {/* Copyright */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    © {new Date().getFullYear()} {getAppName(language)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal">
          <div className="overlay" onClick={() => setShowPasswordModal(false)} />
          <div className="modal-content max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('profile.changePassword')}
            </h3>
            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
              <div>
                <label className="label">{t('profile.currentPassword')}</label>
                <input
                  {...passwordForm.register('currentPassword', { required: true })}
                  type="password"
                  className="input"
                />
              </div>
              <div>
                <label className="label">{t('profile.newPassword')}</label>
                <input
                  {...passwordForm.register('newPassword', {
                    required: true,
                    minLength: 6,
                  })}
                  type="password"
                  className="input"
                />
              </div>
              <div>
                <label className="label">{t('profile.confirmPassword')}</label>
                <input
                  {...passwordForm.register('confirmPassword', { required: true })}
                  type="password"
                  className="input"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="btn btn-primary flex-1"
                >
                  {changePasswordMutation.isPending ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;