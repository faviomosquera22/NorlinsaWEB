import { demoSnapshot, type DashboardSnapshot, type GuideRow } from "@/lib/accounting";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type MonthlyRow = { month_start: string; billed: number | null; profitability: number | null; tax_expenses: number | null };
type DatabaseGuide = { id: string; purchase_date: string; vehicle_identifier: string | null; invoice_number: string | null; original_cost: number; profitability: number; driver_payment: number; status: GuideRow["status"]; drivers: { name: string } | null; shareholders: { name: string } | null };

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return demoSnapshot;

  const { data: membership } = await supabase.from("organization_members").select("organization_id").limit(1).maybeSingle();
  if (!membership) return demoSnapshot;

  const [monthlyResult, guidesResult] = await Promise.all([
    supabase.from("monthly_financial_summary").select("month_start,billed,profitability,tax_expenses").eq("organization_id", membership.organization_id).order("month_start", { ascending: false }).limit(12),
    supabase.from("guides").select("id,purchase_date,vehicle_identifier,invoice_number,original_cost,profitability,driver_payment,status,drivers(name),shareholders(name)").eq("organization_id", membership.organization_id).order("purchase_date", { ascending: false }).limit(8),
  ]);
  if (monthlyResult.error || guidesResult.error) return demoSnapshot;

  const monthly = ((monthlyResult.data ?? []) as MonthlyRow[]).reverse().map((row) => ({
    month: new Intl.DateTimeFormat("es-EC", { month: "short" }).format(new Date(`${row.month_start}T12:00:00`)).replace(".", ""),
    billed: Number(row.billed ?? 0), profitability: Number(row.profitability ?? 0), expenses: Number(row.tax_expenses ?? 0),
  }));
  const guides = ((guidesResult.data ?? []) as unknown as DatabaseGuide[]).map((row) => ({
    id: row.id, date: row.purchase_date, driver: row.drivers?.name ?? "Sin asignar", vehicle: row.vehicle_identifier ?? "—", shareholder: row.shareholders?.name ?? "—", invoice: row.invoice_number ?? "Pendiente", originalCost: Number(row.original_cost), profitability: Number(row.profitability), payment: Number(row.driver_payment), status: row.status,
  }));
  const totals = monthly.reduce((acc, row) => ({ billed: acc.billed + row.billed, profitability: acc.profitability + row.profitability, driverPayments: acc.driverPayments, taxExpenses: acc.taxExpenses + row.expenses }), { billed: 0, profitability: 0, driverPayments: guides.reduce((sum, row) => sum + row.payment, 0), taxExpenses: 0 });

  return { isDemo: false, totals, monthly, guides };
}
