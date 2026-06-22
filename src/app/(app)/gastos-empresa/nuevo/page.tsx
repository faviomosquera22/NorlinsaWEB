import Link from "next/link";
import { NewCompanyExpenseForm } from "@/components/new-company-expense-form";

export default function NewCompanyExpensePage() {
  return <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8"><Link href="/gastos-empresa" className="text-sm font-medium text-[var(--accent)]">← Volver a Control de gastos</Link><p className="mb-1 mt-6 text-sm font-medium text-[var(--accent)]">Control financiero</p><h1 className="text-3xl font-semibold tracking-tight">Registrar movimiento</h1><p className="mt-2 text-sm text-[var(--muted)]">Ingresos y egresos para el saldo operativo de NORLINSA.</p><NewCompanyExpenseForm /></div>;
}
