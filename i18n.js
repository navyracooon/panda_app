import * as Localization from "expo-localization";
import * as SecureStore from "expo-secure-store";
import i18n from "i18n-js";

// Import translation files
import en from "./locales/en.json";
import ja from "./locales/ja.json";

// Set the key-value pairs for the supported languages.
i18n.translations = {
  en,
  ja,
};

// Set the locale once at the beginning of your app.
export const initLocalization = async () => {
  const storedLanguage = await SecureStore.getItemAsync("userLanguage");
  i18n.locale = storedLanguage || Localization.locale;
  i18n.fallbacks = true;
};

export default i18n;
