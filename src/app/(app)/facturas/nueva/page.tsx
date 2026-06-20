import Link from "next/link";
import { NewInvoiceForm } from "@/components/new-invoice-form";

export default function NewInvoicePage() { return <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8"><Link href="/facturas" className="text-sm font-medium text-[var(--accent)]">← Volver a facturas</Link><p className="mb-1 mt-6 text-sm font-medium text-[var(--accent)]">Facturación manual</p><h1 className="text-3xl font-semibold tracking-tight">Registrar factura</h1><p className="mt-2 text-sm text-[var(--muted)]">Registre la factura y distribuya el valor entre los socios. El sistema valida el total antes de guardar.</p><NewInvoiceForm /></div>; }
