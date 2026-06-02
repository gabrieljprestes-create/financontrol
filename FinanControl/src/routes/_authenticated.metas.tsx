import { createFileRoute } from "@tanstack/react-router";
import { Plus, Shield, Plane, Laptop, BookOpen, Target, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useStore, addGoal, updateGoal, deleteGoal, formatBRL, type Goal } from "@/lib/store";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({ meta: [{ title: "Metas — FinanControl" }] }),
  component: () => <AppShell><Metas /></AppShell>,
});

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = { shield: Shield, plane: Plane, laptop: Laptop, book: BookOpen, target: Target };
const ICON_OPTIONS = [
  { key: "shield", label: "Reserva" }, { key: "plane", label: "Viagem" },
  { key: "laptop", label: "Tecnologia" }, { key: "book", label: "Estudos" }, { key: "target", label: "Geral" },
];

function Metas() {
  const { goals, loading } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Metas Financeiras</h1>
          <p className="text-slate-500 mt-1">Defina e acompanhe seus objetivos</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 shadow-md shadow-primary/20">
          <Plus className="h-5 w-5" /> Nova Meta
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {goals.map((g) => {
          const Icon = ICONS[g.icon] ?? Target;
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          return (
            <div key={g.id} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center"><Icon className="h-6 w-6 text-white" /></div>
                  <h3 className="text-xl font-semibold text-slate-900">{g.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(g); setOpen(true); }} className="text-slate-400 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => { if (confirm("Excluir esta meta?")) deleteGoal(g.id); }} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="space-y-1 mb-2">
                <div className="text-sm text-slate-500">Meta</div>
                <div className="text-2xl font-bold text-slate-900">{formatBRL(g.target)}</div>
              </div>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-sm text-slate-500">Atual</div>
                  <div className="text-xl font-bold text-primary">{formatBRL(g.current)}</div>
                </div>
                <div className="text-4xl font-bold text-primary">{pct}%</div>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        {goals.length === 0 && <div className="md:col-span-2 text-center py-16 text-slate-400">{loading ? "Carregando..." : "Nenhuma meta cadastrada. Clique em 'Nova Meta' para começar."}</div>}
      </div>

      <GoalDialog open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}

function GoalDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: Goal | null }) {
  if (!open) return null;
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = { name: String(fd.get("name") ?? ""), target: Number(fd.get("target") ?? 0), current: Number(fd.get("current") ?? 0), icon: String(fd.get("icon") ?? "target") };
    if (!data.name || data.target <= 0) return;
    if (editing) await updateGoal(editing.id, data); else await addGoal(data);
    onOpenChange(false);
  };
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-slate-900 mb-5">{editing ? "Editar Meta" : "Nova Meta"}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Nome"><input name="name" defaultValue={editing?.name ?? ""} required className="input" placeholder="Ex: Viagem para Europa" /></Field>
          <Field label="Valor da meta (R$)"><input name="target" type="number" step="0.01" min="0" defaultValue={editing?.target ?? ""} required className="input" /></Field>
          <Field label="Valor atual (R$)"><input name="current" type="number" step="0.01" min="0" defaultValue={editing?.current ?? 0} className="input" /></Field>
          <Field label="Ícone"><select name="icon" defaultValue={editing?.icon ?? "target"} className="input">{ICON_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}</select></Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-sm font-medium text-slate-700">{label}</span><div className="mt-1">{children}</div></label>;
}
