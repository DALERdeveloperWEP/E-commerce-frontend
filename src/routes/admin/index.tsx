import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import { PageCard } from "@/components/admin/PageCard";
import { Badge } from "@/components/admin/Badge";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import {
  DollarSign, ShoppingBag, Users, Package, ArrowUpRight,
} from "lucide-react";
import {
  revenueByMonth, categoryShare, recentActivity, people, fmt,
} from "@/data/mock";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — BozorAdmin" },
      { name: "description", content: "Daromad, buyurtmalar, sotuvchilar va so'nggi faollik bo'yicha to'liq ko'rinish." },
    ],
  }),
  component: Dashboard,
});

const chartColors = ["#FF6633", "#70C05B", "#1CB9FC", "#FCA21C", "#A855F7", "#F472B6"];

function Dashboard() {
  const topSellers = [...people]
    .filter(p => p.role === "seller")
    .sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))
    .slice(0, 5);

  return (
    <AdminShell title="Dashboard" subtitle="Umumiy ko'rinish">
      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Jami daromad" value="412 mln so'm" delta={18.4} tone="primary" icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Buyurtmalar (oy)" value="892" delta={11.2} tone="info" icon={<ShoppingBag className="h-5 w-5" />} />
        <StatCard label="Faol sotuvchilar" value="64" delta={6.7} tone="success" icon={<Users className="h-5 w-5" />} />
        <StatCard label="Tasdiq kutmoqda" value="23" delta={-4.3} tone="warning" icon={<Package className="h-5 w-5" />} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className="xl:col-span-2">
          <PageCard
            title="Daromad dinamikasi · so'nggi 12 oy"
            action={<Badge tone="success" dot>Realtime</Badge>}
          >
            <div className="h-[320px] -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByMonth} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6633" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#FF6633" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono" }} stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}m`} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8, fontSize: 12,
                    }}
                    formatter={(v) => [`${v} mln so'm`, "Daromad"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#FF6633" strokeWidth={2.5} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </PageCard>
        </div>

        <PageCard title="Kategoriya ulushi">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryShare} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {categoryShare.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </PageCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <PageCard title="Buyurtmalar oqimi">
          <div className="h-[260px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="orders" fill="#1CB9FC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageCard>

        <div className="xl:col-span-2">
          <PageCard
            title="Top sotuvchilar · daromad bo'yicha"
            action={<button className="text-xs font-mono uppercase tracking-wider text-primary hover:underline flex items-center gap-1">Hammasi <ArrowUpRight className="h-3 w-3" /></button>}
          >
            <ul className="divide-y divide-border -mx-1">
              {topSellers.map((s, i) => {
                const max = topSellers[0].revenue ?? 1;
                const pct = ((s.revenue ?? 0) / max) * 100;
                return (
                  <li key={s.id} className="flex items-center gap-4 px-1 py-3">
                    <div className="font-mono text-xs text-muted-foreground w-5">#{i + 1}</div>
                    <img src={s.avatar} alt={s.name} className="h-10 w-10 rounded-full bg-secondary" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="font-semibold text-sm truncate">{s.name}</div>
                        <div className="font-display font-bold text-sm">{fmt.short(s.revenue ?? 0)} so'm</div>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full gradient-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="hidden sm:block text-xs text-muted-foreground font-mono">{s.products} mahsulot</div>
                  </li>
                );
              })}
            </ul>
          </PageCard>
        </div>
      </div>

      {/* Activity */}
      <PageCard title="So'nggi faollik" action={<Badge tone="info">Live feed</Badge>}>
        <ul className="space-y-3">
          {recentActivity.map(a => (
            <li key={a.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-secondary/60 transition-colors">
              <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                a.tone === "success" ? "bg-success" :
                a.tone === "info" ? "bg-info" : "bg-destructive"
              }`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm">{a.text}</div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">{a.time}</div>
              </div>
              <Badge tone={a.tone}>{a.type.replace("_", " ")}</Badge>
            </li>
          ))}
        </ul>
      </PageCard>
    </AdminShell>
  );
}
