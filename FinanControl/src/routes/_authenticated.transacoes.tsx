import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useStore, deleteTransaction, formatBRL, formatDateBR, CATEGORIES, type Transaction } from "@/lib/store";
import { NewTransactionDialog } from "@/components/NewTransactionDialog";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/transacoes")({
  head: () => ({ meta: [{ title: "Transações — FinanControl" }] }),
  component: () => <AppShell><Transacoes /></AppShell>,
});

type Filter = "todas" | "receita" | "despesa";
const CAT_BADGE: Record<string, string> = {
  Alimentação: "bg-amber-50 text-amber-700", Transporte: "bg-blue-50 text-blue-700", Lazer: "bg-purple-50 text-purple-700",
  Saúde: "bg-emerald-50 text-emerald-700", Educação: "bg-cyan-50 text-cyan-700", Salário: "bg-emerald-50 text-emerald-700",
  Trabalho: "bg-indigo-50 text-indigo-700", Moradia: "bg-pink-50 text-pink-700", Outros: "bg-slate-100 text-slate-700",
};

function Transacoes() {
  const { transactions, loading } = useStore();
  const [filter, setFilter] = useState<Filter>("todas");
  const [category, setCategory] = useState<string>("todas");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const filtered = useMemo(() => transactions.filter((t) => {
    if (filter !== "todas" && t.type !== filter) return false;
    if (category !== "todas" && t.category !== category) return false;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    return true;
  }), [transactions, filter, category, dateFrom, dateTo]);

  const clearDates = () => { setDateFrom(""); setDateTo(""); };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Transações</h1>
          <p className="text-slate-500 mt-1">Gerencie suas receitas e despesas</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 shadow-md shadow-primary/20">
          <Plus className="h-5 w-5" /> Nova Transação
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <FilterPill active={filter === "todas"} onClick={() => setFilter("todas")} color="primary">Todas</FilterPill>
            <FilterPill active={filter === "receita"} onClick={() => setFilter("receita")} color="emerald">Receitas</FilterPill>
            <FilterPill active={filter === "despesa"} onClick={() => setFilter("despesa")} color="rose">Despesas</FilterPill>
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="todas">Categoria: Todas</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-slate-100">
          <label className="flex flex-col text-xs text-slate-600">
            <span className="mb-1 font-medium">De</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
          </label>
          <label className="flex flex-col text-xs text-slate-600">
            <span className="mb-1 font-medium">Até</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
          </label>
          {(dateFrom || dateTo) && (
            <button onClick={clearDates} className="text-sm text-slate-500 hover:text-rose-600 underline-offset-2 hover:underline">
              Limpar período
            </button>
          )}
          <div className="ml-auto text-sm text-slate-500">{filtered.length} resultado(s)</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500 border-b border-slate-100">
              <tr>
                <th className="text-left font-medium py-4 px-5">Data</th>
                <th className="text-left font-medium py-4 px-5">Descrição</th>
                <th className="text-left font-medium py-4 px-5">Categoria</th>
                <th className="text-left font-medium py-4 px-5">Tipo</th>
                <th className="text-left font-medium py-4 px-5">Valor</th>
                <th className="text-left font-medium py-4 px-5">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-slate-400">{loading ? "Carregando..." : "Nenhuma transação encontrada"}</td></tr>}
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-4 px-5 text-slate-700">{formatDateBR(t.date)}</td>
                  <td className="py-4 px-5 text-slate-900">{t.description}</td>
                  <td className="py-4 px-5"><span className={`px-3 py-1 rounded-md text-xs font-medium ${CAT_BADGE[t.category] ?? "bg-slate-100 text-slate-700"}`}>{t.category}</span></td>
                  <td className="py-4 px-5">{t.type === "receita" ? <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">Receita</span> : <span className="px-3 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-medium">Despesa</span>}</td>
                  <td className={`py-4 px-5 font-semibold ${t.type === "receita" ? "text-emerald-600" : "text-rose-600"}`}>{t.type === "receita" ? "+" : "-"}{formatBRL(t.amount)}</td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => { setEditing(t); setOpen(true); }} className="text-primary hover:text-primary/80"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => { if (confirm("Excluir esta transação?")) deleteTransaction(t.id); }} className="text-rose-600 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NewTransactionDialog open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function FilterPill({ children, active, onClick, color }: { children: React.ReactNode; active: boolean; onClick: () => void; color: "primary" | "emerald" | "rose" }) {
  const map = {
    primary: active ? "border-primary text-primary bg-primary/5" : "border-primary/40 text-primary",
    emerald: active ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-emerald-400 text-emerald-600",
    rose: active ? "border-rose-500 text-rose-600 bg-rose-50" : "border-rose-400 text-rose-600",
  } as const;
  return <button onClick={onClick} className={`px-4 py-1.5 rounded-lg border-2 text-sm font-medium ${map[color]}`}>{children}</button>;
}
