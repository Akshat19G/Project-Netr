import { motion } from "framer-motion";
import { ArrowUpRight, Bookmark, BookmarkCheck, Clock, Coins, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Program } from "@/lib/types";
import { useBookmarksStore } from "@/stores/bookmarks";
import { useTranslation } from "react-i18next";
import { CATEGORY_IMAGE } from "@/lib/category-images";

export function OpportunityCard({
  opportunity,
  index = 0,
}: {
  opportunity: Program;
  index?: number;
}) {
  const isBookmarked = useBookmarksStore((s) => s.isBookmarked(opportunity.id));
  const toggle = useBookmarksStore((s) => s.toggle);
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(opportunity.id);
    toast(isBookmarked ? t("toast.bookmarkRemoved") : t("toast.bookmarkAdded"));
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.25) }}
      className="netr-card netr-card-hover group flex h-full flex-col overflow-hidden"
    >
      <div className="relative h-36 w-full overflow-hidden bg-secondary/60">
        <img
          src={CATEGORY_IMAGE[opportunity.category]}
          alt=""
          loading="lazy"
          width={1024}
          height={512}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground backdrop-blur">
          {t(`programCats.${opportunity.category}`)}
        </span>
        <button
          type="button"
          onClick={handleBookmark}
          aria-label={isBookmarked ? t("card.removeBookmark") : t("card.saveOpp")}
          aria-pressed={isBookmarked}
          className={`absolute right-3 top-3 rounded-full p-1.5 backdrop-blur transition-colors ${isBookmarked ? "bg-saffron/90 text-background" : "bg-background/85 text-foreground hover:bg-background"}`}
        >
          {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-6 pt-5">
        <div className="mb-2 hidden">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary-foreground">
            {t(`programCats.${opportunity.category}`)}
          </span>
        </div>

        <h3 className="text-lg font-semibold leading-snug">{opportunity.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{opportunity.ministry}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground/90">
          {opportunity.description}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-border/60 px-3 py-2">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Coins className="h-3 w-3" /> {t("card.benefitLabel")}
            </div>
            <div className="mt-0.5 font-semibold">{opportunity.benefits}</div>
          </div>
          <div className="rounded-xl border border-border/60 px-3 py-2">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3 w-3" /> {t("card.windowLabel")}
            </div>
            <div className="mt-0.5 font-semibold">{opportunity.deadline}</div>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 text-xs">
            <div>
              <p className="font-semibold uppercase tracking-wider text-muted-foreground">
                {t("card.eligibility")}
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-foreground/80">
                {opportunity.eligibility.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wider text-muted-foreground">
                {t("card.benefits")}
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-foreground/80">
                {opportunity.benefitsDetail.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 self-start text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {expanded ? t("card.hideDetails") : t("card.showDetails")}
        </button>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {opportunity.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <a
            href={opportunity.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-background/60 px-3 py-2.5 text-xs font-semibold transition-colors hover:border-saffron/50"
          >
            <ExternalLink className="h-3.5 w-3.5" /> {t("card.learnMore")}
          </a>
          <a
            href={opportunity.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-foreground px-3 py-2.5 text-xs font-semibold text-background transition-transform group-hover:scale-[1.02]"
          >
            {t("card.applyOfficial")} <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/70">
          {t("card.source")} · {opportunity.source}
        </p>
      </div>
    </motion.article>
  );
}
