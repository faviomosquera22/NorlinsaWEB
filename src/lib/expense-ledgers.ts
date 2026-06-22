import { getSupabaseServerClient } from "@/lib/supabase/server";

export type TaxExpense = { id: string; date: string; authorizationDate: string; ruc: string; supplier: string; receiptType: string; receipt: string; accessKey: string; recipient: string; subtotal: number; vat: number; total: number; shareholder: string };
export type CompanyExpense = { id: string; date: string; concept: string; type: string; beneficiary: string; income: number; expense: number; balance: number };
const demoTax: TaxExpense[] = [{ id: "tax-demo", date: "2026-05-12", authorizationDate: "2026-05-12", ruc: "0990012345001", supplier: "PETROYNG S.A.", receiptType: "Factura", receipt: "001-002-000000466", accessKey: "—", recipient: "NORLINSA", subtotal: 83.3, vat: 0, total: 83.3, shareholder: "Daniel" }];
const demoCompany: CompanyExpense[] = [{ id: "company-demo", date: "2026-05-01", concept: "Aporte de capital", type: "Ingreso", beneficiary: "NORLINSA", income: 4000, expense: 0, balance: 4000 }, { id: "company-demo-2", date: "2026-05-03", concept: "Pago operativo", type: "Egreso", beneficiary: "Proveedor", income: 0, expense: 720, balance: 3280 }];

export async function getTaxExpenses() {
  const supabase = await getSupabaseServerClient(); if (!supabase) return { isDemo: true, items: demoTax };
  const { data: membership } = await supabase.from("organization_members").select("organization_id").limit(1).maybeSingle(); if (!membership) return { isDemo: true, items: demoTax };
  const { data, error } = await supabase.from("tax_expenses").select("id,issue_date,authorization_date,supplier_ruc,supplier_name,receipt_type,receipt_number,access_key,recipient_identification,subtotal,vat,total,assigned_to").eq("organization_id", membership.organization_id).order("issue_date", { ascending: false });
  if (error) return { isDemo: true, items: demoTax };
  return { isDemo: false, items: (data ?? []).map((item) => ({ id: item.id, date: item.issue_date ?? "—", authorizationDate: item.authorization_date?.slice(0, 10) ?? "—", ruc: item.supplier_ruc ?? "—", supplier: item.supplier_name, receiptType: item.receipt_type ?? "Factura", receipt: item.receipt_number ?? "—", accessKey: item.access_key ?? "—", recipient: item.recipient_identification ?? "—", subtotal: Number(item.subtotal), vat: Number(item.vat), total: Number(item.total), shareholder: item.assigned_to ?? "Sin asignar" })) };
}

export async function getCompanyExpenses() {
  const supabase = await getSupabaseServerClient(); if (!supabase) return { isDemo: true, items: demoCompany };
  const { data: membership } = await supabase.from("organization_members").select("organization_id").limit(1).maybeSingle(); if (!membership) return { isDemo: true, items: demoCompany };
  const { data, error } = await supabase.from("company_expense_ledger").select("id,expense_date,concept,expense_type,beneficiary,income,expense,running_balance").eq("organization_id", membership.organization_id).order("expense_date", { ascending: true });
  if (error) return { isDemo: true, items: demoCompany };
  return { isDemo: false, items: (data ?? []).map((item) => ({ id: item.id, date: item.expense_date ?? "—", concept: item.concept, type: item.expense_type ?? (Number(item.income) > 0 ? "Ingreso" : "Egreso"), beneficiary: item.beneficiary ?? "—", income: Number(item.income), expense: Number(item.expense), balance: Number(item.running_balance) })) };
}
