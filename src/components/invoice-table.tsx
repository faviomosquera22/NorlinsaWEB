"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { money } from "@/lib/accounting";
import type { InvoiceRow } from "@/lib/invoices";

type InvoiceTableProps = { invoices: InvoiceRow[] };
const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("Todos");
  const filteredInvoices = useMemo(() => invoices.filter((invoice) => {
    const matchesQuery = invoice.number.toLowerCase().includes(query.trim().toLowerCase());
    const matchesMonth = month === "Todos" || String(new Date(`${invoice.date}T12:00:00`).getMonth() + 1) === month;
    return matchesQuery && matchesMonth;
  }), [invoices, month, query]);
  return <section className="mt-6 overflow-hidden rounded-xl border border-[var(--line)] bg-white"><div className="flex flex-wrap gap-3 border-b border-[var(--line)] p-4"><label className="flex min-w-64 flex-1 items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm text-[var(--muted)]"><Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Buscar factura" placeholder="Buscar por número de factura" className="w-full bg-transparent outline-none placeholder:text-[var(--muted)]" /></label><label className="flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--muted)]"><SlidersHorizontal size={16}/><select value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Filtrar facturas por mes" className="bg-transparent py-2 outline-none"><option value="Todos">Todos los meses</option>{months.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select></label></div><div className="px-5 pt-3 text-xs text-[var(--muted)]">{filteredInvoices.length} {filteredInvoices.length === 1 ? "factura" : "facturas"}</div><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-y border-[var(--line)] bg-[#fafbfa] text-xs uppercase tracking-wide text-[var(--muted)]"><tr><th className="px-5 py-3">Factura</th><th className="px-5 py-3">Fecha</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Distribución por socio</th><th className="px-5 py-3">Ganancia vinculada</th></tr></thead><tbody>{filteredInvoices.map((invoice) => <tr key={invoice.id} className="border-b border-[var(--line)] last:border-0"><td className="px-5 py-4 font-medium">{invoice.number}</td><td className="px-5 py-4 text-[var(--muted)]">{invoice.date}</td><td className="px-5 py-4 font-mono text-xs">{money.format(invoice.totalAmount)}</td><td className="px-5 py-4">{invoice.allocations.filter((allocation) => allocation.allocatedAmount > 0).map((allocation) => <span className="mr-2 inline-block rounded-md bg-[#f0f4f1] px-2 py-1 text-xs" key={allocation.shareholder}>{allocation.shareholder}: {money.format(allocation.allocatedAmount)}</span>)}</td><td className="px-5 py-4 font-mono text-xs text-[var(--accent)]">{money.format(invoice.allocations.reduce((sum, allocation) => sum + allocation.guideProfitability, 0))}</td></tr>)}</tbody></table></div>{filteredInvoices.length === 0 && <p className="p-10 text-center text-sm text-[var(--muted)]">No se encontraron facturas con esos filtros.</p>}</section>;
}
