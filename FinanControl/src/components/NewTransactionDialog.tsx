import { addTransaction, updateTransaction, CATEGORIES, PAYMENT_METHODS, type Transaction } from "@/lib/store";

export function NewTransactionDialog({
  open, onOpenChange, editing,
}: { open: boolean; onOpenChange: (v: boolean) => void; editing?: Transaction | null }) {
  if (!open) return null;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      date: String(fd.get("date") ?? new Date().toISOString().slice(0, 10)),
      description: String(fd.get("description") ?? ""),
      category: String(fd.get("category") ?? "Outros"),
      type: (String(fd.get("type") ?? "despesa")) as "receita" | "despesa",
      amount: Math.abs(Number(fd.get("amount") ?? 0)),
      paymentMethod: String(fd.get("paymentMethod") ?? "Dinheiro"),
    };
    if (!data.description || data.amount <= 0) return;
    if (editing) await updateTransaction(editing.id, data);
    else await addTransaction(data);
    onOpenChange(false);
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-slate-900 mb-5">{editing ? "Editar Transação" : "Nova Transação"}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Tipo">
            <select name="type" defaultValue={editing?.type ?? "despesa"} className="input">
              <option value="despesa">Despesa</option>
              <option value="receita">Receita</option>
            </select>
          </Field>
          <Field label="Descrição">
            <input name="description" defaultValue={editing?.description ?? ""} required className="input" placeholder="Ex: Supermercado" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)">
              <input name="amount" type="number" step="0.01" min="0" defaultValue={editing?.amount ?? ""} required className="input" />
            </Field>
            <Field label="Data">
              <input name="date" type="date" defaultValue={editing?.date ?? today} required className="input" />
            </Field>
          </div>
          <Field label="Categoria">
            <select name="category" defaultValue={editing?.category ?? "Alimentação"} className="input">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Método de Pagamento">
            <select name="paymentMethod" defaultValue={editing?.paymentMethod ?? "Dinheiro"} className="input">
              {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
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
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
