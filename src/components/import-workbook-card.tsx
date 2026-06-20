"use client";

import { Check, Clipboard, FileSpreadsheet } from "lucide-react";
import { useState } from "react";

const command = "npm run import:workbook -- /ruta/al/libro.xlsx";

export function ImportWorkbookCard() {
  const [copied, setCopied] = useState(false);
  async function copyCommand() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return <section className="mt-7 rounded-xl border border-[var(--line)] bg-white p-6"><div className="flex items-start gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><FileSpreadsheet size={20}/></span><div><h2 className="font-semibold">Importación inicial desde Excel</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">El importador detecta las hojas mensuales de guías y los comprobantes de gastos SRI. Es repetible: una fila ya importada se actualiza, no se duplica.</p></div></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#18241e] px-4 py-3"><code className="text-sm text-[#e1f0e7]">{command}</code><button onClick={copyCommand} className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20">{copied ? <Check size={15}/> : <Clipboard size={15}/>} {copied ? "Copiado" : "Copiar"}</button></div><p className="mt-3 text-xs text-[var(--muted)]">Requiere las variables de entorno de Supabase, incluida la clave de servicio solo en su equipo local.</p></section>;
}
