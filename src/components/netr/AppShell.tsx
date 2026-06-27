import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import netrLogo from "@/assets/netr-logo.png";
import { useTranslation } from "react-i18next";

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen netr-hero-bg">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">{children}</main>
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={netrLogo} alt={t("brand.name")} width={24} height={24} className="h-6 w-6 object-contain opacity-80" />
            <p>{t("brand.footerMotto")}</p>
          </div>
          <p className="tracking-wide">
            Made with <span aria-label="love" className="text-saffron">❤</span> for the Loved Ones
          </p>
          <p className="text-[11px] opacity-70">{t("brand.craftedBy")}</p>
        </div>
      </footer>
    </div>
  );
}