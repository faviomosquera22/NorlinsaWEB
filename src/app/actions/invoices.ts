"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type InvoiceActionState = { error?: string };
const shareholderNames = ["Daniel", "Jorge", "Favio"] as const;

export async function createInvoice(_: InvoiceActionState, formData: FormData): Promise<InvoiceActionState> {
  try {
    const supabase = await getSupabaseServerClient();
    if (!supabase) return { error: "Configure Supabase antes de registrar facturas reales." };
    const { data: membership } = await supabase.from("organization_members").select("organization_id").limit(1).single();
    if (!membership) return { error: "Su usuario no pertenece a la organización NORLINSA." };
    const invoiceNumber = String(formData.get("invoice_number") ?? "").trim();
    const issueDate = String(formData.get("issue_date") ?? "");
    const totalAmount = Number(formData.get("total_amount"));
    if (!invoiceNumber || !issueDate || !Number.isFinite(totalAmount) || totalAmount <= 0) return { error: "Complete número, fecha y total de la factura." };
    const shareholderRecords = await Promise.all(shareholderNames.map(async (name) => {
      const { data, error } = await supabase.from("shareholders").upsert({ organization_id: membership.organization_id, name }, { onConflict: "organization_id,name" }).select("id,name").single();
      if (error || !data) throw new Error(`No se pudo registrar a ${name}.`);
      return data;
    }));
    const allocations = shareholderRecords.map(({ id, name }) => ({ shareholder_id: id, amount: Number(formData.get(`allocation_${name.toLowerCase()}`) || 0) }));
    if (allocations.some(({ amount }) => !Number.isFinite(amount) || amount < 0)) return { error: "Las cantidades por socio deben ser números positivos o cero." };
    const { error } = await supabase.rpc("create_invoice_with_allocations", { p_organization_id: membership.organization_id, p_invoice_number: invoiceNumber, p_issue_date: issueDate, p_total_amount: totalAmount, p_owner_shareholder_id: null, p_allocations: allocations, p_notes: String(formData.get("notes") ?? "") });
    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/facturas");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo registrar la factura." };
  }
  redirect("/facturas");
}
