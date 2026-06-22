"use client";

import { useMemo, useState } from "react";
import { money } from "@/lib/accounting";
import type { TaxExpense } from "@/lib/expense-ledgers";

type TaxExpenseTableProps = { items: TaxExpense[] };

export function TaxExpenseTable({ items }: TaxExpenseTableProps) {
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("all");
  const [shareholder, setShareholder] = useState("all");
  const months = useMemo(() => [...new Set(items.map((item) => item.date.slice(0, 7)).filter((value) => value !== "—"))].sort().reverse(), [items]);
  const shareholders = useMemo(() => [...new Set(items.map((item) => item.shareholder))].sort(), [items]);
  const filtered = items.filter((item) => {
    const searchable = `${item.supplier} ${item.ruc} ${item.receipt} ${item.accessKey} ${item.shareholder}`.toLowerCase();
    return (month === "all" || item.date.startsWith(month)) && (shareholder === "all" || item.shareholder === shareholder) && searchable.includes(query.toLowerCase());
  });
  return <section className="mt-6 overflow-hidden rounded-xl border border-[var(--line)] bg-white"><div className="flex flex-col gap-3 border-b border-[var(--line)] p-5 lg:flex-row lg:items-end"><label className="flex-1 text-sm font-medium">Buscar proveedor, RUC, comprobante o socio<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. 001-002 o PETROYNG" className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" /></label><label className="text-sm font-medium">Mes<select value={month} onChange={(event) => setMonth(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm"><option value="all">Todos</option>{months.map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label className="text-sm font-medium">Socio<select value={shareholder} onChange={(event) => setShareholder(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm"><option value="all">Todos</option>{shareholders.map((value) => <option key={value} value={value}>{value}</option>)}</select></label></div><div className="overflow-x-auto"><table className="min-w-[1250px] w-full text-left text-sm"><thead className="bg-[#f5f8f6] text-xs uppercase tracking-wide text-[var(--muted)]"><tr><th className="px-4 py-3">Emisión</th><th className="px-4 py-3">RUC emisor</th><th className="px-4 py-3">Razón social</th><th className="px-4 py-3">Comprobante</th><th className="px-4 py-3">N.º comprobante</th><th className="px-4 py-3">Clave acceso</th><th className="px-4 py-3 text-right">Subtotal</th><th className="px-4 py-3 text-right">IVA</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Socio</th></tr></thead><tbody className="divide-y divide-[var(--line)]">{filtered.map((item) => <tr key={item.id}><td className="whitespace-nowrap px-4 py-3">{item.date}</td><td className="px-4 py-3 font-mono text-xs">{item.ruc}</td><td className="px-4 py-3 font-medium">{item.supplier}</td><td className="px-4 py-3">{item.receiptType}</td><td className="px-4 py-3 font-mono text-xs">{item.receipt}</td><td className="max-w-40 truncate px-4 py-3 font-mono text-xs" title={item.accessKey}>{item.accessKey}</td><td className="px-4 py-3 text-right font-mono text-xs">{money.format(item.subtotal)}</td><td className="px-4 py-3 text-right font-mono text-xs">{money.format(item.vat)}</td><td className="px-4 py-3 text-right font-mono text-xs font-semibold">{money.format(item.total)}</td><td className="px-4 py-3">{item.shareholder}</td></tr>)}{filtered.length === 0 && <tr><td colSpan={10} className="px-4 py-10 text-center text-[var(--muted)]">No hay comprobantes que coincidan con los filtros.</td></tr>}</tbody></table></div></section>;
}
