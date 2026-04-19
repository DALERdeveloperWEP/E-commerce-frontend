import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageCard } from "@/components/admin/PageCard";
import { StatCard } from "@/components/admin/StatCard";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Package, ShoppingCart, FolderTree, Activity } from "lucide-react";
import { revenueByMonth, categoryShare, products, orders } from "@/data/mock";

export const Route = createFileRoute("/admin/statistics")({
  head: () => ({ meta: [{ title: "Statistika — BozorAdmin" }] }),
  component: StatsPage,
});

const colors = ["#FF6633", "#70C05B", "#1CB9FC", "#FCA21C", "#A855F7", "#F472B6"];

function StatsPage() {
  const productData = products.slice(0, 8).map(p => ({ name: p.title.slice(0, 14), sold: p.sold }));
  const orderTrend = revenueByMonth.map(m => ({ month: m.month, orders: m.orders }));

  return (
    <AdminShell title="Statistika" subtitle="Mahsulot, buyurtma va kategoriya tahlili">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Jami mahsulot" value={String(products.length)} delta={4.2} tone="primary" icon={<Package className="h-5 w-5" />} />
        <StatCard label="Jami buyurtma" value={String(orders.length)} delta={12.8} tone="info" icon={<ShoppingCart className="h-5 w-5" />} />
        <StatCard label="Faol kategoriya" value={String(categoryShare.length)} delta={0} tone="success" icon={<FolderTree className="h-5 w-5" />} />
        <StatCard label="Konversiya" value="3.42%" delta={0.4} tone="warning" icon={<Activity className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <PageCard title="Mahsulot sotuvi · top 8">
          <div className="h-[320px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="sold" fill="#FF6633" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PageCard>

        <PageCard title="Buyurtma trendi">
          <div className="h-[320px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={orderTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} stroke="currentColor" opacity={0.5} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="orders" stroke="#1CB9FC" strokeWidth={3} dot={{ r: 4, fill: "#1CB9FC" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </PageCard>
      </div>

      <PageCard title="Kategoriya bo'yicha taqsimot">
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryShare} dataKey="value" nameKey="name" outerRadius={130} label={(e) => String(e.name ?? "")}>
                {categoryShare.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </PageCard>
    </AdminShell>
  );
}
