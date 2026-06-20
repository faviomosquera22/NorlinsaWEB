"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const required = (formData: FormData, key: string) => {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new Error(`Falta el campo ${key}.`);
  return value;
};

export type GuideActionState = { error?: string };

export async function createGuide(_: GuideActionState, formData: FormData): Promise<GuideActionState> {
  try {
    const supabase = await getSupabaseServerClient();
    if (!supabase) return { error: "Configure Supabase antes de registrar movimientos reales." };
    const { data: membership } = await supabase.from("organization_members").select("organization_id").limit(1).single();
    if (!membership) return { error: "Su usuario no pertenece a la organización NORLINSA." };

    const driverName = required(formData, "driver");
    const shareholderName = required(formData, "shareholder");
    const [{ data: driver, error: driverError }, { data: shareholder, error: shareholderError }] = await Promise.all([
      supabase.from("drivers").upsert({ organization_id: membership.organization_id, name: driverName }, { onConflict: "organization_id,name" }).select("id").single(),
      supabase.from("shareholders").upsert({ organization_id: membership.organization_id, name: shareholderName }, { onConflict: "organization_id,name" }).select("id").single(),
    ]);
    if (driverError || shareholderError || !driver || !shareholder) return { error: "No se pudo resolver el chofer o accionista." };

    const { error } = await supabase.from("guides").insert({
      organization_id: membership.organization_id,
      purchase_date: required(formData, "purchase_date"),
      guide_number: String(formData.get("guide_number") ?? "").trim() || null,
      vehicle_identifier: String(formData.get("vehicle") ?? "").trim() || null,
      driver_id: driver.id,
      shareholder_id: shareholder.id,
      invoice_number: String(formData.get("invoice_number") ?? "").trim() || null,
      original_cost: Number(required(formData, "original_cost")),
      profitability_rate: Number(required(formData, "profitability_rate")),
      advance: Number(formData.get("advance") || 0),
      transfer_fee: Number(formData.get("transfer_fee") || 0),
      status: required(formData, "status"),
    });
    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/guias");
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo registrar la guía." };
  }
  redirect("/guias");
}
