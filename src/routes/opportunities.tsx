import { createFileRoute } from "@tanstack/react-router";
import { Compass, Loader2, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/netr/AppShell";
import { PageHeader } from "@/components/netr/PageHeader";
import { OpportunityCard } from "@/components/netr/OpportunityCard";
import { searchOpportunities } from "@/services/opportunities";
import { useRecentSearchesStore } from "@/stores/recent-searches";
import { type ProgramCategory } from "@/lib/types";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/netr/EmptyState";
import { useProfileStore } from "@/stores/profile";
import { ALL_CATEGORIES, categoriesForPersona } from "@/lib/persona-categories";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities · Project Netr" },
      { name: "description", content: "Search and explore scholarships, grants, schemes and benefits — filtered for who you are." },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const { t } = useTranslation();
  const profile = useProfileStore((s) => s.profile);
  const hasProfile = useProfileStore((s) => s.hasProfile);
  const personaCats = useMemo(() => categoriesForPersona(profile.persona), [profile.persona]);
  const isPersonalized = hasProfile && !!profile.persona && personaCats.length < ALL_CATEGORIES.length;
  const [exploreAll, setExploreAll] = useState(false);
  const visibleCats: ProgramCategory[] = exploreAll || !isPersonalized ? ALL_CATEGORIES : personaCats;

  const [q, setQ] = useState("");
  const [active, setActive] = useState<ProgramCategory | null>(null);
  const [sort, setSort] = useState<"relevance" | "alpha">("relevance");
  const [page, setPage] = useState(1);
  const pushRecent = useRecentSearchesStore((s) => s.push);
  const recent = useRecentSearchesStore((s) => s.searches);

  // Reset active chip if it falls outside the current persona scope.
  useEffect(() => {
    if (active && !visibleCats.includes(active)) setActive(null);
  }, [visibleCats, active]);

  const { data: rawData = [], isFetching } = useQuery({
    queryKey: ["search", q, active, sort],
    queryFn: () => searchOpportunities({ q, category: active, sort }),
    placeholderData: (prev) => prev,
  });

  // When no specific chip is selected, narrow to the visible category set.
  const data = useMemo(() => {
    if (active) return rawData;
    return rawData.filter((p) => visibleCats.includes(p.category));
  }, [rawData, visibleCats, active]);

  useEffect(() => {
    const t = setTimeout(() => { if (q.trim()) pushRecent(q.trim()); }, 600);
    return () => clearTimeout(t);
  }, [q, pushRecent]);

  useEffect(() => { setPage(1); }, [q, active, sort, exploreAll]);

  const PAGE_SIZE = 9;
  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const slice = useMemo(() => data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [data, page]);

  return (
    <AppShell>
      <PageHeader
        eyebrow={t("opportunities.eyebrow")}
        title={<>{t("opportunities.titlePre")} <span className="netr-glow-text">{t("opportunities.titleHighlight")}</span></>}
        description={t("opportunities.description")}
      />

      {isPersonalized && (
        <div className="netr-card mb-4 flex flex-wrap items-center gap-3 p-4">
          <Sparkles className="h-4 w-4 text-saffron" />
          <p className="text-sm">
            {exploreAll ? (
              <>{t("opportunities.browsingAll", "Browsing every category. ")}</>
            ) : (
              <>
                {t("opportunities.personalizedFor", "Personalized for ")}
                <span className="font-semibold capitalize">{t(`personas.${profile.persona}.title`, profile.persona ?? "")}</span>
                {" — "}
                {t("opportunities.onlyRelevant", "showing categories that fit you.")}
              </>
            )}
          </p>
          <button
            onClick={() => setExploreAll((v) => !v)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-3.5 py-1.5 text-xs font-semibold hover:border-saffron/50"
          >
            <Compass className="h-3.5 w-3.5" />
            {exploreAll
              ? t("opportunities.backToMine", "Back to my categories")
              : t("opportunities.exploreOther", "Explore other categories")}
          </button>
        </div>
      )}

      <div className="netr-card flex items-center gap-3 px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("opportunities.searchPlaceholder")}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
        />
        {q && (
          <button onClick={() => setQ("")} aria-label={t("opportunities.clearSearch")} className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {recent.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="uppercase tracking-wider">{t("opportunities.recent")}</span>
          {recent.map((r) => (
            <button key={r} onClick={() => setQ(r)} className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 hover:border-saffron/40 hover:text-foreground">
              {r}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActive(null)}
          className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${active === null ? "border-transparent bg-foreground text-background" : "border-border/70 bg-background/60 text-foreground/80 hover:border-saffron/50"}`}
        >
          {t("common.all")}
        </button>
        {visibleCats.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${active === c ? "border-transparent bg-foreground text-background" : "border-border/70 bg-background/60 text-foreground/80 hover:border-saffron/50"}`}
          >
            {t(`programCats.${c}`)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span>{t("common.resultsOther", { count: total })}</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "relevance" | "alpha")}
            className="rounded-full border border-border/60 bg-background/60 px-3 py-1.5 text-xs outline-none"
          >
            <option value="relevance">{t("opportunities.sortRelevance")}</option>
            <option value="alpha">{t("opportunities.sortAlpha")}</option>
          </select>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {slice.map((o, i) => <OpportunityCard key={o.id} opportunity={o} index={i} />)}
      </div>

      {total === 0 && !isFetching && (
        <EmptyState title={t("opportunities.emptyTitle")} body={t("opportunities.emptyBody")} />
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-full border border-border/60 px-4 py-2 disabled:opacity-40">{t("common.previousPage")}</button>
          <span className="text-muted-foreground">{t("common.pageOf", { page, total: totalPages })}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-full border border-border/60 px-4 py-2 disabled:opacity-40">{t("common.nextPage")}</button>
        </div>
      )}
    </AppShell>
  );
}