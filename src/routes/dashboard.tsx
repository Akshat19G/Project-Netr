import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BookmarkCheck, GraduationCap, Landmark, Loader2, Sparkles, Sun, Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/netr/AppShell";
import { OpportunityCard } from "@/components/netr/OpportunityCard";
import { categories, suggestedQuestions } from "@/lib/netr-data";
import { useProfileStore, profileSummary } from "@/stores/profile";
import { useBookmarksStore } from "@/stores/bookmarks";
import { findEligiblePrograms, listAllOpportunities } from "@/services/opportunities";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Project Netr" },
      { name: "description", content: "A quiet, personal discovery feed of opportunities surfaced just for you." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useProfileStore((s) => s.profile);
  const hasProfile = useProfileStore((s) => s.hasProfile);
  const bookmarkIds = useBookmarksStore((s) => s.ids);

  const recQuery = useQuery({
    queryKey: ["recommend", profile.updatedAt ?? 0, hasProfile],
    queryFn: () =>
      hasProfile ? findEligiblePrograms(profile, 6) : listAllOpportunities().then((p) => p.slice(0, 6)),
  });
  const recommended = recQuery.data ?? [];

  const bookmarkedQuery = useQuery({
    queryKey: ["bookmarked", bookmarkIds.join(",")],
    queryFn: async () => {
      if (bookmarkIds.length === 0) return [];
      const all = await listAllOpportunities();
      return all.filter((p) => bookmarkIds.includes(p.id));
    },
  });

  const suggestedQuestions = (t("suggested", { returnObjects: true }) as string[]) ?? [];

  return (
    <AppShell>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="netr-card relative overflow-hidden p-8 sm:p-10"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-saffron/15 via-saffron-glow/10 to-leaf/10" />
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-saffron">
          <Sun className="h-3.5 w-3.5" /> {t("dashboard.goodToSee")}
        </div>
        <h1 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {hasProfile ? t("dashboard.headlineWithProfile") : t("dashboard.headlineNoProfile")}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          {hasProfile ? profileSummary(profile) : t("dashboard.leadNoProfile")}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/ai-assistant" className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">
            <Sparkles className="h-3.5 w-3.5" /> {t("dashboard.askAi")}
          </Link>
          {!hasProfile && (
            <Link to="/onboarding" className="inline-flex items-center gap-2 rounded-full bg-saffron px-4 py-2 text-xs font-semibold text-primary-foreground">
              {t("dashboard.startOnboarding")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <Link to="/opportunities" className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-xs font-semibold">
            {t("dashboard.browseAll")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.section>

      <section className="mt-12">
        <h2 className="mb-4 font-display text-lg font-bold tracking-tight">{t("dashboard.quickActionsTitle")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction icon={GraduationCap} label={t("dashboard.qa.scholarships.label")} sub={t("dashboard.qa.scholarships.sub")} onClick={() => navigate({ to: "/scholarships" })} />
          <QuickAction icon={Landmark} label={t("dashboard.qa.schemes.label")} sub={t("dashboard.qa.schemes.sub")} onClick={() => navigate({ to: "/schemes" })} />
          <QuickAction icon={Sparkles} label={t("dashboard.qa.ai.label")} sub={t("dashboard.qa.ai.sub")} onClick={() => navigate({ to: "/ai-assistant" })} />
          <QuickAction icon={Upload} label={t("dashboard.qa.documents.label")} sub={t("dashboard.qa.documents.sub")} onClick={() => navigate({ to: "/documents" })} />
        </div>
      </section>

      <section className="mt-14">
        <SectionHead title={hasProfile ? t("dashboard.recommendedTitle") : t("dashboard.featuredTitle")} link="/opportunities" linkLabel={t("dashboard.seeAll")} />
        {recQuery.isLoading ? (
          <div className="netr-card flex items-center justify-center p-10 text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("dashboard.loadingOpps")}</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recommended.map((o, i) => <OpportunityCard key={o.id} opportunity={o} index={i} />)}
          </div>
        )}
      </section>

      <section className="mt-14">
        <SectionHead title={t("dashboard.categoriesTitle")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.button
                key={c.id}
                onClick={() => navigate({ to: "/opportunities" })}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="netr-card netr-card-hover p-5 text-left"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-saffron/15 text-saffron"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 font-semibold">{t(`categories.${c.id}.name`)}</h3>
                <p className="text-xs text-muted-foreground">{t(`categories.${c.id}.blurb`)}</p>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="mt-14">
        <SectionHead title={`${t("dashboard.bookmarksTitle")}${bookmarkedQuery.data?.length ? ` (${bookmarkedQuery.data.length})` : ""}`} />
        {bookmarkedQuery.data && bookmarkedQuery.data.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {bookmarkedQuery.data.map((o, i) => <OpportunityCard key={o.id} opportunity={o} index={i} />)}
          </div>
        ) : (
          <div className="netr-card flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <BookmarkCheck className="h-5 w-5 text-saffron" /> {t("dashboard.saveOppsHint")}
          </div>
        )}
      </section>

      <section className="mt-14">
        <SectionHead title={t("dashboard.askAnythingTitle")} link="/ai-assistant" linkLabel={t("dashboard.openAssistant")} />
        <div className="netr-card grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
          {suggestedQuestions.map((q) => (
            <Link
              key={q}
              to="/ai-assistant"
              search={{ q } as never}
              className="group flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm transition-colors hover:bg-secondary"
            >
              <span>{q}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function QuickAction({ icon: Icon, label, sub, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="netr-card netr-card-hover group flex items-center gap-3 p-4 text-left">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-saffron/15 text-saffron group-hover:bg-saffron group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-muted-foreground">{sub}</span>
      </span>
    </button>
  );
}

function SectionHead({ title, link, linkLabel }: { title: string; link?: string; linkLabel?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      {link && (
        <Link to={link} className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          {linkLabel ?? "→"} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
