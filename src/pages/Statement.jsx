// /src/pages/Statement.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { pharmacyAPI } from '../api/client';
import { useUIStore } from '../store/authStore';

const StatementPage = () => {
  const { t } = useTranslation();
  const { language } = useUIStore();

  // Default date range: 1 month
  const defaultStartDate = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
  const defaultEndDate = new Date().toISOString().split('T')[0];

  // Applied filters (used in API query)
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    type: 'all',
  });

  // Temporary filters (user input before pressing filter button)
  const [tempFilters, setTempFilters] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    type: 'all',
  });

  const [page, setPage] = useState(1);

  const { data: statementData, isLoading, error } = useQuery({
    queryKey: ['statement', appliedFilters, page],
    queryFn: async () => {
      const params = {
        startDate: appliedFilters.startDate,
        endDate: appliedFilters.endDate,
        page: page.toString(),
        limit: '10',
      };

      // Only add type parameter if not 'all'
      if (appliedFilters.type !== 'all') {
        params.type = appliedFilters.type;
      }

      const response = await pharmacyAPI.getStatement(params);
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

  const formatCurrency = (amount) => {
    const absAmount = Math.abs(amount);
    const formatted = absAmount.toLocaleString();
    return amount < 0 ? `-${formatted}` : formatted;
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'INVOICE':
        return '📄';
      case 'PAYMENT':
        return '💰';
      case 'RETURN':
        return '↩️';
      default:
        return '📝';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'INVOICE':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50';
      case 'PAYMENT':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50';
      case 'RETURN':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/50';
    }
  };

  const TransactionRow = ({ transaction }) => {
    const [expanded, setExpanded] = useState(false);
    const hasDetails = transaction.details && transaction.details.length > 0;

    return (
      <>
        <tr 
          className={`border-b border-gray-200 dark:border-gray-700 ${hasDetails ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}`}
          onClick={() => hasDetails && setExpanded(!expanded)}
        >
          <td className="px-4 py-3">
            <div className="flex items-center">
              <span className={`p-2 rounded-lg mr-3 ml-3 ${getTransactionColor(transaction.type)}`}>
                {getTransactionIcon(transaction.type)}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t(`orders.${transaction.type?.toLowerCase() || 'transaction'}`)} #{transaction.id}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(transaction.date)}
                </p>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-right">
            {transaction.type === 'PAYMENT' ? (
              <span className="text-green-600 dark:text-green-400 font-medium">
                {formatCurrency(transaction.amount)} {t('common.currency')}
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400 font-medium">
                {formatCurrency(transaction.amount)} {t('common.currency')}
              </span>
            )}
          </td>
          <td className="px-4 py-3 text-right">
            <span className="text-gray-900 dark:text-white font-medium">
              {formatCurrency(transaction.runningBalance)} {t('common.currency')}
            </span>
          </td>
        </tr>
        {expanded && hasDetails && (
          <tr>
            <td colSpan="3" className="px-4 py-3 bg-gray-50 dark:bg-gray-800">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('orders.orderItems')}:
                </p>
                {transaction.details.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm pl-8 pr-8">
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {item.total.toLocaleString()} {t('common.currency')}
                      {item.discount > 0 && (
                        <span className="text-green-600 dark:text-green-400 ml-2">
                          (-{item.discount}%)
                        </span>
                      )}
                    </span>
                  </div>
                ))}
                {transaction.discountAmount > 0 && (
                  <div className="flex justify-between text-sm pl-8 pr-8 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('orders.totalBeforeDiscount')}:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {transaction.amountBeforeDiscount?.toLocaleString()} {t('common.currency')}
                    </span>
                  </div>
                )}
              </div>
            </td>
          </tr>
        )}
      </>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('statement.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('statement.dateRange')}: {formatDate(appliedFilters.startDate)} - {formatDate(appliedFilters.endDate)}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">{t('statement.fromDate')}</label>
            <input
              type="date"
              value={tempFilters.startDate}
              onChange={(e) => setTempFilters({ ...tempFilters, startDate: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">{t('statement.toDate')}</label>
            <input
              type="date"
              value={tempFilters.endDate}
              onChange={(e) => setTempFilters({ ...tempFilters, endDate: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">{t('statement.transactionType')}</label>
            <select
              value={tempFilters.type}
              onChange={(e) => setTempFilters({ ...tempFilters, type: e.target.value })}
              className="input"
            >
              <option value="all">{t('statement.allTransactions')}</option>
              <option value="invoice">{t('statement.invoiceOnly')}</option>
              <option value="payment">{t('statement.paymentOnly')}</option>
              <option value="return">{t('statement.returnOnly')}</option>
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

      {/* Summary Cards */}
      {statementData?.data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t('statement.startingBalance')}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {statementData.data.startingBalance?.toLocaleString()} {t('common.currency')}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t('statement.totalTransactions')}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {statementData.meta?.total || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t('statement.runningBalance')}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {statementData.data.transactions?.[0]?.runningBalance?.toLocaleString() || 0} {t('common.currency')}
            </p>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="spinner-lg mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">{t('common.error')}</p>
            <button onClick={() => window.location.reload()} className="mt-4 btn btn-primary">
              {t('common.retry')}
            </button>
          </div>
        ) : statementData?.data?.transactions?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('statement.transaction')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('statement.amount')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('statement.balance')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {statementData.data.transactions.map((transaction) => (
                    <TransactionRow key={`${transaction.type}-${transaction.id}`} transaction={transaction} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {statementData?.meta?.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    {t('common.previous')}
                  </button>
                  <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                    {page} / {statementData.meta.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(statementData.meta.totalPages, page + 1))}
                    disabled={page >= statementData.meta.totalPages}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">{t('statement.noTransactions')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatementPage;