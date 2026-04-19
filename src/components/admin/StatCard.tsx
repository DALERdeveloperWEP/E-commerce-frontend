import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
  label, value, delta, icon, tone = "default",
}: {
  label: string; value: string; delta?: number; icon: ReactNode;
  tone?: "default" | "primary" | "success" | "info" | "warning" | "destructive";
}) {
  const toneMap = {
    default: "bg-secondary text-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success-soft text-success",
    info: "bg-info/15 text-info",
    warning: "bg-warning/20 text-warning",
    destructive: "bg-destructive-soft text-destructive",
  } as const;

  const positive = (delta ?? 0) >= 0;

  return (
    <div className="surface-card p-5 shadow-soft hover:shadow-pop transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="label-mono">{label}</div>
          <div className="font-display text-[28px] font-bold leading-tight mt-2 tracking-tight">{value}</div>
        </div>
        <div className={`h-10 w-10 grid place-items-center rounded-lg ${toneMap[tone]}`}>
          {icon}
        </div>
      </div>
      {delta !== undefined && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono font-semibold ${positive ? "bg-success-soft text-success" : "bg-destructive-soft text-destructive"}`}>
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? "+" : ""}{delta}%
          </span>
          <span className="text-muted-foreground">o'tgan oyga nisbatan</span>
        </div>
      )}
    </div>
  );
}
