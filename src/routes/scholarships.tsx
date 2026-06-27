import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/netr/AppShell";
import { PageHeader } from "@/components/netr/PageHeader";
import { OpportunityCard } from "@/components/netr/OpportunityCard";
import { searchScholarships } from "@/services/scholarships";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/scholarships")({
  head: () => ({
    meta: [
      { title: "Scholarships · Project Netr" },
      { name: "description", content: "Scholarships for students at every stage — merit, need-based, and identity-based." },
    ],
  }),
  component: ScholarshipsPage,
});

function ScholarshipsPage() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const { data = [], isFetching } = useQuery({
    queryKey: ["scholarships", q],
    queryFn: () => searchScholarships(q),
    placeholderData: (prev) => prev,
  });
  return (
    <AppShell>
      <div className="mb-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <PageHeader
          eyebrow={t("scholarships.eyebrow")}
          title={<>{t("scholarships.titlePre")} <span className="netr-glow-text">{t("scholarships.titleHighlight")}</span> {t("scholarships.titlePost")}</>}
          description={t("scholarships.description")}
        />
        <div className="netr-card relative overflow-hidden p-8">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-saffron/20 to-leaf/15" />
          <GraduationCap className="h-10 w-10 text-saffron" />
          <h3 className="mt-5 text-lg font-semibold">{t("scholarships.sidebarTitle")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t("scholarships.sidebarBody")}</p>
        </div>
      </div>
      <div className="netr-card mb-8 flex items-center gap-3 px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("scholarships.searchPlaceholder")} className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70" />
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {data.map((o, i) => <OpportunityCard key={o.id} opportunity={o} index={i} />)}
      </div>
      {data.length === 0 && !isFetching && (
        <div className="netr-card mt-10 p-10 text-center text-sm text-muted-foreground">{t("scholarships.emptyBody")}</div>
      )}
    </AppShell>
  );
}
