import type { Category } from "@/lib/netr-data";

export function CategoryChip({ category, active, onClick }: { category: Category; active?: boolean; onClick?: () => void }) {
  const Icon = category.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
        active
          ? "border-transparent bg-foreground text-background"
          : "border-border/70 bg-background/60 text-foreground/80 hover:border-saffron/50 hover:text-foreground"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {category.name}
    </button>
  );
}