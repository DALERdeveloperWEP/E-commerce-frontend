import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageCard } from "@/components/admin/PageCard";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/admin/Badge";
import { Package, CheckCircle2, Clock, Search } from "lucide-react";
import { products, fmt, type ProductStatus } from "@/data/mock";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — BozorAdmin" }] }),
  component: ProductsPage,
});

const filters: { key: "all" | ProductStatus; label: string }[] = [
  { key: "all", label: "Hammasi" },
  { key: "approved", label: "Tasdiqlangan" },
  { key: "pending", label: "Kutmoqda" },
  { key: "rejected", label: "Rad etilgan" },
];

function ProductsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | ProductStatus>("all");

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (filter !== "all" && p.status !== filter) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return p.title.toLowerCase().includes(s) || p.seller.toLowerCase().includes(s);
    });
  }, [q, filter]);

  return (
    <AdminShell title="Products" subtitle="Global moderatsiya va boshqaruv">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Jami mahsulot" value={String(products.length)} tone="primary" icon={<Package className="h-5 w-5" />} />
        <StatCard label="Tasdiqlangan" value={String(products.filter(p => p.status === "approved").length)} tone="success" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Kutmoqda" value={String(products.filter(p => p.status === "pending").length)} tone="warning" icon={<Clock className="h-5 w-5" />} />
      </div>

      <PageCard title="Barcha mahsulotlar" padded={false}>
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex items-center h-10 px-3 gap-2 rounded-md bg-input border border-border flex-1 max-w-md focus-within:border-primary/60">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Sarlavha yoki sotuvchi..."
              className="bg-transparent outline-none text-sm flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 p-1 rounded-md bg-input border border-border">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                  filter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
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
                {["Mahsulot", "Kategoriya", "Sotuvchi", "Narx", "Stok", "Sotilgan", "Holat"].map(h => (
                  <th key={h} className="px-5 py-3 label-mono font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-secondary shrink-0">
                        <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="font-semibold truncate max-w-[220px]">{p.title}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><Badge tone="info">{p.category}</Badge></td>
                  <td className="px-5 py-3 text-sm">{p.seller}</td>
                  <td className="px-5 py-3 font-display font-bold">{fmt.short(p.price)} so'm</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-xs font-semibold ${p.stock === 0 ? "text-destructive" : p.stock < 10 ? "text-warning" : "text-success"}`}>
                      {p.stock === 0 ? "Tugagan" : `${p.stock} dona`}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono">{p.sold}</td>
                  <td className="px-5 py-3">
                    <Badge tone={p.status === "approved" ? "success" : p.status === "pending" ? "warning" : "destructive"} dot>
                      {p.status === "approved" ? "Tasdiqlangan" : p.status === "pending" ? "Kutmoqda" : "Rad"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>
    </AdminShell>
  );
}
