import Link from "next/link";
import { NewBalanceEntryForm } from "@/components/new-balance-entry-form";

export default function NewBalancePage() { return <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8"><Link href="/saldos" className="text-sm font-medium text-[var(--accent)]">← Volver a saldos</Link><p className="mb-1 mt-6 text-sm font-medium text-[var(--accent)]">Libro mayor por socio</p><h1 className="text-3xl font-semibold tracking-tight">Registrar movimiento</h1><p className="mt-2 text-sm text-[var(--muted)]">Los retiros requieren un motivo y los pagos de guías se registran automáticamente al marcar una guía como pagada.</p><NewBalanceEntryForm /></div>; }
