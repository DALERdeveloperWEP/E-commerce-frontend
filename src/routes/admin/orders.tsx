import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageCard } from "@/components/admin/PageCard";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/admin/Badge";
import { ShoppingCart, Truck, CheckCircle2, XCircle, Search, CreditCard, Wallet, Banknote } from "lucide-react";
import { orders, fmt, type OrderStatus } from "@/data/mock";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — BozorAdmin" }] }),
  component: OrdersPage,
});

const filters: { key: "all" | OrderStatus; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "pending", label: "Kutmoqda" },
  { key: "processing", label: "Jarayonda" },
  { key: "shipping", label: "Yo'lda" },
  { key: "delivered", label: "Yetkazilgan" },
  { key: "cancelled", label: "Bekor" },
];

const statusTone = {
  pending: "warning",
  processing: "info",
  shipping: "primary",
  delivered: "success",
  cancelled: "destructive",
} as const;

const statusLabel = {
  pending: "Kutmoqda",
  processing: "Jarayonda",
  shipping: "Yo'lda",
  delivered: "Yetkazilgan",
  cancelled: "Bekor",
} as const;

const payIcon = { card: CreditCard, cash: Banknote, wallet: Wallet };

function OrdersPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const filtered = useMemo(() => {
    return orders.filter(o => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      return o.product.toLowerCase().includes(q.toLowerCase()) || o.id.toLowerCase().includes(q.toLowerCase());
    });
  }, [q, filter]);

  const today = orders.length; // demo
  const inWay = orders.filter(o => o.status === "shipping").length;
  const delivered = orders.filter(o => o.status === "delivered").length;
  const cancelled = orders.filter(o => o.status === "cancelled").length;

  return (
    <AdminShell title="Orders" subtitle="Global ko'rinish va dispute boshqaruvi">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Bugungi" value={String(today)} tone="primary" icon={<ShoppingCart className="h-5 w-5" />} />
        <StatCard label="Yo'lda" value={String(inWay)} tone="info" icon={<Truck className="h-5 w-5" />} />
        <StatCard label="Yetkazilgan" value={String(delivered)} tone="success" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Bekor qilingan" value={String(cancelled)} tone="destructive" icon={<XCircle className="h-5 w-5" />} />
      </div>

      <PageCard title="Barcha buyurtmalar" padded={false}>
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex items-center h-10 px-3 gap-2 rounded-md bg-input border border-border flex-1 max-w-md focus-within:border-primary/60">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buyurtma ID yoki mahsulot..."
              className="bg-transparent outline-none text-sm flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 p-1 rounded-md bg-input border border-border">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                  filter === f.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 text-left">
                {["Buyurtma", "Mijoz", "Sotuvchi", "Tovar", "Summa", "To'lov", "Holat", "Sana"].map(h => (
                  <th key={h} className="px-5 py-3 label-mono font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const PayIcon = payIcon[o.payment];
                return (
                  <tr key={o.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-primary">{o.id}</td>
                    <td className="px-5 py-3 font-medium">{o.customer}</td>
                    <td className="px-5 py-3 text-muted-foreground text-sm">{o.seller}</td>
                    <td className="px-5 py-3 max-w-[220px] truncate">{o.product} <span className="text-muted-foreground font-mono text-xs">×{o.qty}</span></td>
                    <td className="px-5 py-3 font-display font-bold">{fmt.short(o.total)} so'm</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        <PayIcon className="h-3.5 w-3.5" /> {o.payment}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={statusTone[o.status]} dot>{statusLabel[o.status]}</Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{o.date}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">Buyurtma topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </PageCard>
    </AdminShell>
  );
}
