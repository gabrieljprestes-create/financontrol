import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, TrendingDown, ShoppingCart, Briefcase, Car, Utensils, Laptop, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useStore, formatBRL, formatDateBR } from "@/lib/store";
import { NewTransactionDialog } from "@/components/NewTransactionDialog";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — FinanControl" }] }),
  component: () => <AppShell><Dashboard /></AppShell>,
});

const CATEGORY_COLORS: Record<string, string> = {
  Alimentação: "#3b82f6", Transporte: "#10b981", Lazer: "#f59e0b",
  Saúde: "#8b5cf6", Educação: "#06b6d4", Moradia: "#ec4899", Outros: "#64748b",
};
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Alimentação: ShoppingCart, Salário: Briefcase, Transporte: Car, Lazer: Utensils, Trabalho: Laptop,
};

function Dashboard() {
  const { transactions, loading } = useStore();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const displayName = user?.email?.split("@")[0] ?? "usuário";

  const totals = useMemo(() => {
    let receitas = 0, despesas = 0;
    transactions.forEach((t) => { if (t.type === "receita") receitas += t.amount; else despesas += t.amount; });
    return { receitas, despesas, saldo: receitas - despesas };
  }, [transactions]);

  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter((t) => t.type === "despesa").forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
    return Array.from(map.entries()).map(([name, value]) => ({ name, value, percent: total ? Math.round((value / total) * 100) : 0 }));
  }, [transactions]);

  const barData = useMemo(() => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const now = new Date();
    const buckets: { name: string; Receitas: number; Despesas: number; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ name: months[d.getMonth()], Receitas: 0, Despesas: 0, key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` });
    }
    transactions.forEach((t) => {
      const key = t.date.slice(0, 7);
      const b = buckets.find((x) => x.key === key);
      if (b) { if (t.type === "receita") b.Receitas += t.amount; else b.Despesas += t.amount; }
    });
    return buckets;
  }, [transactions]);

  const recent = transactions.slice(0, 5);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Bem-vindo, {displayName}!</h1>
          <p className="text-slate-500 mt-1">Gerencie suas finanças pessoais com elegância</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 shadow-md shadow-primary/20">
          <Plus className="h-5 w-5" /> Nova Transação
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-6">
        <StatCard accent="border-l-primary" iconBg="bg-primary/10" icon={<Wallet className="h-6 w-6 text-primary" />} label="Saldo Total" value={formatBRL(totals.saldo)} valueClass="text-primary" />
        <StatCard accent="border-l-emerald-500" iconBg="bg-emerald-50" icon={<TrendingUp className="h-6 w-6 text-emerald-600" />} label="Receitas" value={formatBRL(totals.receitas)} valueClass="text-emerald-600" />
        <StatCard accent="border-l-rose-500" iconBg="bg-rose-50" icon={<TrendingDown className="h-6 w-6 text-rose-600" />} label="Despesas" value={formatBRL(totals.despesas)} valueClass="text-rose-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Despesas por Categoria</h3>
          <div className="h-72">
            {pieData.length === 0 ? (
              <Empty label={loading ? "Carregando..." : "Sem despesas ainda"} />
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label={(p: { percent?: number }) => `${p.percent ?? 0}%`} labelLine={false}>
                    {pieData.map((d) => <Cell key={d.name} fill={CATEGORY_COLORS[d.name] ?? "#64748b"} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatBRL(Number(v))} />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Receitas vs Despesas</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => Number(v).toLocaleString("pt-BR")} />
                <Tooltip formatter={(v) => formatBRL(Number(v))} />
                <Legend iconType="circle" />
                <Bar dataKey="Receitas" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Despesas" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Transações Recentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500 border-b border-slate-100">
              <tr>
                <th className="text-left font-medium py-3 px-2">Data</th>
                <th className="text-left font-medium py-3 px-2">Descrição</th>
                <th className="text-left font-medium py-3 px-2">Categoria</th>
                <th className="text-left font-medium py-3 px-2">Tipo</th>
                <th className="text-left font-medium py-3 px-2">Valor</th>
                <th className="text-left font-medium py-3 px-2">Método</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">
                  {loading ? "Carregando..." : "Nenhuma transação cadastrada. Clique em 'Nova Transação' para começar."}
                </td></tr>
              )}
              {recent.map((t) => {
                const Icon = CATEGORY_ICONS[t.category];
                return (
                  <tr key={t.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 px-2 text-slate-700">{formatDateBR(t.date)}</td>
                    <td className="py-3 px-2 text-slate-900">{t.description}</td>
                    <td className="py-3 px-2"><span className="inline-flex items-center gap-1.5 text-slate-700">{Icon && <Icon className="h-4 w-4 text-slate-500" />} {t.category}</span></td>
                    <td className="py-3 px-2">{t.type === "receita" ? <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">Receita</span> : <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-medium">Despesa</span>}</td>
                    <td className={`py-3 px-2 font-semibold ${t.type === "receita" ? "text-emerald-600" : "text-rose-600"}`}>{t.type === "receita" ? "" : "-"}{formatBRL(t.amount)}</td>
                    <td className="py-3 px-2 text-slate-600">{t.paymentMethod}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <NewTransactionDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="h-full flex items-center justify-center text-slate-400 text-sm">{label}</div>;
}

function StatCard({ accent, iconBg, icon, label, value, valueClass }: { accent: string; iconBg: string; icon: React.ReactNode; label: string; value: string; valueClass: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${accent} p-5 flex items-center gap-4`}>
      <div className={`h-14 w-14 rounded-xl ${iconBg} flex items-center justify-center`}>{icon}</div>
      <div>
        <div className="text-slate-500 text-sm">{label}</div>
        <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
      </div>
    </div>
  );
}
