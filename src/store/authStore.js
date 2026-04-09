// src/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authAPI } from '../api/client';

// ─── Auth Store ───────────────────────────────────────────────────────────────
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      accessToken: null,
      refreshToken: null,
      user: null,           // { userId, userName, empId, securityLevel }
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Setters ──────────────────────────────────────────────────────────
      setAuth: (data) => {
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || null,
          user: data.user,
          isAuthenticated: true,
          error: null,
        });
      },

      setAccessToken: (token) => set({ accessToken: token }),

      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      // ── Login ────────────────────────────────────────────────────────────
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          // Response shape: { data: { accessToken, refreshToken, expiresIn, user }, statusCode, timestamp }
          const { data } = response.data;
          get().setAuth(data);
          return { success: true };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Login failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Logout ───────────────────────────────────────────────────────────
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (_) {
          // ignore — always clear local state
        } finally {
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            error: null,
          });
          // Clear pharmacy store too (kept for other pages that still use it)
          usePharmacyStore.getState().clearPharmacy();
        }
      },

      // ── Token refresh ────────────────────────────────────────────────────
      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) return null;
        try {
          const response = await authAPI.refresh(refreshToken);
          const { accessToken } = response.data.data;
          set({ accessToken });
          return accessToken;
        } catch (_) {
          get().logout();
          return null;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ─── Pharmacy Store (kept intact for statement/orders pages) ──────────────────
export const usePharmacyStore = create(
  persist(
    (set, get) => ({
      currentPharmacy: null,
      availablePharmacies: [],
      isLoading: false,
      error: null,

      setCurrentPharmacy: (pharmacy) =>
        set({ currentPharmacy: pharmacy, error: null }),

      setAvailablePharmacies: (pharmacies) =>
        set({ availablePharmacies: pharmacies }),

      fetchAvailablePharmacies: async () => {
        set({ isLoading: true, error: null });
        try {
          const { pharmacyAPI } = await import('../api/client');
          const response = await pharmacyAPI.getAvailable();
          const pharmacies = response.data.data || [];
          set({ availablePharmacies: pharmacies, isLoading: false });
          return pharmacies;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to fetch pharmacies',
            isLoading: false,
          });
          return [];
        }
      },

      selectPharmacy: async (pharmacyId) => {
        set({ isLoading: true, error: null });
        try {
          const { pharmacyAPI } = await import('../api/client');
          await pharmacyAPI.select(pharmacyId);
          const response = await pharmacyAPI.getCurrent();
          const pharmacy = response.data.data;
          set({ currentPharmacy: pharmacy, isLoading: false });
          return { success: true, pharmacy };
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Failed to select pharmacy',
            isLoading: false,
          });
          return { success: false, error: error.message };
        }
      },

      fetchCurrentPharmacy: async () => {
        set({ isLoading: true });
        try {
          const { pharmacyAPI } = await import('../api/client');
          const response = await pharmacyAPI.getCurrent();
          const pharmacy = response.data.data;
          if (pharmacy) set({ currentPharmacy: pharmacy, isLoading: false });
          else set({ isLoading: false });
          return pharmacy;
        } catch (_) {
          set({ isLoading: false });
          return null;
        }
      },

      clearPharmacy: () =>
        set({ currentPharmacy: null, availablePharmacies: [], error: null }),

      switchPharmacy: () => set({ currentPharmacy: null }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'pharmacy-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ currentPharmacy: state.currentPharmacy }),
    }
  )
);

// ─── UI Store ─────────────────────────────────────────────────────────────────
export const useUIStore = create(
  persist(
    (set, get) => ({
      theme: import.meta.env.VITE_DEFAULT_THEME || 'light',
      language: import.meta.env.VITE_DEFAULT_LANGUAGE || 'ar',
      sidebarOpen: false,
      isOnline: navigator.onLine,

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute(
            'content',
            theme === 'dark' ? '#1f2937' : '#ffffff'
          );
        }
      },

      setLanguage: (language) => {
        set({ language });
        document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', language);
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      toggleLanguage: () => {
        const newLang = get().language === 'ar' ? 'en' : 'ar';
        get().setLanguage(newLang);
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setOnline: (online) => set({ isOnline: online }),

      initializeUI: () => {
        const state = get();
        document.documentElement.setAttribute('data-theme', state.theme);
        document.documentElement.setAttribute(
          'dir',
          state.language === 'ar' ? 'rtl' : 'ltr'
        );
        document.documentElement.setAttribute('lang', state.language);
        window.addEventListener('online', () => get().setOnline(true));
        window.addEventListener('offline', () => get().setOnline(false));
      },

      resetToDefaults: () => {
        set({
          theme: import.meta.env.VITE_DEFAULT_THEME || 'light',
          language: import.meta.env.VITE_DEFAULT_LANGUAGE || 'ar',
          sidebarOpen: false,
        });
        get().initializeUI();
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme, language: state.language }),
    }
  )
);

export default useAuthStore;
