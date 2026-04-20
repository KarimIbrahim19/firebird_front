// src/pages/Customers.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../store/authStore';
import { customerAPI } from '../api/client';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPhones(phones) {
  if (!phones) return [];
  return [phones.tel010, phones.tel011, phones.tel012].filter(Boolean);
}

function isPhoneQuery(q) {
  return /^[\d\s\-+]+$/.test(q.trim());
}

function callPhone(number) {
  const clean = number.replace(/[^\d+]/g, '');
  window.location.href = `tel:${clean}`;
}

// ─── Phone Chip ───────────────────────────────────────────────────────────────

const PhoneChip = ({ number, language }) => (
  <div className="flex items-center gap-1.5 group">
    <span
      className="text-sm text-gray-700 dark:text-gray-300 font-mono tracking-wide"
      dir="ltr"
    >
      {number}
    </span>
    <button
      onClick={(e) => { e.stopPropagation(); callPhone(number); }}
      title={language === 'ar' ? 'اتصال' : 'Call'}
      className="
        flex items-center justify-center w-7 h-7 rounded-full
        bg-green-100 dark:bg-green-900/40
        text-green-600 dark:text-green-400
        hover:bg-green-500 hover:text-white
        dark:hover:bg-green-500 dark:hover:text-white
        transition-all duration-150
        shadow-sm hover:shadow-md
        opacity-80 group-hover:opacity-100 hover:scale-110
      "
      aria-label={`Call ${number}`}
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.01 21 3 13.99 3 5c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
      </svg>
    </button>
  </div>
);

// ─── Customer Card ────────────────────────────────────────────────────────────

const CustomerCard = ({ customer, language, index, t }) => {
  const phones = formatPhones(customer.phones);

  return (
    <div
      className="
        bg-white dark:bg-gray-800
        border border-gray-100 dark:border-gray-700
        rounded-xl p-5 shadow-sm
        hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700
        transition-all duration-200
        animate-card-in
      "
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start gap-4">

        {/* Avatar */}
        <div className="
          flex-shrink-0 w-11 h-11 rounded-full
          bg-gradient-to-br from-primary-500 to-primary-700
          flex items-center justify-center
          text-white font-bold text-base shadow-sm
        ">
          {(customer.name || '?').charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">

          {/* Name row + badge */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug truncate">
              {customer.name}
            </h3>

            {/* ── Suspended / Available badge ── */}
            {customer.suspended ? (
              <span className="inline-flex items-center gap-1 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400" />
                {t('clients.suspended')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400" />
                {t('clients.available')}
              </span>
            )}
          </div>

          {/* Address */}
          {customer.address && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{customer.address}</span>
            </p>
          )}

          {/* Phones */}
          {phones.length > 0 ? (
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {phones.map((num, i) => (
                <PhoneChip key={i} number={num} language={language} />
              ))}
            </div>
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
              {language === 'ar' ? 'لا يوجد رقم هاتف' : 'No phone number'}
            </span>
          )}

        </div>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ query, language }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
      <svg
        className="w-10 h-10 text-gray-300 dark:text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
    <p className="text-gray-500 dark:text-gray-400 font-medium">
      {language === 'ar' ? `لا توجد نتائج لـ "${query}"` : `No results for "${query}"`}
    </p>
    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
      {language === 'ar' ? 'جرب بحثاً مختلفاً' : 'Try a different search'}
    </p>
  </div>
);

// ─── Idle State ───────────────────────────────────────────────────────────────

const IdleState = ({ language }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-24 h-24 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-5">
      <svg
        className="w-12 h-12 text-primary-300 dark:text-primary-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
      {language === 'ar' ? 'بحث عن عميل' : 'Search for a client'}
    </p>
  </div>
);

// ─── useScrollDirection hook ──────────────────────────────────────────────────

function useScrollDirection(threshold = 8) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking     = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      window.requestAnimationFrame(() => {
        const current = window.scrollY;
        const diff    = current - lastScrollY.current;

        // Always show when near the top
        if (current < 60) {
          setVisible(true);
        } else if (diff > threshold) {
          // Scrolling down far enough → hide
          setVisible(false);
        } else if (diff < -threshold) {
          // Scrolling up far enough → show
          setVisible(true);
        }

        lastScrollY.current = current;
        ticking.current     = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return visible;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const CustomersPage = () => {
  const { t } = useTranslation();
  const { language } = useUIStore();

  const [inputValue, setInputValue]   = useState('');
  const [query, setQuery]             = useState('');
  const [results, setResults]         = useState([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState(null);
  const [meta, setMeta]               = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceRef  = useRef(null);
  const inputRef     = useRef(null);
  const searchBarRef = useRef(null);

  // Scroll-direction visibility
  const searchBarVisible = useScrollDirection(8);

  // Focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);

    const trimmed = inputValue.trim();

    if (trimmed.length < 3) {
      if (trimmed.length === 0) {
        setResults([]);
        setMeta(null);
        setHasSearched(false);
        setError(null);
        setQuery('');
      }
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setQuery(trimmed);
      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const res = await customerAPI.search(trimmed);
        setResults(res.data.data || []);
        setMeta(res.data.meta || null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [inputValue]);

  const handleClear = () => {
    setInputValue('');
    setResults([]);
    setMeta(null);
    setHasSearched(false);
    setError(null);
    setQuery('');
    inputRef.current?.focus();
  };

  const searchMode = query
    ? (isPhoneQuery(query) ? 'phone' : 'name')
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* ── Sticky Search Header ── */}
      <div
        ref={searchBarRef}
        className={`
          sticky top-16 z-20
          bg-white dark:bg-gray-800
          border-b border-gray-200 dark:border-gray-700
          shadow-sm
          transition-transform duration-300 ease-in-out
          ${searchBarVisible ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        <div className="max-w-3xl mx-auto px-4 py-4">

          {/* Search input */}
          <div className="relative">

            {/* Icon / spinner */}
            <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
              {isLoading ? (
                <svg className="w-5 h-5 text-primary-500 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3V0a12 12 0 100 24v-4l-3 3 3 3v4A12 12 0 014 12z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'اسم الصيدلية أو رقم الهاتف...'
                  : 'Pharmacy name or phone number...'
              }
              className="
                block w-full ps-11 pe-11 py-3 rounded-xl
                bg-gray-50 dark:bg-gray-700
                border border-gray-200 dark:border-gray-600
                text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                text-base transition-shadow
              "
              autoComplete="off"
              spellCheck="false"
            />

            {/* Clear button */}
            {inputValue && (
              <button
                onClick={handleClear}
                className="
                  absolute inset-y-0 end-0 pe-3.5
                  flex items-center
                  text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                  transition-colors
                "
                aria-label="Clear"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Meta row */}
          <div className="mt-2 flex items-center justify-between">

            <div className="flex items-center gap-2">
              {searchMode && !isLoading && (
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    searchMode === 'phone' ? 'bg-green-500' : 'bg-primary-500'
                  }`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {searchMode === 'phone'
                      ? (language === 'ar' ? 'بحث برقم الهاتف' : 'Phone search')
                      : (language === 'ar' ? 'بحث بالاسم'      : 'Name search')}
                  </span>
                </div>
              )}
              {inputValue.trim().length > 0 && inputValue.trim().length < 3 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {language === 'ar' ? 'اكتب ٣ أحرف على الأقل' : 'Type at least 3 characters'}
                </p>
              )}
            </div>

            {meta && !isLoading && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {meta.count} {language === 'ar' ? 'نتيجة' : 'results'}
                </span>
                {meta.cached && (
                  <span className="px-1.5 py-0.5 text-xs rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-medium">
                    {language === 'ar' ? 'مؤقت' : 'cached'}
                  </span>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Results area ── */}
      <div className="max-w-3xl mx-auto px-4 py-5">

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                {language === 'ar' ? 'حدث خطأ' : 'An error occurred'}
              </p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Idle */}
        {!hasSearched && !error && <IdleState language={language} />}

        {/* Empty */}
        {hasSearched && !isLoading && !error && results.length === 0 && (
          <EmptyState query={query} language={language} />
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((customer, i) => (
              <CustomerCard
                key={`${customer.name}-${i}`}
                customer={customer}
                language={language}
                index={i}
                t={t}
              />
            ))}

            {meta && meta.count === 50 && (
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 pt-2">
                {language === 'ar'
                  ? 'يعرض أول 50 نتيجة — خصص البحث للحصول على نتائج أدق'
                  : 'Showing first 50 results — narrow your search for more precision'}
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomersPage;