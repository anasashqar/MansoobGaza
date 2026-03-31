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
    searchPlaceholder: 'ابحث باسم المكان أو بالإحداثيات...',
    searchBtn: 'بحث',
    invalidCoords: 'لم يتم العثور على نتيجة متطابقة',
    heroBadge: 'طُور بكل 💚 من أجل غزة',
    heroTitle: 'اكتشف تضاريس غزة',
    heroSubtitle: 'خريطة تفاعلية دقيقة توضح مستويات الارتفاع والانخفاض في قطاع غزة، مصممة بأحدث التقنيات لعرض البيانات الطبوغرافية بوضوح تام للباحثين والمهتمين.',
    heroBtn: 'تصفح الخريطة الآن',
    feat1Title: 'دقة وتفصيل',
    feat1Desc: 'قراءات مترية دقيقة لكافة المواقع.',
    feat2Title: 'تصميم تفاعلي',
    feat2Desc: 'ألوان توضح التدرج الطبوغرافي.',
    feat3Title: 'بحث ذكي',
    feat3Desc: 'باسم المكان أو الإحداثيات مباشرة.',
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
    searchPlaceholder: 'Search by place name or coordinates...',
    searchBtn: 'Search',
    invalidCoords: 'No matching place found',
    heroBadge: 'Built with 💚 for Gaza',
    heroTitle: 'Discover Gaza\'s Terrain',
    heroSubtitle: 'A highly precise interactive map detailing the elevation levels of the Gaza Strip, built with modern tech to provide clear topographic data for researchers and everyone.',
    heroBtn: 'Explore the Map',
    feat1Title: 'High Precision',
    feat1Desc: 'Accurate metric readings for all locations.',
    feat2Title: 'Interactive Design',
    feat2Desc: 'Color gradients showing topography.',
    feat3Title: 'Smart Search',
    feat3Desc: 'Search by place name or exact coordinates.',
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
