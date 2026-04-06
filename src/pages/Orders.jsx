// /src/pages/Orders.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { orderAPI } from '../api/client';
import { useUIStore } from '../store/authStore';

const OrdersPage = () => {
  const { t } = useTranslation();
  const { language } = useUIStore();
  const [page, setPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Default date range: 1 month
  const defaultStartDate = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
  const defaultEndDate = new Date().toISOString().split('T')[0];

  // Applied filters (used in API query)
  const [appliedFilters, setAppliedFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });

  // Temporary filters (user input before pressing filter button)
  const [tempFilters, setTempFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });

  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['orders', page, appliedFilters],
    queryFn: async () => {
      const params = {
        page: page.toString(),
        limit: '10',
      };
      if (appliedFilters.status) params.status = appliedFilters.status;
      if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
      if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;

      const response = await orderAPI.getOrders(params);
      return response.data;
    },
  });

  const handleApplyFilter = () => {
    setAppliedFilters(tempFilters);
    setPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        icon: '⏳',
      },
      CONFIRMED: {
        color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        icon: '✓',
      },
      SHIPPED: {
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        icon: '🚚',
      },
      DELIVERED: {
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
        icon: '📦',
      },
      CANCELLED: {
        color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        icon: '❌',
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1 ml-1">{config.icon}</span>
        {t(`orders.${status?.toLowerCase() || 'pending'}`)}
      </span>
    );
  };

  const OrderCard = ({ order }) => {
    const isExpanded = expandedOrder === order.invoiceId;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div
          className="p-4 cursor-pointer"
          onClick={() => setExpandedOrder(isExpanded ? null : order.invoiceId)}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('orders.invoiceNumber')} #{order.invoiceId}
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(order.date)}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span>{order.items?.length || 0} {t('orders.items')}</span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {order.totalAmount?.toLocaleString()} {t('common.currency')}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-3">
              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t('orders.orderItems')}
                </h4>
                <div className="space-y-2">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white">
                          {language === 'ar' ? item.productName : item.productNameEn || item.productName}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {t('products.quantity')}: {item.quantity} × {item.price} {t('common.currency')}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.total?.toLocaleString()} {t('common.currency')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                {order.totalPure && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('orders.totalBeforeDiscount')}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {order.totalPure.toLocaleString()} {t('common.currency')}
                    </span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('orders.discountAmount')}
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      -{order.discount.toLocaleString()} {t('common.currency')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold pt-2">
                  <span className="text-gray-900 dark:text-white">
                    {t('orders.totalAmount')}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {order.totalAmount?.toLocaleString()} {t('common.currency')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('orders.myOrders')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {ordersData?.meta?.total || 0} {t('orders.ordersFound')}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">{t('orders.fromDate')}</label>
            <input
              type="date"
              value={tempFilters.startDate}
              onChange={(e) => setTempFilters({ ...tempFilters, startDate: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">{t('orders.toDate')}</label>
            <input
              type="date"
              value={tempFilters.endDate}
              onChange={(e) => setTempFilters({ ...tempFilters, endDate: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">{t('orders.status')}</label>
            <select
              value={tempFilters.status}
              onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
              className="input"
            >
              <option value="">{t('orders.allStatus')}</option>
              <option value="PENDING">{t('orders.pending')}</option>
              <option value="CONFIRMED">{t('orders.confirmed')}</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApplyFilter}
              className="btn btn-primary w-full"
            >
              {t('common.filter')}
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="skeleton h-6 w-32 mb-2"></div>
              <div className="skeleton h-4 w-48 mb-3"></div>
              <div className="skeleton h-4 w-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            {t('common.error')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 btn btn-primary"
          >
            {t('common.retry')}
          </button>
        </div>
      ) : ordersData?.data?.length > 0 ? (
        <>
          <div className="space-y-4">
            {ordersData.data.map((order) => (
              <OrderCard key={order.invoiceId} order={order} />
            ))}
          </div>

          {/* Pagination */}
          {ordersData?.meta?.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                {t('common.previous')}
              </button>
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                {page} / {ordersData.meta.totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(ordersData.meta.totalPages, page + 1))}
                disabled={page >= ordersData.meta.totalPages}
                className="btn btn-secondary disabled:opacity-50"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            {t('orders.noOrders')}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;