import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import { PageCard } from "@/components/admin/PageCard";
import { Badge } from "@/components/admin/Badge";
import { Search, Ban, UserCheck, Eye, Users, UserPlus, Store, Crown } from "lucide-react";
import { people, fmt, type Role } from "@/data/mock";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users & Sellers — BozorAdmin" }] }),
  component: UsersPage,
});

const filters: { key: "all" | Role; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "user", label: "Mijozlar" },
  { key: "seller", label: "Sotuvchilar" },
  { key: "admin", label: "Adminlar" },
];

function UsersPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | Role>("all");
  const [list, setList] = useState(people);

  const filtered = useMemo(() => {
    return list.filter(p => {
      if (filter !== "all" && p.role !== filter) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return p.name.toLowerCase().includes(s) || p.email.toLowerCase().includes(s);
    });
  }, [list, q, filter]);

  const totalUsers = list.filter(p => p.role === "user").length;
  const totalSellers = list.filter(p => p.role === "seller").length;
  const newWeek = 14;
  const topRevenue = Math.max(...list.map(p => p.revenue ?? 0));

  const toggleBlock = (id: string) => {
    setList(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (p.role === "admin") {
        alert("Adminni bloklab bo'lmaydi.");
        return p;
      }
      return { ...p, blocked: !p.blocked };
    }));
  };

  return (
    <AdminShell title="Users & Sellers" subtitle="Foydalanuvchilar va sotuvchilar">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Jami foydalanuvchi" value={String(totalUsers + totalSellers)} delta={9.1} tone="primary" icon={<Users className="h-5 w-5" />} />
        <StatCard label="Yangi (7 kun)" value={String(newWeek)} delta={22.0} tone="success" icon={<UserPlus className="h-5 w-5" />} />
        <StatCard label="Jami sotuvchilar" value={String(totalSellers)} delta={5.4} tone="info" icon={<Store className="h-5 w-5" />} />
        <StatCard label="Top daromad" value={fmt.short(topRevenue) + " so'm"} delta={14.8} tone="warning" icon={<Crown className="h-5 w-5" />} />
      </div>

      <PageCard title="Foydalanuvchilar ro'yxati" padded={false}>
        {/* Filter bar */}
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex items-center h-10 px-3 gap-2 rounded-md bg-input border border-border flex-1 max-w-md ring-focus focus-within:border-primary/60">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ism yoki email bo'yicha qidirish..."
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
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 text-left">
                {["Foydalanuvchi", "Role", "Mahsulot / Buyurtma", "Sarflangan / Daromad", "Holat", "Amallar"].map(h => (
                  <th key={h} className="px-5 py-3 label-mono font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const isSeller = p.role === "seller";
                const isUser = p.role === "user";
                const isAdmin = p.role === "admin";
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.avatar} alt={p.name} className="h-9 w-9 rounded-full bg-secondary" />
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{p.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={isAdmin ? "primary" : isSeller ? "info" : "muted"}>
                        {p.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">
                      {isSeller && <>{p.products} ta mahsulot</>}
                      {isUser && <>{p.orders} ta buyurtma</>}
                      {isAdmin && <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-5 py-3 font-display font-bold">
                      {isSeller && fmt.short(p.revenue ?? 0) + " so'm"}
                      {isUser && fmt.short(p.spent ?? 0) + " so'm"}
                      {isAdmin && <span className="text-muted-foreground font-normal">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      {p.blocked ? (
                        <Badge tone="destructive" dot>Bloklangan</Badge>
                      ) : (
                        <Badge tone="success" dot>Faol</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          className="h-8 px-2.5 rounded-md bg-secondary hover:bg-accent text-foreground text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                          title="Profil"
                        >
                          <Eye className="h-3.5 w-3.5" /> Profil
                        </button>
                        <button
                          onClick={() => toggleBlock(p.id)}
                          disabled={isAdmin}
                          className={`h-8 px-2.5 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                            isAdmin
                              ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-60"
                              : p.blocked
                                ? "bg-success-soft text-success hover:bg-success/20"
                                : "bg-destructive-soft text-destructive hover:bg-destructive/20"
                          }`}
                          title={isAdmin ? "Adminni bloklab bo'lmaydi" : p.blocked ? "Blokdan chiqarish" : "Bloklash"}
                        >
                          {p.blocked ? <UserCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                          {p.blocked ? "Faollashtirish" : "Bloklash"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm">Hech narsa topilmadi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </PageCard>
    </AdminShell>
  );
}
