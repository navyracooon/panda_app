import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "./locales/en.json";
import jaTranslations from "./locales/ja.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    ja: { translation: jaTranslations },
  },
  lng: "ja",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
