import Link from "next/link";
import { NewLogisticsServiceForm } from "@/components/new-logistics-service-form";

export default function NewLogisticsServicePage() { return <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8"><Link href="/logistica" className="text-sm font-medium text-[var(--accent)]">← Volver a servicios logísticos</Link><p className="mb-1 mt-6 text-sm font-medium text-[var(--accent)]">Operación</p><h1 className="text-3xl font-semibold tracking-tight">Registrar servicio logístico</h1><p className="mt-2 text-sm text-[var(--muted)]">Este registro reserva automáticamente el pago al proveedor en el saldo del accionista elegido.</p><NewLogisticsServiceForm /></div>; }
