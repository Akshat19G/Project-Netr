import { useEffect } from "react";
import { applyTheme, usePreferencesStore } from "@/stores/preferences";

/** Mount once at the app root to sync persisted theme with the document. */
export function ThemeInit() {
  const theme = usePreferencesStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [theme]);

  return null;
}