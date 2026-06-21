import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ShareholderBalance = { shareholder: string; availableBalance: number; paidGuides: number; withdrawals: number };
export type BalanceEntry = { id: string; date: string; shareholder: string; type: string; direction: "credit" | "debit"; amount: number; description: string | null };
export type BalanceSnapshot = { isDemo: boolean; balances: ShareholderBalance[]; entries: BalanceEntry[] };

const demoBalances: BalanceSnapshot = {
  isDemo: true,
  balances: [{ shareholder: "Daniel", availableBalance: 3660, paidGuides: 340, withdrawals: 0 }, { shareholder: "Jorge", availableBalance: 8040, paidGuides: 1560, withdrawals: 400 }, { shareholder: "Favio", availableBalance: 2500, paidGuides: 0, withdrawals: 0 }],
  entries: [{ id: "demo-1", date: "2026-05-12", shareholder: "Jorge", type: "Pago de guía", direction: "debit", amount: 1219.5, description: "Pago de guía 659" }, { id: "demo-2", date: "2026-05-10", shareholder: "Jorge", type: "Retiro", direction: "debit", amount: 400, description: "Retiro personal" }, { id: "demo-3", date: "2026-05-01", shareholder: "Daniel", type: "Saldo inicial", direction: "credit", amount: 4000, description: "Saldo disponible inicial" }],
};

type BalanceRow = { shareholder_name: string; available_balance: number; paid_guides: number; withdrawals: number };
type EntryRow = { id: string; movement_date: string; entry_type: string; direction: "credit" | "debit"; amount: number; description: string | null; shareholders: { name: string } | null };
const labels: Record<string, string> = { opening_balance: "Saldo inicial", adjustment_credit: "Ajuste a favor", adjustment_debit: "Ajuste en contra", withdrawal: "Retiro", guide_payment: "Pago de guía" };

export async function getBalanceSnapshot(): Promise<BalanceSnapshot> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return demoBalances;
  const { data: membership } = await supabase.from("organization_members").select("organization_id").limit(1).maybeSingle();
  if (!membership) return demoBalances;
  const [balancesResult, entriesResult] = await Promise.all([
    supabase.from("shareholder_available_balances").select("shareholder_name,available_balance,paid_guides,withdrawals").eq("organization_id", membership.organization_id).order("shareholder_name"),
    supabase.from("shareholder_balance_entries").select("id,movement_date,entry_type,direction,amount,description,shareholders(name)").eq("organization_id", membership.organization_id).order("movement_date", { ascending: false }).limit(30),
  ]);
  if (balancesResult.error || entriesResult.error) return demoBalances;
  return {
    isDemo: false,
    balances: ((balancesResult.data ?? []) as BalanceRow[]).map((row) => ({ shareholder: row.shareholder_name, availableBalance: Number(row.available_balance), paidGuides: Number(row.paid_guides), withdrawals: Number(row.withdrawals) })),
    entries: ((entriesResult.data ?? []) as unknown as EntryRow[]).map((row) => ({ id: row.id, date: row.movement_date, shareholder: row.shareholders?.name ?? "Sin socio", type: labels[row.entry_type] ?? row.entry_type, direction: row.direction, amount: Number(row.amount), description: row.description })),
  };
}
