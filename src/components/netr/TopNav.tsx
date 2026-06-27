import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import netrLogo from "@/assets/netr-logo.png";

const tabs = [
  { to: "/dashboard", key: "dashboard" },
  { to: "/opportunities", key: "opportunities" },
  { to: "/scholarships", key: "scholarships" },
  { to: "/schemes", key: "schemes" },
  { to: "/ai-assistant", key: "aiAssistant" },
  { to: "/documents", key: "documents" },
  { to: "/about", key: "about" },
  { to: "/settings", key: "settings" },
] as const;

export function TopNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src={netrLogo}
            alt="Project Netr"
            width={40}
            height={40}
            className="h-10 w-10 select-none object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="font-display text-base font-bold tracking-tight">
              <span className="text-[#1e3a8a]">Project</span> <span className="text-[#ef7c1a]">Netr</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t("nav.tagline")}</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {tabs.map((tab) => {
            const active = pathname === tab.to || (tab.to !== "/dashboard" && pathname.startsWith(tab.to));
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className="relative rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-secondary"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className={`relative ${active ? "text-foreground" : ""}`}>{t(`nav.${tab.key}`)}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          to="/onboarding"
          className="hidden rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background transition-transform hover:scale-[1.03] sm:inline-flex"
        >
          {t("nav.findOpportunities")}
        </Link>
      </div>

      <div className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
        {tabs.map((tab) => {
          const active = pathname === tab.to || (tab.to !== "/dashboard" && pathname.startsWith(tab.to));
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? "bg-secondary text-foreground" : "text-muted-foreground"
              }`}
            >
              {t(`nav.${tab.key}`)}
            </Link>
          );
        })}
      </div>
    </header>
  );
}