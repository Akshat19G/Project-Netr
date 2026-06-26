import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Heart, Sparkles, ShieldCheck, Compass } from "lucide-react";
import { AppShell } from "@/components/netr/AppShell";
import netrLogo from "@/assets/netr-logo.png.asset.json";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Project Netr" },
      { name: "description", content: "About Project Netr — an AI-powered opportunity discovery platform built so every dream finds its opportunity. Created by Akshat Srivastava." },
      { property: "og:title", content: "About — Project Netr" },
      { property: "og:description", content: "Why Project Netr exists, what we believe in, and the people behind it." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useTranslation();
  return (
    <AppShell>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-4xl"
      >
        <div className="flex flex-col items-center text-center">
          <img src={netrLogo.url} alt={t("brand.name")} width={140} height={140} className="h-32 w-32 select-none object-contain" />
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-saffron">{t("about.eyebrow")}</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {t("about.titlePre")} <span className="netr-glow-text">{t("about.titleHighlight")}</span> {t("about.titlePost")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{t("about.lead")}</p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {[
            { icon: Heart, title: t("about.v1.title"), body: t("about.v1.body") },
            { icon: Sparkles, title: t("about.v2.title"), body: t("about.v2.body") },
            { icon: ShieldCheck, title: t("about.v3.title"), body: t("about.v3.body") },
            { icon: Compass, title: t("about.v4.title"), body: t("about.v4.body") },
          ].map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="netr-card p-6">
                <Icon className="h-5 w-5 text-saffron" />
                <h3 className="mt-4 text-base font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-14">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-leaf">{t("about.teamLabel")}</p>
          <div className="netr-card relative overflow-hidden p-8 sm:p-10">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-saffron/10 via-transparent to-leaf/10" />
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-saffron to-saffron-glow font-display text-3xl font-bold text-primary-foreground shadow-[0_12px_32px_-12px_var(--saffron)]">
                AS
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{t("about.developerRole")}</p>
                <h2 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">{t("about.developerName")}</h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("about.developerBio")}</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground/80">
                  <Code2 className="h-3.5 w-3.5 text-saffron" /> {t("about.craftedBadge")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 rounded-[2rem] border border-border/60 bg-gradient-to-br from-saffron/15 via-saffron-glow/10 to-leaf/15 p-10 text-center sm:p-14">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-4xl">{t("about.ctaTitle")}</h2>
          <p className="max-w-lg text-sm text-muted-foreground sm:text-base">{t("about.ctaLead")}</p>
          <Link
            to="/onboarding"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
          >
            {t("about.ctaButton")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.section>
    </AppShell>
  );
}