// /src/components/pharmacy/PharmacySelector.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usePharmacyStore } from '../../store/authStore';
import { pharmacyAPI } from '../../api/client';

const PharmacySelector = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setCurrentPharmacy, setAvailablePharmacies, selectPharmacy } = usePharmacyStore();
  const [selectedId, setSelectedId] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['available-pharmacies'],
    queryFn: async () => {
      const response = await pharmacyAPI.getAvailable();
      return response.data;
    },
  });

  useEffect(() => {
    if (data?.data) {
      setAvailablePharmacies(data.data);

      // Don't auto-select if only one pharmacy when user is switching
      // (they intentionally clicked to switch, so show them the option)
      // Only auto-select on first login when currentPharmacy doesn't exist
    }
  }, [data]);

  const handleSelectPharmacy = async (pharmacyId) => {
    setIsSelecting(true);
    try {
      const result = await selectPharmacy(pharmacyId);
      
      if (result.success) {
        toast.success(t('pharmacy.pharmacySelected'));
        navigate('/');
      } else {
        toast.error(result.error || t('common.error'));
      }
    } catch (error) {
      console.error('Error selecting pharmacy:', error);
      toast.error(t('common.error'));
    } finally {
      setIsSelecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-lg mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('common.error')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error?.message || t('errors.somethingWrong')}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 btn btn-primary"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pharmacies = data.data || [];

  if (pharmacies.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('pharmacy.noPharmacies')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('pharmacy.contactAdmin')}
            </p>
            <div className="space-y-3">
              <a
                href="tel:+201234567890"
                className="btn btn-primary w-full"
              >
                📞 {t('common.call')} 
              </a>
              <a
                href="mailto:support@pharmacy.com"
                className="btn btn-secondary w-full"
              >
                ✉️ {t('common.email')}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('pharmacy.selectPharmacy')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('pharmacy.selectPharmacyDescription')}
          </p>
        </div>

        <div className="grid gap-4">
          {pharmacies.map((pharmacy) => (
            <div
              key={pharmacy.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer transition-all transform hover:scale-[1.02] ${
                selectedId === pharmacy.id ? 'ring-2 ring-indigo-500' : ''
              }`}
              onClick={() => setSelectedId(pharmacy.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {pharmacy.name}
                  </h3>
                  {pharmacy.address && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      📍 {pharmacy.address}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {pharmacy.balance !== undefined && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          {t('pharmacy.balance')}:
                        </span>
                        <span className="ml-1 mr-1 font-medium text-gray-900 dark:text-white">
                          {pharmacy.balance.toLocaleString()} {t('common.currency')}
                        </span>
                      </div>
                    )}
                    {pharmacy.creditLimit !== undefined && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          {t('pharmacy.creditLimit')}:
                        </span>
                        <span className="ml-1 mr-1 font-medium text-gray-900 dark:text-white">
                          {pharmacy.creditLimit.toLocaleString()} {t('common.currency')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 mr-4">
                  <input
                    type="radio"
                    name="pharmacy"
                    checked={selectedId === pharmacy.id}
                    onChange={() => setSelectedId(pharmacy.id)}
                    className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => handleSelectPharmacy(selectedId)}
            disabled={!selectedId || isSelecting}
            className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSelecting ? (
              <span className="flex items-center justify-center">
                <span className="spinner-sm mr-2 ml-2"></span>
                {t('common.loading')}
              </span>
            ) : (
              t('common.select')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PharmacySelector;