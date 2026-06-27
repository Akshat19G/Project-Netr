import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

export type LangCode =
  | "en"
  | "hi"
  | "mr"
  | "ta"
  | "te"
  | "kn"
  | "ml"
  | "gu"
  | "pa"
  | "bn"
  | "or"
  | "ur";

export const SUPPORTED_LANGUAGES: {
  code: LangCode;
  native: string;
  english: string;
  flag: string;
  dir?: "rtl" | "ltr";
}[] = [
  { code: "en", native: "English", english: "English", flag: "🇬🇧" },
  { code: "hi", native: "हिन्दी", english: "Hindi", flag: "🇮🇳" },
  { code: "mr", native: "मराठी", english: "Marathi", flag: "🇮🇳" },
  { code: "ta", native: "தமிழ்", english: "Tamil", flag: "🇮🇳" },
  { code: "te", native: "తెలుగు", english: "Telugu", flag: "🇮🇳" },
  { code: "kn", native: "ಕನ್ನಡ", english: "Kannada", flag: "🇮🇳" },
  { code: "ml", native: "മലയാളം", english: "Malayalam", flag: "🇮🇳" },
  { code: "gu", native: "ગુજરાતી", english: "Gujarati", flag: "🇮🇳" },
  { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi", flag: "🇮🇳" },
  { code: "bn", native: "বাংলা", english: "Bengali", flag: "🇮🇳" },
  { code: "or", native: "ଓଡ଼ିଆ", english: "Odia", flag: "🇮🇳" },
  { code: "ur", native: "اردو", english: "Urdu", flag: "🇮🇳", dir: "rtl" },
];

import en from "./locales/en";
import hi from "./locales/hi";
import mr from "./locales/mr";
import ta from "./locales/ta";
import te from "./locales/te";
import kn from "./locales/kn";
import ml from "./locales/ml";
import gu from "./locales/gu";
import pa from "./locales/pa";
import bn from "./locales/bn";
import or from "./locales/or";
import ur from "./locales/ur";

if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        hi: { translation: hi },
        mr: { translation: mr },
        ta: { translation: ta },
        te: { translation: te },
        kn: { translation: kn },
        ml: { translation: ml },
        gu: { translation: gu },
        pa: { translation: pa },
        bn: { translation: bn },
        or: { translation: or },
        ur: { translation: ur },
      },
      fallbackLng: "en",
      supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: "netr.lang.v1",
        caches: ["localStorage"],
      },
      react: { useSuspense: false },
    });
}

export function setLanguage(code: LangCode) {
  void i18n.changeLanguage(code);
  try {
    localStorage.setItem("netr.lang.v1", code);
    localStorage.setItem("netr.lang.chosen", "1");
  } catch {}
  if (typeof document !== "undefined") {
    document.documentElement.lang = code;
    const meta = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    document.documentElement.dir = meta?.dir ?? "ltr";
  }
}

export function hasChosenLanguage(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem("netr.lang.chosen") === "1";
  } catch {
    return true;
  }
}

export function resetToBrowserLanguage() {
  try {
    localStorage.removeItem("netr.lang.v1");
    localStorage.removeItem("netr.lang.chosen");
  } catch {}
  const nav = (
    typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : "en"
  ) as LangCode;
  const supported = SUPPORTED_LANGUAGES.find((l) => l.code === nav);
  setLanguage(supported ? supported.code : "en");
  try {
    localStorage.removeItem("netr.lang.chosen");
  } catch {}
}

export default i18n;
