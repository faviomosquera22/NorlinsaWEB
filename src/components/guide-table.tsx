"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { money, type GuideRow } from "@/lib/accounting";

type GuideTableProps = { guides: GuideRow[]; initialStatus?: string; initialMonth?: string };

export function GuideTable({ guides, initialStatus = "Todos", initialMonth = "Todos" }: GuideTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [month, setMonth] = useState(initialMonth);
  const filteredGuides = useMemo(() => guides.filter((guide) => {
    const matchesText = `${guide.driver} ${guide.vehicle} ${guide.invoice} ${guide.shareholder}`.toLowerCase().includes(query.toLowerCase());
    const guideMonth = String(new Date(`${guide.date}T12:00:00`).getMonth() + 1);
    return matchesText && (status === "Todos" || guide.status === status) && (month === "Todos" || guideMonth === month);
  }), [guides, month, query, status]);

  return <section className="mt-6 rounded-xl border border-[var(--line)] bg-white">
    <div className="flex flex-wrap gap-3 border-b border-[var(--line)] p-4"><label className="flex min-w-64 flex-1 items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm text-[var(--muted)]"><Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Buscar guía" placeholder="Buscar por chofer, vehículo o factura" className="w-full bg-transparent outline-none placeholder:text-[var(--muted)]" /></label><label className="flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--muted)]"><SlidersHorizontal size={16}/><select value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Filtrar por mes" className="bg-transparent py-2 outline-none"><option value="Todos">Todos los meses</option>{["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select></label><label className="flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--muted)]"><SlidersHorizontal size={16}/><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por estado" className="bg-transparent py-2 outline-none"><option>Todos</option><option>Pendiente</option><option>Facturada</option><option>Pagada</option></select></label></div>
    <div className="px-5 pt-3 text-xs text-[var(--muted)]">{filteredGuides.length} {filteredGuides.length === 1 ? "registro" : "registros"}</div>
    <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-[var(--line)] bg-[#fafbfa] text-xs uppercase tracking-wide text-[var(--muted)]"><tr><th className="px-5 py-3">Fecha</th><th className="px-5 py-3">Chofer / vehículo</th><th className="px-5 py-3">Accionista</th><th className="px-5 py-3">Factura</th><th className="px-5 py-3">Costo</th><th className="px-5 py-3">Pago chofer</th><th className="px-5 py-3">Estado</th></tr></thead><tbody>{filteredGuides.map((guide) => <tr className="border-b border-[var(--line)] last:border-0" key={guide.id}><td className="px-5 py-4 text-[var(--muted)]">{guide.date}</td><td className="px-5 py-4"><strong className="block font-medium">{guide.driver}</strong><span className="text-xs text-[var(--muted)]">{guide.vehicle}</span></td><td className="px-5 py-4">{guide.shareholder}</td><td className="px-5 py-4">{guide.invoice}</td><td className="px-5 py-4 font-mono text-xs">{money.format(guide.originalCost)}</td><td className="px-5 py-4 font-mono text-xs">{money.format(guide.payment)}</td><td className="px-5 py-4"><span className="rounded-full bg-[#edf4ef] px-2.5 py-1 text-xs font-medium text-[#356247]">{guide.status}</span></td></tr>)}</tbody></table></div>
    {filteredGuides.length === 0 && <div className="p-10 text-center text-sm text-[var(--muted)]">No hay guías que coincidan con los filtros.</div>}
  </section>;
}
