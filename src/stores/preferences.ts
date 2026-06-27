import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";
export type Language = "en" | "hi";

type PrefState = {
  theme: Theme;
  language: Language;
  reduceMotion: boolean;
  setTheme: (t: Theme) => void;
  setLanguage: (l: Language) => void;
  setReduceMotion: (v: boolean) => void;
};

export const usePreferencesStore = create<PrefState>()(
  persist(
    (set) => ({
      theme: "system",
      language: "en",
      reduceMotion: false,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    { name: "netr.preferences.v1", storage: createJSONStorage(() => localStorage) },
  ),
);

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", isDark);
}