// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// مسیر درست به فایل‌های ترجمه
import faCommon from "./locales/fa/common.json";
import enCommon from "./locales/en/common.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fa: { common: faCommon },
      en: { common: enCommon },
    },
    lng: "fa",               // زبان پیش‌فرض
    fallbackLng: "en",       // اگر در فارسی کلید نبود
    supportedLngs: ["fa", "en"],
    ns: ["common"],          // فضای ترجمه
    defaultNS: "common",
    interpolation: {
      escapeValue: false,    // React خودش امن‌سازی می‌کند
    },
    react: {
      useSuspense: true,     // چون دور i18n را Suspense گرفته‌ایم
    },
  });

export default i18n;
