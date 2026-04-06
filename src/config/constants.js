// App configuration constants
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'دار الحكمة',
  nameEn: import.meta.env.VITE_APP_NAME_EN || 'Dar ElHekma',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'بوابة إلكترونية لطلبات الصيدليات',
  descriptionEn: import.meta.env.VITE_APP_DESCRIPTION_EN || 'Pharmacy Portal for Orders Management',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
};

// Helper function to get app name based on language
export const getAppName = (language = 'ar') => {
  return language === 'ar' ? APP_CONFIG.name : APP_CONFIG.nameEn;
};

// Helper function to get app description based on language
export const getAppDescription = (language = 'ar') => {
  return language === 'ar' ? APP_CONFIG.description : APP_CONFIG.descriptionEn;
};
