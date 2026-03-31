import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  ar: {
    title: 'خريطة ارتفاعات قطاع غزة',
    subtitle: 'انقر على الخريطة لعرض الارتفاع بالمتر',
    clickMap: 'الخريطة',
    elevation: 'الارتفاع',
    meter: 'م',
    loading: 'جارٍ الحصول على الارتفاع...',
    outsideGaza: 'هذه النقطة خارج حدود قطاع غزة',
    fetchError: 'تعذّر الحصول على بيانات الارتفاع',
    fullscreen: 'ملء الشاشة',
    share: 'مشاركة',
    elevLayer: 'طبقة الارتفاعات',
    developer: 'تطوير',
    devName: 'أنس يوسف الأشقر',
    loadMap: 'تحميل الخريطة الأساسية...',
    loadElev: 'تحميل طبقة الارتفاعات...',
    loadBorder: 'تحميل حدود قطاع غزة...',
    ready: 'جاهز!',
    langToggle: 'EN',
    dir: 'rtl',
    searchPlaceholder: 'ادخل الإحداثيات (مثال: 31.5, 34.4)',
    searchBtn: 'بحث',
    invalidCoords: 'تنسيق الإحداثيات غير صحيح',
  },
  en: {
    title: 'Gaza Strip Elevation Map',
    subtitle: 'Click on the map to display elevation in meters',
    clickMap: 'map',
    elevation: 'elevation',
    meter: 'm',
    loading: 'Fetching elevation...',
    outsideGaza: 'This point is outside Gaza Strip boundaries',
    fetchError: 'Failed to fetch elevation data',
    fullscreen: 'Fullscreen',
    share: 'Share',
    elevLayer: 'Elevation Layer',
    developer: 'Developed by',
    devName: 'Anas Yousef Al-Ashqar',
    loadMap: 'Loading base map...',
    loadElev: 'Loading elevation layer...',
    loadBorder: 'Loading Gaza boundaries...',
    ready: 'Ready!',
    langToggle: 'عربي',
    dir: 'ltr',
    searchPlaceholder: 'Enter coords (e.g. 31.5, 34.4)',
    searchBtn: 'Search',
    invalidCoords: 'Invalid format',
  },
};

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('ar');

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  const t = translations[lang];

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
