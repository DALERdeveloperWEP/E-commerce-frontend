import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, ShieldCheck, BarChart3,
  FolderTree, Package, ShoppingCart, Sparkles,
} from "lucide-react";

const groups = [
  {
    label: "Asosiy",
    items: [
      { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/admin/users", icon: Users, label: "Users & Sellers" },
      { to: "/admin/roles", icon: ShieldCheck, label: "Role & Payments" },
    ],
  },
  {
    label: "Savdo",
    items: [
      { to: "/admin/statistics", icon: BarChart3, label: "Statistika" },
      { to: "/admin/categories", icon: FolderTree, label: "Kategoriyalar" },
      { to: "/admin/products", icon: Package, label: "Products" },
      { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    ],
  },
] as const;

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pathname } = useLocation();

  return (
    <>
      {/* mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-[260px] shrink-0",
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
          "flex flex-col transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-base tracking-tight">Bozor<span className="text-primary">Admin</span></div>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-sidebar-muted">v1.0 · console</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {groups.map(group => (
            <div key={group.label}>
              <div className="label-mono px-3 mb-2">{group.label}</div>
              <ul className="space-y-0.5">
                {group.items.map(item => {
                  const active = pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={onClose}
                        className={[
                          "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                        ].join(" ")}
                      >
                        <Icon className={`h-[18px] w-[18px] ${active ? "text-primary" : ""}`} />
                        <span>{item.label}</span>
                        {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer card */}
        <div className="p-3">
          <div className="surface-card p-3 bg-accent/40">
            <div className="label-mono mb-1">Admin sessiya</div>
            <div className="text-sm font-medium">Aziz Karimov</div>
            <div className="text-xs text-muted-foreground">Super Admin · Online</div>
          </div>
        </div>
      </aside>
    </>
  );
}
