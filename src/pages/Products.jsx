// /src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { productAPI } from '../api/client';
import { useUIStore } from '../store/authStore';

const ProductsPage = () => {
  const { t } = useTranslation();
  const { language } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await productAPI.getCategories(6);
      return response.data.data;
    },
  });

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', page, debouncedSearch, selectedCategory],
    queryFn: async () => {
      const params = {
        page: page.toString(),
        limit: '10',
        store: '6',
      };
      
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory) params.category = selectedCategory;
      
      const response = await productAPI.getProducts(params);
      return response.data;
    },
  });

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1); // Reset to first page
  };

  const ProductCard = ({ product }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200 dark:bg-gray-700">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-48 w-full object-cover object-center"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE3Ny45MDkgMTUwIDE2MCAxNjcuOTA5IDE2MCAxOTBDMTYwIDIxMi4wOTEgMTc3LjkwOSAyMzAgMjAwIDIzMEMyMjIuMDkxIDIzMCAyNDAgMjEyLjA5MSAyNDAgMTkwQzI0MCAxNjcuOTA5IDIyMi4wOTEgMTUwIDIwMCAxNTBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==';
            }}
          />
        ) : (
          <div className="h-48 flex items-center justify-center">
            <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
          {language === 'ar' ? product.name : product.nameEn || product.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {product.manufacturer}
        </p>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {product.price} <span className="text-sm font-normal">{t('common.currency')}</span>
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-xs text-gray-500 line-through">
                {product.originalPrice} {t('common.currency')}
              </p>
            )}
          </div>
          {product.discount > 0 && (
            <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900 rounded-full">
              -{product.discount}%
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            {t('products.stock')}: {product.stock || 0}
          </span>
          {product.barcode && (
            <span className="text-gray-400 dark:text-gray-500">
              {product.barcode}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('products.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {productsData?.meta?.total || 0} {t('products.productsFound')}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('products.searchPlaceholder')}
                className="input pl-10 pr-10"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="select"
          >
            <option value="">{t('products.allCategories')}</option>
            {categoriesData?.map((category) => (
              <option key={category.id} value={category.id}>
                {language === 'ar' ? category.name : category.nameEn || category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <div className="skeleton h-48 mb-4"></div>
              <div className="skeleton h-4 mb-2"></div>
              <div className="skeleton h-4 w-2/3"></div>
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
      ) : productsData?.data?.length > 0 ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {productsData.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {productsData?.meta?.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                {t('common.previous')}
              </button>
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                {page} / {productsData.meta.totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(productsData.meta.totalPages, page + 1))}
                disabled={page >= productsData.meta.totalPages}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            {t('products.noProducts')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;