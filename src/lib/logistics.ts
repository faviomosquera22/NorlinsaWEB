import { getSupabaseServerClient } from "@/lib/supabase/server";

export type LogisticsRow = { id: string; date: string; number: string; description: string; provider: string; shareholder: string; cost: number; providerPayment: number; status: string };
const demoLogistics: LogisticsRow[] = [{ id: "demo-logistics-1", date: "2026-06-22", number: "SL-001", description: "Servicio de transporte", provider: "Proveedor logístico", shareholder: "Jorge", cost: 800, providerPayment: 720, status: "Pendiente" }];
type DatabaseService = { id: string; service_date: string; service_number: string | null; description: string; provider_name: string; original_cost: number; provider_payment: number; status: string; shareholders: { name: string } | null };

export async function getLogisticsServices() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { isDemo: true, services: demoLogistics };
  const { data: membership } = await supabase.from("organization_members").select("organization_id").limit(1).maybeSingle();
  if (!membership) return { isDemo: true, services: demoLogistics };
  const { data, error } = await supabase.from("logistics_services").select("id,service_date,service_number,description,provider_name,original_cost,provider_payment,status,shareholders(name)").eq("organization_id", membership.organization_id).order("service_date", { ascending: false });
  if (error) return { isDemo: true, services: demoLogistics };
  return { isDemo: false, services: ((data ?? []) as unknown as DatabaseService[]).map((service) => ({ id: service.id, date: service.service_date, number: service.service_number ?? "—", description: service.description, provider: service.provider_name, shareholder: service.shareholders?.name ?? "Sin asignar", cost: Number(service.original_cost), providerPayment: Number(service.provider_payment), status: service.status })) };
}
