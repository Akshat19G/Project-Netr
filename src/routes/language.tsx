import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check } from "lucide-react";
import { SUPPORTED_LANGUAGES, setLanguage, type LangCode } from "@/i18n";
import netrLogo from "@/assets/netr-logo.png";
import welcomeImg from "@/assets/illustration-language-welcome.png";

export const Route = createFileRoute("/language")({
  head: () => ({
    meta: [
      { title: "Choose Your Language · Project Netr" },
      { name: "description", content: "Project Netr is available in your preferred language." },
    ],
  }),
  component: LanguagePage,
});

function LanguagePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<LangCode>(
    (i18n.language?.slice(0, 2) as LangCode) || "en",
  );

  useEffect(() => {
    // Live-preview the selection as the user clicks through.
    setLanguage(selected);
  }, [selected]);

  const onContinue = () => {
    setLanguage(selected);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen netr-hero-bg">
      <header className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 py-6 sm:px-6">
        <img
          src={netrLogo}
          alt="Project Netr"
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
        />
        <div className="leading-none">
          <div className="font-display text-base font-bold tracking-tight">
            <span className="text-[#1e3a8a]">Project</span>{" "}
            <span className="text-[#ef7c1a]">Netr</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {t("nav.tagline")}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {t("language.title")}
          </h1>
          <p className="mt-3 max-w-md text-base text-muted-foreground">{t("language.subtitle")}</p>

          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const active = selected === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setSelected(lang.code)}
                  aria-pressed={active}
                  lang={lang.code}
                  dir={lang.dir ?? "ltr"}
                  className={`group relative flex items-center justify-between gap-2 rounded-2xl border bg-background/60 px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-saffron/60 focus:outline-none focus:ring-2 focus:ring-saffron/50 ${
                    active ? "border-saffron bg-saffron/10 shadow-sm" : "border-border/60"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-xl" aria-hidden>
                      {lang.flag}
                    </span>
                    <span className="flex flex-col leading-tight">
                      <span className="font-display text-base font-semibold">{lang.native}</span>
                      <span className="text-[11px] text-muted-foreground">{lang.english}</span>
                    </span>
                  </span>
                  {active && <Check className="h-4 w-4 text-saffron" aria-hidden />}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onContinue}
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
            >
              {t("language.continue")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <p className="text-xs text-muted-foreground">{t("language.note")}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <img
            src={welcomeImg}
            alt="A diverse group of Indian citizens standing together under a tree of opportunity"
            width={1280}
            height={960}
            className="w-full rounded-3xl object-contain"
          />
        </motion.div>
      </main>
    </div>
  );
}
