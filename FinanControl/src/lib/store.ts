import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type TransactionType = "receita" | "despesa";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  paymentMethod: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  icon: string;
}

export const CATEGORIES = [
  "Alimentação", "Transporte", "Lazer", "Saúde", "Educação",
  "Salário", "Trabalho", "Moradia", "Outros",
] as const;

export const PAYMENT_METHODS = [
  "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "PIX", "Conta Corrente", "Débito",
] as const;

// ---- Mapping helpers ----
type TxRow = {
  id: string; date: string; description: string; category: string;
  type: string; amount: number | string; payment_method: string;
};
type GoalRow = {
  id: string; name: string; target: number | string; current: number | string; icon: string;
};

const mapTx = (r: TxRow): Transaction => ({
  id: r.id, date: r.date, description: r.description, category: r.category,
  type: r.type as TransactionType, amount: Number(r.amount), paymentMethod: r.payment_method,
});
const mapGoal = (r: GoalRow): Goal => ({
  id: r.id, name: r.name, target: Number(r.target), current: Number(r.current), icon: r.icon,
});

// ---- Shared in-memory cache + listeners ----
interface State {
  transactions: Transaction[];
  goals: Goal[];
  loading: boolean;
}
let state: State = { transactions: [], goals: [], loading: true };
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const setState = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  notify();
};

let loaded = false;
let loadingPromise: Promise<void> | null = null;

async function loadAll() {
  if (loadingPromise) return loadingPromise;
  loadingPromise = (async () => {
    const [{ data: tx }, { data: gs }] = await Promise.all([
      supabase.from("transactions").select("*").order("date", { ascending: false }),
      supabase.from("goals").select("*").order("created_at", { ascending: true }),
    ]);
    setState({
      transactions: (tx ?? []).map(mapTx),
      goals: (gs ?? []).map(mapGoal),
      loading: false,
    });
    loaded = true;
  })();
  return loadingPromise;
}

export function resetStore() {
  loaded = false;
  loadingPromise = null;
  state = { transactions: [], goals: [], loading: true };
  notify();
}

export function useStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const l = () => setTick((t) => t + 1);
    listeners.add(l);
    if (!loaded) loadAll();
    return () => { listeners.delete(l); };
  }, []);
  return state;
}

// ---- Mutations ----
async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not authenticated");
  return data.user.id;
}

export async function addTransaction(t: Omit<Transaction, "id">) {
  const user_id = await currentUserId();
  const { data, error } = await supabase.from("transactions").insert({
    user_id, date: t.date, description: t.description, category: t.category,
    type: t.type, amount: t.amount, payment_method: t.paymentMethod,
  }).select().single();
  if (error) throw error;
  setState({ transactions: [mapTx(data as TxRow), ...state.transactions] });
}

export async function updateTransaction(id: string, patch: Partial<Transaction>) {
  const dbPatch: Record<string, unknown> = {};
  if (patch.date !== undefined) dbPatch.date = patch.date;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.category !== undefined) dbPatch.category = patch.category;
  if (patch.type !== undefined) dbPatch.type = patch.type;
  if (patch.amount !== undefined) dbPatch.amount = patch.amount;
  if (patch.paymentMethod !== undefined) dbPatch.payment_method = patch.paymentMethod;
  const { data, error } = await supabase.from("transactions").update(dbPatch as never).eq("id", id).select().single();
  if (error) throw error;
  setState({ transactions: state.transactions.map((t) => (t.id === id ? mapTx(data as TxRow) : t)) });
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
  setState({ transactions: state.transactions.filter((t) => t.id !== id) });
}

export async function addGoal(g: Omit<Goal, "id">) {
  const user_id = await currentUserId();
  const { data, error } = await supabase.from("goals").insert({
    user_id, name: g.name, target: g.target, current: g.current, icon: g.icon,
  }).select().single();
  if (error) throw error;
  setState({ goals: [...state.goals, mapGoal(data as GoalRow)] });
}

export async function updateGoal(id: string, patch: Partial<Goal>) {
  const { data, error } = await supabase.from("goals").update(patch).eq("id", id).select().single();
  if (error) throw error;
  setState({ goals: state.goals.map((g) => (g.id === id ? mapGoal(data as GoalRow) : g)) });
}

export async function deleteGoal(id: string) {
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
  setState({ goals: state.goals.filter((g) => g.id !== id) });
}

// ---- Formatters ----
export function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export function formatDateBR(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// Re-export reload for convenience
export function useReload() {
  return useCallback(() => { resetStore(); loadAll(); }, []);
}
