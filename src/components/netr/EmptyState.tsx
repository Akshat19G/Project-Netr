import emptyImg from "@/assets/illustration-empty-state.png";

export function EmptyState({
  title,
  body,
  action,
  image = emptyImg,
  alt = "Empty state illustration",
}: {
  title: string;
  body?: string;
  action?: React.ReactNode;
  image?: string;
  alt?: string;
}) {
  return (
    <div className="netr-card mx-auto flex max-w-xl flex-col items-center gap-4 p-10 text-center">
      <img src={image} alt={alt} loading="lazy" className="h-40 w-auto object-contain opacity-95" />
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {body && <p className="max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action}
    </div>
  );
}