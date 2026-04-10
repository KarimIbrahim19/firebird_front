// src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { productAPI, storeAPI } from '../api/client';
import { useUIStore } from '../store/authStore';
 
const DEFAULT_STORE_ID = 1;
 
const ProductsPage = () => {
  const { t } = useTranslation();
  const { language } = useUIStore();
 
  const [searchTerm, setSearchTerm]         = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStore, setSelectedStore]   = useState(DEFAULT_STORE_ID);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
 
  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);
 
  // ── Stores ──────────────────────────────────────────────────────────────
  const { data: storesData } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const res = await storeAPI.getStores();
      return res.data.data || [];
    },
    staleTime: Infinity, // stores don't change during a session
  });
 
  // ── Categories (scoped to selected store) ───────────────────────────────
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', selectedStore],
    queryFn: async () => {
      const res = await productAPI.getCategories(selectedStore);
      return res.data.data || [];
    },
  });
 
  // Reset category when store changes
  const handleStoreChange = (storeId) => {
    setSelectedStore(Number(storeId));
    setSelectedCategory('');
    setPage(1);
  };
 
  // ── Products ─────────────────────────────────────────────────────────────
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', page, debouncedSearch, selectedStore, selectedCategory],
    queryFn: async () => {
      const params = {
        page: page.toString(),
        limit: '20',
        store: String(selectedStore),
      };
      if (debouncedSearch)   params.search   = debouncedSearch;
      if (selectedCategory)  params.category = selectedCategory;
      const res = await productAPI.getProducts(params);
      return res.data;
    },
  });
 
  const currentStoreName = () => {
    if (!storesData) return '';
    const s = storesData.find((s) => s.id === selectedStore);
    if (!s) return '';
    return language === 'ar' ? s.name : s.nameEn || s.name;
  };
 
  // ── Product Card ─────────────────────────────────────────────────────────
  const ProductCard = ({ product }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative bg-gray-50 dark:bg-gray-700 h-40 flex-shrink-0 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={language === 'ar' ? product.name : product.nameEn || product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className={`absolute inset-0 flex items-center justify-center ${product.image ? 'hidden' : 'flex'}`}
        >
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
 
        {/* Out of stock badge */}
        {product.stock === 0 && (
          <div className="absolute top-2 end-2">
            <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md">
              {language === 'ar' ? 'نفذ' : 'Out of stock'}
            </span>
          </div>
        )}
      </div>
 
      {/* Body */}
      <div className="p-3 flex flex-col flex-1">
        {/* Name */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-1 flex-1">
          {language === 'ar' ? product.name : product.nameEn || product.name}
        </h3>
 
        {/* Manufacturer */}
        {product.manufacturer && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
            {product.manufacturer}
          </p>
        )}
 
        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-2 mt-auto space-y-1.5">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'السعر' : 'Price'}
            </span>
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
              {product.originalPrice != null
                ? `${product.originalPrice.toLocaleString()} ${t('common.currency')}`
                : '—'}
            </span>
          </div>
 
          {/* Stock */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('products.stock')}
            </span>
            <span className={`text-xs font-medium ${
              product.stock > 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-500 dark:text-red-400'
            }`}>
              {product.stock > 0 ? product.stock.toLocaleString() : (language === 'ar' ? 'نفذ' : 'Out of stock')}
            </span>
          </div>
 
          {/* Barcode */}
          {product.barcode && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {t('products.barcode')}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono" dir="ltr">
                {product.barcode}
              </span>
            </div>
          )}
 
          {/* Category chip */}
          {product.category && (
            <span className="inline-block mt-0.5 px-2 py-0.5 text-xs rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-full">
              {language === 'ar' ? product.category.name : product.category.nameEn || product.category.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
 
  // ── Skeleton Cards ────────────────────────────────────────────────────────
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="h-40 bg-gray-100 dark:bg-gray-700 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2 animate-pulse mt-3" />
      </div>
    </div>
  );
 
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
 
      {/* ── Page header ── */}
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('products.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {productsData?.meta?.total != null
              ? `${productsData.meta.total.toLocaleString()} ${t('products.productsFound')}`
              : ''}
            {currentStoreName() && (
              <span className="ms-2 text-indigo-600 dark:text-indigo-400 font-medium">
                · {currentStoreName()}
              </span>
            )}
          </p>
        </div>
      </div>
 
      {/* ── Filter bar ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
 
          {/* Search — spans 2 cols on lg */}
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('products.searchPlaceholder')}
              className="input ps-9 pe-9"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 end-0 pe-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
 
          {/* Store filter */}
          <div className="relative">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <select
              value={selectedStore}
              onChange={(e) => handleStoreChange(e.target.value)}
              className="select ps-9"
            >
              {storesData?.map((store) => (
                <option key={store.id} value={store.id}>
                  {language === 'ar' ? store.name : store.nameEn || store.name}
                </option>
              ))}
              {/* Fallback while loading */}
              {!storesData && (
                <option value={DEFAULT_STORE_ID}>
                  {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </option>
              )}
            </select>
          </div>
 
          {/* Category filter */}
          <div className="relative">
            <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="select ps-9"
            >
              <option value="">{t('products.allCategories')}</option>
              {categoriesData?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {language === 'ar' ? cat.name : cat.nameEn || cat.name}
                </option>
              ))}
            </select>
          </div>
 
        </div>
 
        {/* Active filter pills */}
        {(debouncedSearch || selectedCategory) && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {debouncedSearch}
                <button onClick={() => setSearchTerm('')} className="hover:text-red-500 transition-colors ms-0.5">×</button>
              </span>
            )}
            {selectedCategory && categoriesData && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
                {(() => {
                  const cat = categoriesData.find((c) => String(c.id) === String(selectedCategory));
                  return cat ? (language === 'ar' ? cat.name : cat.nameEn || cat.name) : selectedCategory;
                })()}
                <button onClick={() => setSelectedCategory('')} className="hover:text-red-500 transition-colors ms-0.5">×</button>
              </span>
            )}
          </div>
        )}
      </div>
 
      {/* ── Product grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('common.error')}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            {t('common.retry')}
          </button>
        </div>
      ) : productsData?.data?.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {productsData.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
 
          {/* Pagination */}
          {productsData.meta?.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                {t('common.previous')}
              </button>
              <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                {page} / {productsData.meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(productsData.meta.totalPages, p + 1))}
                disabled={page >= productsData.meta.totalPages}
                className="btn btn-secondary disabled:opacity-50"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">{t('products.noProducts')}</p>
          {(debouncedSearch || selectedCategory) && (
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
              className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {language === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
 
export default ProductsPage;