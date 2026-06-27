import type { ReactNode } from "react";

export function SectionTitle({
  kicker,
  title,
  description,
}: {
  kicker?: string;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="mb-8 max-w-2xl">
      {kicker && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-saffron">
          {kicker}
        </p>
      )}
      <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
      )}
    </div>
  );
}
