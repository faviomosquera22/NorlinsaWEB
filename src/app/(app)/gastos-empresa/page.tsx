import Link from "next/link";
import { Plus, WalletCards } from "lucide-react";
import { CompanyExpenseTable } from "@/components/company-expense-table";
import { money } from "@/lib/accounting";
import { getCompanyExpenses } from "@/lib/expense-ledgers";

export default async function CompanyExpensesPage() {
  const { items, isDemo } = await getCompanyExpenses();
  const income = items.reduce((sum, item) => sum + item.income, 0);
  const expense = items.reduce((sum, item) => sum + item.expense, 0);
  const balance = items.at(-1)?.balance ?? 0;
  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-sm font-medium text-[var(--accent)]">Control financiero</p><h1 className="text-3xl font-semibold tracking-tight">Control de gastos 2026</h1><p className="mt-2 text-sm text-[var(--muted)]">Libro operativo con fecha, concepto, tipo, beneficiario, ingresos, egresos y saldo.</p></div><Link href="/gastos-empresa/nuevo" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white"><Plus size={17} /> Registrar movimiento</Link></div>{isDemo && <p className="mt-5 rounded-lg bg-[#fff4df] px-4 py-3 text-sm text-[#875a16]">Vista de ejemplo: ejecute la migración de libro de gastos en Supabase para consultar los movimientos reales.</p>}<section className="mt-7 grid gap-4 md:grid-cols-3"><article className="rounded-xl border border-[var(--line)] bg-white p-5"><WalletCards className="text-[var(--accent)]" size={20}/><p className="mt-4 text-sm text-[var(--muted)]">Ingresos</p><strong className="mt-1 block text-2xl text-[#187552]">{money.format(income)}</strong></article><article className="rounded-xl border border-[var(--line)] bg-white p-5"><p className="text-sm text-[var(--muted)]">Egresos</p><strong className="mt-3 block text-2xl text-[#a85625]">{money.format(expense)}</strong><span className="mt-2 block text-xs text-[var(--muted)]">{items.length} movimiento{items.length === 1 ? "" : "s"}</span></article><article className="rounded-xl border border-[var(--line)] bg-white p-5"><p className="text-sm text-[var(--muted)]">Saldo operativo</p><strong className="mt-3 block text-2xl">{money.format(balance)}</strong><span className="mt-2 block text-xs text-[var(--muted)]">Calculado en orden cronológico.</span></article></section><CompanyExpenseTable items={items} /></div>;
}
