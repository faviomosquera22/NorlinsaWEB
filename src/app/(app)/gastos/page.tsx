import Link from "next/link";
import { Plus, ReceiptText } from "lucide-react";
import { TaxExpenseTable } from "@/components/tax-expense-table";
import { money } from "@/lib/accounting";
import { getTaxExpenses } from "@/lib/expense-ledgers";

export default async function ExpensesPage() {
  const { items, isDemo } = await getTaxExpenses();
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const vat = items.reduce((sum, item) => sum + item.vat, 0);
  const total = items.reduce((sum, item) => sum + item.total, 0);
  return <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-sm font-medium text-[var(--accent)]">Contabilidad tributaria</p><h1 className="text-3xl font-semibold tracking-tight">Gastos SRI declarados</h1><p className="mt-2 text-sm text-[var(--muted)]">Libro de comprobantes con los campos de la hoja de Drive.</p></div><Link href="/gastos/nuevo" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white"><Plus size={17} /> Registrar comprobante</Link></div>{isDemo && <p className="mt-5 rounded-lg bg-[#fff4df] px-4 py-3 text-sm text-[#875a16]">Vista de ejemplo: configure y ejecute las migraciones de Supabase para consultar los comprobantes reales.</p>}<section className="mt-7 grid gap-4 md:grid-cols-3"><article className="rounded-xl border border-[var(--line)] bg-white p-5"><ReceiptText className="text-[var(--accent)]" size={20}/><p className="mt-4 text-sm text-[var(--muted)]">Valor sin impuestos</p><strong className="mt-1 block text-2xl">{money.format(subtotal)}</strong></article><article className="rounded-xl border border-[var(--line)] bg-white p-5"><p className="text-sm text-[var(--muted)]">IVA declarado</p><strong className="mt-3 block text-2xl">{money.format(vat)}</strong><span className="mt-2 block text-xs text-[var(--muted)]">{items.length} comprobante{items.length === 1 ? "" : "s"}</span></article><article className="rounded-xl border border-[var(--line)] bg-white p-5"><p className="text-sm text-[var(--muted)]">Importe total</p><strong className="mt-3 block text-2xl">{money.format(total)}</strong><span className="mt-2 block text-xs text-[var(--muted)]">Total registrado en el libro.</span></article></section><TaxExpenseTable items={items} /></div>;
}
