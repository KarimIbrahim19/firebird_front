// src/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authAPI } from '../api/client';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      accessToken: null,
      refreshToken: null,
      user: null,
      pharmaciesCount: 0, // Number of pharmacies available to user
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setAuth: (data) => {
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || null, // Handle null refreshToken when rememberMe = false
          user: data.user,
          pharmaciesCount: data.pharmaciesCount || 0, // Store pharmacy count
          isAuthenticated: true,
          error: null,
        });
      },

      setAccessToken: (token) => {
        set({ accessToken: token });
      },

      setUser: (user) => {
        set({ user });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: { ...state.user, ...updates }
        }));
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { data } = response.data;

          get().setAuth(data);

          // Return pharmacy info for navigation decisions
          return {
            success: true,
            pharmaciesCount: data.pharmaciesCount || 0,
            autoSelectedPharmacy: data.autoSelectedPharmacy || false,
          };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.register(userData);
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            pharmaciesCount: 0,
            isAuthenticated: false,
            error: null,
          });
          
          // Clear pharmacy selection
          const pharmacyStore = usePharmacyStore.getState();
          pharmacyStore.clearPharmacy();
          
          // Clear UI preferences if needed
          // const uiStore = useUIStore.getState();
          // uiStore.resetToDefaults();
        }
      },

      refreshAccessToken: async () => {
        const refreshToken = get().refreshToken;
        // If no refresh token, user will be logged out when access token expires
        // This is expected behavior when rememberMe = false
        if (!refreshToken) {
          return null;
        }

        try {
          const response = await authAPI.refresh(refreshToken);
          const { accessToken } = response.data.data;
          set({ accessToken });
          return accessToken;
        } catch (error) {
          get().logout();
          return null;
        }
      },

      // Biometric authentication
      loginWithBiometric: async (email, credential, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.verifyLogin({
            email,
            credential,
            rememberMe,
          });

          const { data } = response.data;
          get().setAuth(data);

          // Return pharmacy info for navigation decisions
          return {
            success: true,
            pharmaciesCount: data.pharmaciesCount || 0,
            autoSelectedPharmacy: data.autoSelectedPharmacy || false,
          };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Biometric login failed';
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },

      registerBiometric: async (credential, deviceName) => {
        try {
          const response = await authAPI.verifyRegister({
            credential,
            deviceName,
          });
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.message || 'Biometric registration failed' 
          };
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
        pharmaciesCount: state.pharmaciesCount,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Pharmacy Store
export const usePharmacyStore = create(
  persist(
    (set, get) => ({
      // State
      currentPharmacy: null,
      availablePharmacies: [],
      isLoading: false,
      error: null,

      // Actions
      setCurrentPharmacy: (pharmacy) => {
        set({ currentPharmacy: pharmacy, error: null });
      },

      setAvailablePharmacies: (pharmacies) => {
        set({ availablePharmacies: pharmacies });
      },

      fetchAvailablePharmacies: async () => {
        set({ isLoading: true, error: null });
        try {
          const { pharmacyAPI } = await import('../api/client');
          const response = await pharmacyAPI.getAvailable();
          const pharmacies = response.data.data || [];
          
          set({ 
            availablePharmacies: pharmacies,
            isLoading: false 
          });
          
          return pharmacies;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch pharmacies',
            isLoading: false 
          });
          return [];
        }
      },

      selectPharmacy: async (pharmacyId) => {
        set({ isLoading: true, error: null });
        try {
          const { pharmacyAPI } = await import('../api/client');
          
          // Select pharmacy on server
          await pharmacyAPI.select(pharmacyId);
          
          // Get current pharmacy details
          const response = await pharmacyAPI.getCurrent();
          const pharmacy = response.data.data;
          
          set({ 
            currentPharmacy: pharmacy,
            isLoading: false 
          });
          
          return { success: true, pharmacy };
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to select pharmacy',
            isLoading: false 
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

          if (pharmacy) {
            set({ currentPharmacy: pharmacy, isLoading: false });
          } else {
            set({ isLoading: false });
          }

          return pharmacy;
        } catch (error) {
          console.error('Failed to fetch current pharmacy:', error);
          set({ isLoading: false });
          return null;
        }
      },

      clearPharmacy: () => {
        set({
          currentPharmacy: null,
          availablePharmacies: [],
          error: null,
        });
      },

      // Switch pharmacy (clears current to show selector)
      switchPharmacy: () => {
        set({ currentPharmacy: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'pharmacy-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentPharmacy: state.currentPharmacy,
      }),
    }
  )
);

// UI Store
export const useUIStore = create(
  persist(
    (set, get) => ({
      // State - Use env defaults or fallback to hardcoded values
      theme: import.meta.env.VITE_DEFAULT_THEME || 'light',
      language: import.meta.env.VITE_DEFAULT_LANGUAGE || 'ar',
      sidebarOpen: false,
      isOnline: navigator.onLine,

      // Actions
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff');
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
        const newLanguage = get().language === 'ar' ? 'en' : 'ar';
        get().setLanguage(newLanguage);
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setOnline: (online) => set({ isOnline: online }),

      initializeUI: () => {
        const state = get();
        
        // Set theme
        document.documentElement.setAttribute('data-theme', state.theme);
        
        // Set language and direction
        document.documentElement.setAttribute('dir', state.language === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', state.language);
        
        // Listen to online/offline events
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
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);

export default useAuthStore;