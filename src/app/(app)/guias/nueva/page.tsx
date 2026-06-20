import Link from "next/link";
import { NewGuideForm } from "@/components/new-guide-form";

export default function NewGuidePage() {
  return <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8"><Link href="/guias" className="text-sm font-medium text-[var(--accent)]">← Volver a guías</Link><h1 className="mt-5 text-3xl font-semibold tracking-tight">Registrar guía</h1><p className="mt-2 text-sm text-[var(--muted)]">Ingrese los datos base; los valores derivados se calculan antes de guardar.</p><NewGuideForm /></div>;
}
