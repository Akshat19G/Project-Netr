import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/netr/AppShell";
import { PageHeader } from "@/components/netr/PageHeader";
import { OpportunityCard } from "@/components/netr/OpportunityCard";
import { SCHEME_CATS, searchGovernmentSchemes } from "@/services/schemes";
import { type ProgramCategory } from "@/lib/types";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/schemes")({
  head: () => ({
    meta: [
      { title: "Schemes · Project Netr" },
      { name: "description", content: "Government schemes across welfare, housing, healthcare, agriculture and skilling — clearly explained." },
    ],
  }),
  component: SchemesPage,
});

function SchemesPage() {
  const { t } = useTranslation();
  const [active, setActive] = useState<ProgramCategory | null>(null);
  const [q, setQ] = useState("");
  const { data = [], isFetching } = useQuery({
    queryKey: ["schemes", q, active],
    queryFn: () => searchGovernmentSchemes(q, active),
    placeholderData: (prev) => prev,
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow={t("schemes.eyebrow")}
        title={<>{t("schemes.titlePre")} <span className="netr-glow-text">{t("schemes.titleHighlight")}</span></>}
        description={t("schemes.description")}
      />
      <div className="netr-card mb-6 flex items-center gap-3 px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("schemes.searchPlaceholder")} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70" />
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActive(null)}
          className={`rounded-full border px-3.5 py-2 text-sm font-medium ${active === null ? "border-transparent bg-foreground text-background" : "border-border/70 bg-background/60 hover:border-saffron/50"}`}
        >
          {t("common.all")}
        </button>
        {SCHEME_CATS.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${active === c ? "border-transparent bg-foreground text-background" : "border-border/70 bg-background/60 hover:border-saffron/50"}`}
          >
            {t(`programCats.${c}`)}
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {data.map((o, i) => <OpportunityCard key={o.id} opportunity={o} index={i} />)}
      </div>
      {data.length === 0 && !isFetching && (
        <div className="netr-card mt-10 p-10 text-center text-sm text-muted-foreground">{t("schemes.emptyBody")}</div>
      )}
    </AppShell>
  );
}
