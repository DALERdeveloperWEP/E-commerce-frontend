import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageCard } from "@/components/admin/PageCard";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/admin/Badge";
import { FolderTree, CheckCircle2, Clock, Plus, Check, X, Edit2 } from "lucide-react";
import { categories as initial } from "@/data/mock";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Kategoriyalar — BozorAdmin" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [list, setList] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const total = list.length;
  const active = list.filter(c => c.status === "active").length;
  const pending = list.filter(c => c.status === "pending").length;

  const create = () => {
    if (!name.trim()) return;
    setList(prev => [
      { id: `c${Date.now()}`, name: name.trim(), slug: name.toLowerCase().replace(/\s+/g, "-"), productsCount: 0, status: "active", createdAt: new Date().toISOString().slice(0, 10) },
      ...prev,
    ]);
    setName("");
    setCreating(false);
  };

  const approve = (id: string) => setList(prev => prev.map(c => c.id === id ? { ...c, status: "active" } : c));
  const reject = (id: string) => setList(prev => prev.filter(c => c.id !== id));

  return (
    <AdminShell title="Kategoriyalar" subtitle="Yaratish, tahrirlash va tasdiqlash">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Kategoriyalar" value={String(total)} tone="primary" icon={<FolderTree className="h-5 w-5" />} />
        <StatCard label="Faol" value={String(active)} tone="success" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Tasdiq kutmoqda" value={String(pending)} tone="warning" icon={<Clock className="h-5 w-5" />} />
      </div>

      <PageCard
        title="Barcha kategoriyalar"
        action={
          <button
            onClick={() => setCreating(v => !v)}
            className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2 hover:bg-primary/90 shadow-soft"
          >
            <Plus className="h-4 w-4" /> Yangi
          </button>
        }
        padded={false}
      >
        {creating && (
          <div className="px-5 py-4 border-b border-border bg-accent/40 flex gap-2">
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && create()}
              placeholder="Kategoriya nomi"
              className="flex-1 h-10 px-3 rounded-md bg-card border border-border text-sm outline-none focus:border-primary"
            />
            <button onClick={create} className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold">Qo'shish</button>
            <button onClick={() => { setCreating(false); setName(""); }} className="h-10 px-3 rounded-md bg-secondary text-sm font-semibold">Bekor</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 text-left">
                {["Kategoriya", "Slug", "Mahsulotlar", "Holat", "So'rov", "Sana", "Amallar"].map(h => (
                  <th key={h} className="px-5 py-3 label-mono font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(c => (
                <tr key={c.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-5 py-3 font-semibold">{c.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">/{c.slug}</td>
                  <td className="px-5 py-3 font-mono">{c.productsCount}</td>
                  <td className="px-5 py-3">
                    <Badge tone={c.status === "active" ? "success" : "warning"} dot>
                      {c.status === "active" ? "Faol" : "Kutmoqda"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-xs">{c.requestedBy ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{c.createdAt}</td>
                  <td className="px-5 py-3">
                    {c.status === "pending" ? (
                      <div className="flex gap-1.5">
                        <button onClick={() => approve(c.id)} className="h-8 px-2.5 rounded-md bg-success-soft text-success text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-success/20">
                          <Check className="h-3.5 w-3.5" /> Tasdiqlash
                        </button>
                        <button onClick={() => reject(c.id)} className="h-8 px-2.5 rounded-md bg-destructive-soft text-destructive text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-destructive/20">
                          <X className="h-3.5 w-3.5" /> Rad
                        </button>
                      </div>
                    ) : (
                      <button className="h-8 px-2.5 rounded-md bg-secondary text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-accent">
                        <Edit2 className="h-3.5 w-3.5" /> Tahrirlash
                      </button>
                    )}
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
