import { FileUp, Plus } from "lucide-react";
import Link from "next/link";
import { GuideTable } from "@/components/guide-table";
import { getDashboardSnapshot } from "@/lib/dashboard";

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default async function GuidesPage({ searchParams }: { searchParams: Promise<{ mes?: string; estado?: string; vista?: string }> }) {
  const params = await searchParams;
  const { guides, isDemo } = await getDashboardSnapshot();
  const selectedMonth = params.mes && Number(params.mes) >= 1 && Number(params.mes) <= 12 ? params.mes : undefined;
  const title = params.vista === "filtracion" ? "Filtración de guías" : selectedMonth ? `Control de guías · ${monthNames[Number(selectedMonth) - 1]}` : params.estado === "Pendiente" ? "Guías pendientes" : "Control de guías";
  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-sm font-medium text-[var(--accent)]">Operación</p><h1 className="text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-2 text-sm text-[var(--muted)]">Cada guía conserva su origen, responsable y cálculo automático.</p></div><div className="flex gap-2"><Link href="/importar" className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium"><FileUp size={17} />Importar Excel</Link><Link href="/guias/nueva" className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white"><Plus size={17} />Nueva guía</Link></div></header>{isDemo && <p className="mt-6 rounded-lg bg-[#fff7df] px-4 py-3 text-sm text-[#765c1c]">Los datos mostrados son una referencia del libro. La importación queda disponible al conectar Supabase.</p>}<GuideTable guides={guides} initialStatus={params.estado} initialMonth={selectedMonth}/></div>;
}
