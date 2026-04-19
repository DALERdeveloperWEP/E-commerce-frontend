import type { ReactNode } from "react";

type Tone = "primary" | "success" | "warning" | "destructive" | "info" | "muted";

const map: Record<Tone, string> = {
  primary: "bg-primary/12 text-primary border-primary/20",
  success: "bg-success-soft text-success border-success/30",
  warning: "bg-warning/20 text-warning border-warning/30",
  destructive: "bg-destructive-soft text-destructive border-destructive/30",
  info: "bg-info/15 text-info border-info/30",
  muted: "bg-secondary text-muted-foreground border-border",
};

export function Badge({
  tone = "muted", children, dot = false,
}: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider border ${map[tone]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
