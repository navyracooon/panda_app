import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  PropsWithChildren,
} from "react";
import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import en from "../locales/en";
import ja from "../locales/ja";

const i18n = new I18n({
  en,
  ja,
});

i18n.enableFallback = true;
i18n.defaultLocale = "en";

type LocalizationContextType = {
  t: (scope: string, options?: object) => string;
  locale: string;
  setLocale: (locale: string) => void;
};

const LocalizationContext = createContext<LocalizationContextType>({
  t: () => "",
  locale: "en",
  setLocale: () => {},
});

export const LocalizationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [locale, setLocale] = useState(Localization.locale);

  useEffect(() => {
    i18n.locale = locale;
  }, [locale]);

  const t = (scope: string, options?: object) => {
    return i18n.t(scope, options);
  };

  return (
    <LocalizationContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);
