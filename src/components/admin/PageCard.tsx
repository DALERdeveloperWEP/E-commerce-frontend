import type { ReactNode } from "react";

export function PageCard({
  title, action, children, padded = true,
}: { title?: string; action?: ReactNode; children: ReactNode; padded?: boolean }) {
  return (
    <section className="surface-card shadow-soft">
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
          {title && <h2 className="font-display text-base font-bold tracking-tight">{title}</h2>}
          {action}
        </header>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}
