import Link from "next/link";
import { NewTaxExpenseForm } from "@/components/new-tax-expense-form";

export default function NewTaxExpensePage() {
  return <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8"><Link href="/gastos" className="text-sm font-medium text-[var(--accent)]">← Volver a Gastos SRI</Link><p className="mb-1 mt-6 text-sm font-medium text-[var(--accent)]">Contabilidad tributaria</p><h1 className="text-3xl font-semibold tracking-tight">Registrar comprobante SRI</h1><p className="mt-2 text-sm text-[var(--muted)]">Los campos siguen la estructura de la hoja “GASTOS SRI DECLARADOS”.</p><NewTaxExpenseForm /></div>;
}
