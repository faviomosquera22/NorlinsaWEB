"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type LogisticsActionState = { error?: string };

export async function createLogisticsService(_: LogisticsActionState, formData: FormData): Promise<LogisticsActionState> {
  try {
    const supabase = await getSupabaseServerClient();
    if (!supabase) return { error: "Configure Supabase antes de registrar servicios reales." };
    const { data: membership } = await supabase.from("organization_members").select("organization_id").limit(1).single();
    if (!membership) return { error: "Su usuario no pertenece a la organización NORLINSA." };
    const shareholderName = String(formData.get("shareholder") ?? "").trim();
    const serviceDate = String(formData.get("service_date") ?? "");
    const description = String(formData.get("description") ?? "").trim();
    const providerName = String(formData.get("provider_name") ?? "").trim();
    const originalCost = Number(formData.get("original_cost"));
    const rate = Number(formData.get("profitability_rate"));
    if (!shareholderName || !serviceDate || !description || !providerName || !Number.isFinite(originalCost) || originalCost < 0 || !Number.isFinite(rate) || rate < 0 || rate > 1) return { error: "Complete fecha, servicio, proveedor, accionista, costo y porcentaje." };
    const { data: shareholder, error: shareholderError } = await supabase.from("shareholders").upsert({ organization_id: membership.organization_id, name: shareholderName }, { onConflict: "organization_id,name" }).select("id").single();
    if (shareholderError || !shareholder) return { error: "No se pudo resolver el accionista." };
    const { error } = await supabase.from("logistics_services").insert({ organization_id: membership.organization_id, service_date: serviceDate, service_number: String(formData.get("service_number") ?? "").trim() || null, description, provider_name: providerName, shareholder_id: shareholder.id, invoice_number: String(formData.get("invoice_number") ?? "").trim() || null, original_cost: originalCost, profitability_rate: rate, advance: Number(formData.get("advance") || 0), transfer_fee: Number(formData.get("transfer_fee") || 0), status: String(formData.get("status") ?? "Pendiente"), notes: String(formData.get("notes") ?? "").trim() || null });
    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/logistica");
    revalidatePath("/saldos");
  } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo registrar el servicio logístico." }; }
  redirect("/logistica");
}
