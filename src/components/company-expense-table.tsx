"use client";

import { useMemo, useState } from "react";
import { money } from "@/lib/accounting";
import type { CompanyExpense } from "@/lib/expense-ledgers";

type CompanyExpenseTableProps = { items: CompanyExpense[] };

export function CompanyExpenseTable({ items }: CompanyExpenseTableProps) {
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("all");
  const months = useMemo(() => [...new Set(items.map((item) => item.date.slice(0, 7)).filter((value) => value !== "—"))].sort().reverse(), [items]);
  const filtered = items.filter((item) => (month === "all" || item.date.startsWith(month)) && `${item.concept} ${item.type} ${item.beneficiary}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="mt-6 overflow-hidden rounded-xl border border-[var(--line)] bg-white"><div className="flex flex-col gap-3 border-b border-[var(--line)] p-5 sm:flex-row sm:items-end"><label className="flex-1 text-sm font-medium">Buscar concepto, tipo o beneficiario<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. combustible o proveedor" className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" /></label><label className="text-sm font-medium">Mes<select value={month} onChange={(event) => setMonth(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm"><option value="all">Todos</option>{months.map((value) => <option key={value} value={value}>{value}</option>)}</select></label></div><div className="overflow-x-auto"><table className="min-w-[850px] w-full text-left text-sm"><thead className="bg-[#f5f8f6] text-xs uppercase tracking-wide text-[var(--muted)]"><tr><th className="px-5 py-3">Fecha</th><th className="px-5 py-3">Concepto</th><th className="px-5 py-3">Tipo</th><th className="px-5 py-3">Beneficiario</th><th className="px-5 py-3 text-right">Ingresos</th><th className="px-5 py-3 text-right">Egresos</th><th className="px-5 py-3 text-right">Saldo</th></tr></thead><tbody className="divide-y divide-[var(--line)]">{filtered.map((item) => <tr key={item.id}><td className="whitespace-nowrap px-5 py-3">{item.date}</td><td className="px-5 py-3 font-medium">{item.concept}</td><td className="px-5 py-3">{item.type}</td><td className="px-5 py-3">{item.beneficiary}</td><td className="px-5 py-3 text-right font-mono text-xs text-[#187552]">{item.income ? money.format(item.income) : "—"}</td><td className="px-5 py-3 text-right font-mono text-xs text-[#a85625]">{item.expense ? money.format(item.expense) : "—"}</td><td className="px-5 py-3 text-right font-mono text-xs font-semibold">{money.format(item.balance)}</td></tr>)}{filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-[var(--muted)]">No hay movimientos que coincidan con los filtros.</td></tr>}</tbody></table></div></section>;
}
