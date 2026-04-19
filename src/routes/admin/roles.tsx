import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageCard } from "@/components/admin/PageCard";
import { Badge } from "@/components/admin/Badge";
import { ShieldCheck, Save } from "lucide-react";
import { people, type Role } from "@/data/mock";

export const Route = createFileRoute("/admin/roles")({
  head: () => ({ meta: [{ title: "Roles & Payments — BozorAdmin" }] }),
  component: RolesPage,
});

function RolesPage() {
  const [list, setList] = useState(people.filter(p => p.role !== "admin"));
  const [dirty, setDirty] = useState<Record<string, Role>>({});

  const setRole = (id: string, role: Role) => {
    if (role === "admin") return; // bu sahifada admin qilib bo'lmaydi
    setDirty(d => ({ ...d, [id]: role }));
  };

  const save = () => {
    setList(prev => prev.map(p => dirty[p.id] ? { ...p, role: dirty[p.id] } : p));
    setDirty({});
  };

  const dirtyCount = Object.keys(dirty).length;

  return (
    <AdminShell title="Roles & Payments" subtitle="Foydalanuvchi va sotuvchi rolllarini boshqarish">
      <PageCard
        title="Role boshqaruvi"
        action={
          <div className="flex items-center gap-3">
            <Badge tone="info"><ShieldCheck className="h-3 w-3" /> Faqat user/seller</Badge>
            <button
              onClick={save}
              disabled={dirtyCount === 0}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-soft"
            >
              <Save className="h-4 w-4" />
              Saqlash {dirtyCount > 0 && `(${dirtyCount})`}
            </button>
          </div>
        }
        padded={false}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 text-left">
                {["Foydalanuvchi", "Hozirgi role", "Yangi role", "Holat"].map(h => (
                  <th key={h} className="px-5 py-3 label-mono font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(p => {
                const current = dirty[p.id] ?? p.role;
                const changed = dirty[p.id] && dirty[p.id] !== p.role;
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.avatar} className="h-9 w-9 rounded-full bg-secondary" alt={p.name} />
                        <div>
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={p.role === "seller" ? "info" : "muted"}>{p.role}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="inline-flex p-1 rounded-md bg-input border border-border">
                        {(["user", "seller"] as Role[]).map(r => (
                          <button
                            key={r}
                            onClick={() => setRole(p.id, r)}
                            className={`px-3 py-1 text-xs font-semibold rounded transition-colors capitalize ${
                              current === r
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {changed
                        ? <Badge tone="warning" dot>O'zgardi</Badge>
                        : <Badge tone="muted">Saqlangan</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PageCard>
    </AdminShell>
  );
}
