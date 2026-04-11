// src/pages/Products.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { productAPI, storeAPI } from '../api/client';
import { useUIStore } from '../store/authStore';

const DEFAULT_STORE_ID = 1;

// ─── Product Detail Modal ──────────────────────────────────────────────────
const ProductDetailModal = ({ slug, language, t, onClose }) => {
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Click outside to close
  const handleOverlayClick = useCallback((e) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product-detail', slug],
    queryFn: async () => {
      const res = await productAPI.getProductBySlug(slug);
      return res.data?.data?.data ?? res.data?.data ?? null;
    },
    retry: false,
  });

  const product = data;
  const name = product
    ? (language === 'ar' ? product.name : product.nameEn || product.name)
    : '';

  // Total stock across all stores
  const totalStock = product?.stores?.reduce((sum, s) => sum + (s.stock || 0), 0) ?? 0;

  // Helper to display stock number consistently
  const formatStock = (value) => {
    if (value === 0) return '0';
    return value.toLocaleString();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        className="
          relative w-full max-w-lg bg-white dark:bg-gray-800
          rounded-2xl shadow-2xl overflow-hidden
          animate-modal-in
        "
        style={{ maxHeight: '90vh' }}
      >
        {/* ── Close button ── */}
        <button
          onClick={onClose}
          className="
            absolute top-3 end-3 z-10
            w-8 h-8 rounded-full flex items-center justify-center
            bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm
            text-gray-600 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-600
            shadow transition-colors
          "
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <svg className="w-8 h-8 text-indigo-500 animate-spin mb-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3v4A12 12 0 014 12z"/>
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <svg className="w-10 h-10 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-sm text-red-600 dark:text-red-400">
              {language === 'ar' ? 'تعذر تحميل تفاصيل المنتج' : 'Could not load product details'}
            </p>
          </div>
        )}

        {/* ── Content ── */}
        {!isLoading && !error && product && (
          <div className="overflow-y-auto" style={{ maxHeight: '90vh' }}>
            <div className="p-5 space-y-4">
              {/* Name (full width) */}
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-snug pr-8">
                {name}
              </h2>

              {/* Price on its own line to avoid overlapping close button */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {language === 'ar' ? 'سعر الجمهور' : 'Public Price'}
                </span>
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {product.originalPrice != null
                    ? `${product.originalPrice.toLocaleString()} ${t('common.currency')}`
                    : '—'}
                </span>
              </div>

              {/* Meta row: category, manufacturer, barcode */}
              <div className="flex flex-wrap gap-2">
                {product.category && (
                  <span className="px-2.5 py-1 text-xs rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium">
                    {language === 'ar' ? product.category.name : product.category.nameEn || product.category.name}
                  </span>
                )}
                {product.manufacturer && (
                  <span className="px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {product.manufacturer}
                  </span>
                )}
                {/* Barcode always shown */}
                <span className="px-2.5 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-mono" dir="ltr">
                  {product.barcode || '—'}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Total stock with colour coding */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'ar' ? 'إجمالي المخزون' : 'Total stock'}:
                </span>
                <span className={`text-lg font-bold ${
                  totalStock > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-500 dark:text-red-400'
                }`}>
                  {formatStock(totalStock)}
                </span>
              </div>

              {/* Stock per store */}
              {product.stores && product.stores.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'ar' ? 'المتاح فى كل مخزن:' : 'Stock Availability:'}
                  </h3>
                  <div className="space-y-1.5">
                    {product.stores.map((store) => (
                      <div
                        key={store.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {language === 'ar' ? store.name : store.nameEn || store.name}
                        </span>
                        <span className={`text-sm font-semibold ${
                          store.stock > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-500 dark:text-red-400'
                        }`}>
                          {formatStock(store.stock)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Product Card ──────────────────────────────────────────────────────────
const ProductCard = ({ product, language, t, onSelect }) => {
  const name = language === 'ar' ? product.name : product.nameEn || product.name;
  const stock = product.stock ?? 0;

  return (
    <button
      onClick={() => onSelect(product.slug)}
      className="
        text-start w-full
        bg-white dark:bg-gray-800
        rounded-xl shadow-sm border border-gray-100 dark:border-gray-700
        hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700
        transition-all duration-200 overflow-hidden
        flex flex-col
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
      "
    >
      {/* Card body – no image */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-1 flex-1">
          {name}
        </h3>

        {/* Manufacturer and Category side by side */}
        {(product.manufacturer || product.category) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {product.manufacturer && (
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full">
                {product.manufacturer}
              </span>
            )}
            {product.manufacturer && product.category && (
              <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
            )}
            {product.category && (
              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 truncate max-w-full">
                {language === 'ar' ? product.category.name : product.category.nameEn || product.category.name}
              </span>
            )}
          </div>
        )}

        <div className="border-t border-gray-100 dark:border-gray-700 pt-2 mt-auto space-y-1.5">
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'سعر الجمهور' : 'Public Price'}
            </span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {product.originalPrice != null
                ? `${product.originalPrice.toLocaleString()} ${t('common.currency')}`
                : '—'}
            </span>
          </div>

          {/* Stock with colour */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('products.stock')}
            </span>
            <span className={`text-sm font-semibold ${
              stock > 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-500 dark:text-red-400'
            }`}>
              {stock.toLocaleString()}
            </span>
          </div>

          {/* Barcode – always displayed */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {t('products.barcode')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono" dir="ltr">
              {product.barcode || '—'}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

// ─── Skeleton card ─────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
    <div className="p-3 space-y-2">
      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2 animate-pulse mt-3" />
    </div>
  </div>
);

// ─── Main page ─────────────────────────────────────────────────────────────
const ProductsPage = () => {
  const { t } = useTranslation();
  const { language } = useUIStore();

  const [searchTerm, setSearchTerm]             = useState('');
  const [debouncedSearch, setDebouncedSearch]   = useState('');
  const [selectedStore, setSelectedStore]       = useState(DEFAULT_STORE_ID);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage]                         = useState(1);
  const [detailSlug, setDetailSlug]             = useState(null);

  // Debounce search with min length 3
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchTerm.trim();
      if (trimmed.length === 0 || trimmed.length >= 3) {
        setDebouncedSearch(trimmed);
        setPage(1);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Stores
  const { data: storesData } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const res = await storeAPI.getStores();
      return res.data.data || [];
    },
    staleTime: Infinity,
  });

  // Categories (scoped to store)
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', selectedStore],
    queryFn: async () => {
      const res = await productAPI.getCategories(selectedStore);
      return res.data.data || [];
    },
  });

  const handleStoreChange = (storeId) => {
    setSelectedStore(Number(storeId));
    setSelectedCategory('');
    setPage(1);
  };

  // Products
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', page, debouncedSearch, selectedStore, selectedCategory],
    queryFn: async () => {
      const params = {
        page: page.toString(),
        limit: '20',
        store: String(selectedStore),
      };
      if (debouncedSearch)  params.search   = debouncedSearch;
      if (selectedCategory) params.category = selectedCategory;
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

  return (
    <>
      {/* ── Modal keyframe ── */}
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        .animate-modal-in { animation: modal-in 0.18s ease-out both; }
      `}</style>

      {/* ── Detail modal ── */}
      {detailSlug && (
        <ProductDetailModal
          slug={detailSlug}
          language={language}
          t={t}
          onClose={() => setDetailSlug(null)}
        />
      )}

      <div className="p-4 md:p-6 max-w-7xl mx-auto">

        {/* Filter bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search — spans 2 cols on lg */}
            <div className="lg:col-span-2">
              <div className="relative">
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
                  className="input ps-9 pe-9 h-12"
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
              {/* Min chars hint */}
              {searchTerm.trim().length > 0 && searchTerm.trim().length < 3 && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  {language === 'ar' ? 'اكتب ٣ أحرف على الأقل' : 'Type at least 3 characters'}
                </p>
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
                className="select ps-9 pe-9 h-12 appearance-none"
              >
                {storesData?.map((store) => (
                  <option key={store.id} value={store.id}>
                    {language === 'ar' ? store.name : store.nameEn || store.name}
                  </option>
                ))}
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
                className="select ps-9 pe-9 h-12 appearance-none"
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

          {/* Single row: active filters on left, meta info on right */}
          <div className="mt-3 flex items-center justify-between text-xs">
            {/* Left side: active filter pills */}
            <div className="flex flex-wrap gap-2">
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
            
            {/* Right side: total count and store name */}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-400">
                {productsData?.meta?.total != null
                  ? `${productsData.meta.total.toLocaleString()} ${t('products.productsFound')}`
                  : ''}
              </span>
              {currentStoreName() && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    {currentStoreName()}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product grid */}
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
                <ProductCard
                  key={product.id}
                  product={product}
                  language={language}
                  t={t}
                  onSelect={setDetailSlug}
                />
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
    </>
  );
};

export default ProductsPage;