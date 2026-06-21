"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type BalanceActionState = { error?: string };
const types = { opening_balance: { direction: "credit", label: "Saldo inicial" }, adjustment_credit: { direction: "credit", label: "Ajuste a favor" }, adjustment_debit: { direction: "debit", label: "Ajuste en contra" }, withdrawal: { direction: "debit", label: "Retiro" } } as const;

export async function createBalanceEntry(_: BalanceActionState, formData: FormData): Promise<BalanceActionState> {
  try {
    const supabase = await getSupabaseServerClient();
    if (!supabase) return { error: "Configure Supabase antes de registrar saldos reales." };
    const { data: membership } = await supabase.from("organization_members").select("organization_id").limit(1).single();
    if (!membership) return { error: "Su usuario no pertenece a la organización NORLINSA." };
    const shareholderName = String(formData.get("shareholder") ?? "");
    const entryType = String(formData.get("entry_type") ?? "") as keyof typeof types;
    const amount = Number(formData.get("amount"));
    const movementDate = String(formData.get("movement_date") ?? "");
    const description = String(formData.get("description") ?? "").trim();
    if (!shareholderName || !types[entryType] || !movementDate || !Number.isFinite(amount) || amount <= 0) return { error: "Complete socio, fecha, tipo y valor mayor a cero." };
    if (entryType === "withdrawal" && !description) return { error: "Indique el motivo del retiro." };
    const { data: shareholder, error: shareholderError } = await supabase.from("shareholders").upsert({ organization_id: membership.organization_id, name: shareholderName }, { onConflict: "organization_id,name" }).select("id").single();
    if (shareholderError || !shareholder) return { error: "No se pudo registrar el socio." };
    const { error } = await supabase.from("shareholder_balance_entries").insert({ organization_id: membership.organization_id, shareholder_id: shareholder.id, movement_date: movementDate, entry_type: entryType, direction: types[entryType].direction, amount, description: description || null });
    if (error) return { error: error.message };
    revalidatePath("/saldos");
    revalidatePath("/");
  } catch (error) { return { error: error instanceof Error ? error.message : "No se pudo guardar el movimiento." }; }
  redirect("/saldos");
}
