import { getSupabaseServerClient } from "@/lib/supabase/server";

export type InvoiceAllocation = { shareholder: string; allocatedAmount: number; guideProfitability: number };
export type InvoiceRow = { id: string; number: string; date: string; totalAmount: number; allocations: InvoiceAllocation[] };
export type InvoiceSnapshot = { isDemo: boolean; invoices: InvoiceRow[] };

const demoInvoices: InvoiceSnapshot = { isDemo: true, invoices: [{ id: "demo-160", number: "FACTURA #160", date: "2026-05-12", totalAmount: 5030, allocations: [{ shareholder: "Jorge", allocatedAmount: 3920, guideProfitability: 340.7 }, { shareholder: "Daniel", allocatedAmount: 1110, guideProfitability: 88.8 }, { shareholder: "Favio", allocatedAmount: 0, guideProfitability: 0 }] }] };
type SummaryRow = { invoice_id: string; invoice_number: string; issue_date: string; total_amount: number; shareholder_name: string; allocated_amount: number; guide_profitability: number };

export async function getInvoiceSnapshot(): Promise<InvoiceSnapshot> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return demoInvoices;
  const { data: membership } = await supabase.from("organization_members").select("organization_id").limit(1).maybeSingle();
  if (!membership) return demoInvoices;
  const { data, error } = await supabase.from("invoice_shareholder_profit_summary").select("invoice_id,invoice_number,issue_date,total_amount,shareholder_name,allocated_amount,guide_profitability").eq("organization_id", membership.organization_id).order("issue_date", { ascending: false });
  if (error) return demoInvoices;
  const grouped = new Map<string, InvoiceRow>();
  for (const row of (data ?? []) as SummaryRow[]) {
    const existing = grouped.get(row.invoice_id) ?? { id: row.invoice_id, number: row.invoice_number, date: row.issue_date, totalAmount: Number(row.total_amount), allocations: [] };
    existing.allocations.push({ shareholder: row.shareholder_name, allocatedAmount: Number(row.allocated_amount), guideProfitability: Number(row.guide_profitability) });
    grouped.set(row.invoice_id, existing);
  }
  return { isDemo: false, invoices: [...grouped.values()] };
}
