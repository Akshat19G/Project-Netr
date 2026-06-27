import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Lock,
  EyeOff,
  UserX,
  Compass,
  HeartHandshake,
  Sprout,
} from "lucide-react";
import treeImg from "@/assets/tree-of-opportunities.png";
import netrLogo from "@/assets/netr-logo.png";
import { categories, personas } from "@/lib/netr-data";
import { TopNav } from "@/components/netr/TopNav";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Project Netr — Every Dream Deserves an Opportunity" },
      { name: "description", content: "An AI-powered opportunity discovery platform for scholarships, grants, schemes, healthcare and welfare programs designed for people like you." },
      { property: "og:title", content: "Project Netr — Every Dream Deserves an Opportunity" },
      { property: "og:description", content: "Discover scholarships, grants, government schemes and benefits designed for people like you. No login. No accounts. Just possibility." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen netr-hero-bg">
      <TopNav />
      <Hero />
      <WhyNetr />
      <CategoriesSection />
      <HowItWorks />
      <PrivacySection />
      <ClosingCTA />
      <Footer />
    </div>
  );
}

function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-12 pb-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20 lg:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-saffron" />
            {t("home.hero.badge")}
          </span>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.25rem]">
            {t("home.hero.headlineLine1")} <br />
            {t("home.hero.headlineLine2Pre")} <span className="netr-glow-text">{t("home.hero.headlineLine2Highlight")}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {t("home.hero.lead")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/onboarding"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
            >
              {t("home.hero.ctaFind")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-saffron/60"
            >
              {t("home.hero.ctaExplore")}
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-leaf" /> {t("home.hero.noAccount")}</span>
            <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-leaf" /> {t("home.hero.privacyFirst")}</span>
            <span className="inline-flex items-center gap-1.5"><HeartHandshake className="h-3.5 w-3.5 text-leaf" /> {t("home.hero.freeAlways")}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-saffron/30 via-saffron-glow/20 to-leaf/20 blur-3xl" />
          <img
            src={treeImg}
            alt={t("home.hero.treeAlt")}
            width={1024}
            height={1024}
            className="relative w-full select-none"
          />
          <motion.div
            aria-hidden
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-2 top-1/3 hidden rounded-2xl border border-border/60 bg-background/80 p-3 text-xs shadow-xl backdrop-blur sm:block"
          >
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-saffron/15 text-saffron"><Sprout className="h-3.5 w-3.5" /></span>
              <div>
                <div className="font-semibold">{t("home.hero.notifTitle")}</div>
                <div className="text-muted-foreground">{t("home.hero.notifSub")}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function WhyNetr() {
  const { t } = useTranslation();
  const stories = [
    { title: t("home.why.students.title"), body: t("home.why.students.body"), icon: "🎓" },
    { title: t("home.why.farmers.title"), body: t("home.why.farmers.body"), icon: "🌾" },
    { title: t("home.why.founders.title"), body: t("home.why.founders.body"), icon: "🚀" },
    { title: t("home.why.families.title"), body: t("home.why.families.body"), icon: "🏠" },
  ];
  return (
    <section className="border-t border-border/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-saffron">{t("home.why.eyebrow")}</p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("home.why.title")}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t("home.why.lead")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stories.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="netr-card netr-card-hover p-6"
            >
              <div className="text-3xl">{s.icon}</div>
              <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const { t } = useTranslation();
  return (
    <section className="border-t border-border/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-saffron">{t("home.cats.eyebrow")}</p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("home.cats.title")}</h2>
          </div>
          <Link to="/opportunities" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-saffron">
            {t("home.cats.browseAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {personas.slice(0, 8).map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                className="netr-card netr-card-hover group relative overflow-hidden p-6"
              >
                <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${p.accent} opacity-60 transition-opacity group-hover:opacity-100`} />
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-background/80 text-foreground shadow-sm">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{t(`personas.${p.id}.title`)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(`personas.${p.id}.description`)}</p>
                <Link to="/onboarding" className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/90 group-hover:text-saffron">
                  {t("home.cats.explore")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-14">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.id}
                  to="/opportunities"
                  className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-saffron/50 hover:text-foreground"
                >
                  <Icon className="h-3.5 w-3.5 text-saffron" />
                  {t(`categories.${c.id}.name`)}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useTranslation();
  const steps = [
    { n: "01", title: t("home.how.s1.title"), body: t("home.how.s1.body") },
    { n: "02", title: t("home.how.s2.title"), body: t("home.how.s2.body") },
    { n: "03", title: t("home.how.s3.title"), body: t("home.how.s3.body") },
  ];
  return (
    <section className="border-t border-border/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-saffron">{t("home.how.eyebrow")}</p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("home.how.title")}</h2>
        </div>
        <ol className="grid gap-6 lg:grid-cols-3">
          {steps.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="netr-card p-7"
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-3xl font-bold text-saffron">{s.n}</span>
                <span className="h-px flex-1 bg-gradient-to-r from-saffron/60 to-transparent" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PrivacySection() {
  const { t } = useTranslation();
  const items = [
    { icon: UserX, title: t("home.privacy.noAccount.title"), body: t("home.privacy.noAccount.body") },
    { icon: ShieldCheck, title: t("home.privacy.noLogin.title"), body: t("home.privacy.noLogin.body") },
    { icon: Lock, title: t("home.privacy.first.title"), body: t("home.privacy.first.body") },
    { icon: EyeOff, title: t("home.privacy.data.title"), body: t("home.privacy.data.body") },
    { icon: Compass, title: t("home.privacy.explore.title"), body: t("home.privacy.explore.body") },
  ];
  return (
    <section className="border-t border-border/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-leaf">{t("home.privacy.eyebrow")}</p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("home.privacy.title")}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t("home.privacy.lead")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div key={it.title} className="netr-card p-5">
                <Icon className="h-5 w-5 text-leaf" />
                <h3 className="mt-4 text-sm font-semibold">{it.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{it.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ClosingCTA() {
  const { t } = useTranslation();
  return (
    <section className="px-4 pb-24 pt-10 sm:px-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-border/60 bg-gradient-to-br from-saffron/20 via-saffron-glow/15 to-leaf/15 p-10 text-center sm:p-16">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-5xl">{t("home.cta.title")}</h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">{t("home.cta.lead")}</p>
        <Link
          to="/onboarding"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
        >
          {t("home.cta.button")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border/40 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <img src={netrLogo} alt={t("brand.name")} width={28} height={28} className="h-7 w-7 object-contain" />
          <p>{t("brand.footerMotto")}</p>
        </div>
        <p>{t("brand.indexFooter")}</p>
      </div>
    </footer>
  );
}