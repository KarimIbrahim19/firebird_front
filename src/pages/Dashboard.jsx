// /src/pages/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import useAuthStore, { usePharmacyStore } from '../store/authStore';
import { orderAPI } from '../api/client';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { currentPharmacy } = usePharmacyStore();

  const { data: statistics, isLoading } = useQuery({
    queryKey: ['order-statistics'],
    queryFn: async () => {
      const response = await orderAPI.getStatistics();
      return response.data.data;
    },
    enabled: !!currentPharmacy,
  });

  const quickActions = [
    {
      title: t('dashboard.viewProducts'),
      icon: '📦',
      path: '/products',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      title: t('dashboard.viewOrders'),
      icon: '📋',
      path: '/orders',
      color: 'bg-green-500',
      lightColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      title: t('dashboard.viewStatement'),
      icon: '📊',
      path: '/statement',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      title: t('profile.title'),
      icon: '👤',
      path: '/profile',
      color: 'bg-gray-500',
      lightColor: 'bg-gray-100 dark:bg-gray-900',
    },
  ];

  const statsCards = [
    {
      title: t('dashboard.totalInvoices'),
      value: statistics?.totalInvoices || 0,
      icon: '📄',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    },
    {
      title: t('dashboard.totalReturns'),
      value: statistics?.totalReturns || 0,
      icon: '↩️',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/50',
    },
    {
      title: t('pharmacy.balance'),
      value: currentPharmacy?.balance ? `${currentPharmacy.balance.toLocaleString()} ${t('common.currency')}` : '0',
      icon: '💰',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/50',
    },
    {
      title: t('pharmacy.creditLimit'),
      value: currentPharmacy?.creditLimit ? `${currentPharmacy.creditLimit.toLocaleString()} ${t('common.currency')}` : '0',
      icon: '💳',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/50',
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('common.welcome')}, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('dashboard.welcomeMessage', { date: new Date().toLocaleDateString() })}
        </p>
      </div>

      {/* Current Pharmacy Card */}
      {currentPharmacy && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <p className="text-indigo-100 text-sm mb-1">{t('pharmacy.currentPharmacy')}</p>
              <h2 className="text-xl md:text-2xl font-bold mb-2">{currentPharmacy.name}</h2>
              {currentPharmacy.address && (
                <p className="text-indigo-100 text-sm">📍 {currentPharmacy.address}</p>
              )}
            </div>
            <Link
              to="/statement"
              className="mt-4 md:mt-0 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors"
            >
              {t('pharmacy.statement')} →
            </Link>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {isLoading ? (
                    <span className="inline-block h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('dashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-lg transition-all transform hover:scale-105"
            >
              <div className={`w-14 h-14 rounded-lg ${action.lightColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl">{action.icon}</span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {action.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity Feed / Recent Orders (placeholder) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t('dashboard.recentActivity')}
        </h2>
        <div className="space-y-4">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 ml-3"></div>
            <p className="text-sm">
              {t('dashboard.noRecentActivity')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;