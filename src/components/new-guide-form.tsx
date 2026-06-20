"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createGuide, type GuideActionState } from "@/app/actions/guides";
import { money } from "@/lib/accounting";

const initialState: GuideActionState = {};

function AmountInput({ name, label, value, onChange, hint }: { name: string; label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return <label className="text-sm font-medium">{label}<input required={name !== "advance" && name !== "transfer_fee"} name={name} type="number" min="0" step="0.01" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]" />{hint && <span className="mt-1 block text-xs font-normal text-[var(--muted)]">{hint}</span>}</label>;
}

export function NewGuideForm() {
  const [state, formAction, isPending] = useActionState(createGuide, initialState);
  const [cost, setCost] = useState("");
  const [rate, setRate] = useState("0.10");
  const [advance, setAdvance] = useState("0");
  const [fee, setFee] = useState("0.41");
  const originalCost = Number(cost) || 0;
  const profitability = originalCost * (Number(rate) || 0);
  const payment = originalCost - profitability - (Number(advance) || 0);
  const transferred = payment - (Number(fee) || 0);

  return <form action={formAction} className="mt-7 grid gap-6 xl:grid-cols-[1fr_280px]"><section className="rounded-xl border border-[var(--line)] bg-white p-6"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-medium">Fecha de compra<input required name="purchase_date" type="date" className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" /></label><label className="text-sm font-medium">N.º de guía<input name="guide_number" placeholder="Ej. 659" className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" /></label><label className="text-sm font-medium">Disco / vehículo<input name="vehicle" placeholder="Ej. CBO0499" className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" /></label><label className="text-sm font-medium">N.º de factura<input name="invoice_number" placeholder="FACTURA #160" className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" /></label><label className="text-sm font-medium">Chofer<input required name="driver" placeholder="Nombre completo" className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" /></label><label className="text-sm font-medium">Accionista<input required name="shareholder" placeholder="Jorge, Daniel o Favio" className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" /></label><AmountInput name="original_cost" label="Costo original (USD)" value={cost} onChange={setCost}/><AmountInput name="profitability_rate" label="Porcentaje cobrado" value={rate} onChange={setRate} hint="Ej. 0.10 equivale a 10%"/><AmountInput name="advance" label="Abono (USD)" value={advance} onChange={setAdvance}/><AmountInput name="transfer_fee" label="Comisión de transferencia" value={fee} onChange={setFee}/><label className="text-sm font-medium">Estado<select name="status" defaultValue="Pendiente" className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-sm"><option>Pendiente</option><option>Facturada</option><option>Pagada</option></select></label></div>{state.error && <p role="alert" className="mt-5 rounded-lg bg-[#fdefec] px-4 py-3 text-sm text-[#963f32]">{state.error}</p>}<div className="mt-7 flex justify-end gap-3"><Link href="/guias" className="rounded-lg px-4 py-2.5 text-sm font-medium">Cancelar</Link><button disabled={isPending} className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">{isPending ? "Guardando…" : "Guardar guía"}</button></div></section><aside className="h-fit rounded-xl bg-[#173e30] p-5 text-white"><p className="text-sm font-medium text-[#b8dac8]">Vista previa</p><h2 className="mt-1 text-lg font-semibold">Cálculos automáticos</h2><dl className="mt-5 space-y-4 text-sm"><div className="border-b border-white/15 pb-3"><dt className="text-[#b8dac8]">Rentabilidad</dt><dd className="mt-1 font-mono text-lg">{money.format(profitability)}</dd></div><div className="border-b border-white/15 pb-3"><dt className="text-[#b8dac8]">Pago al chofer</dt><dd className="mt-1 font-mono text-lg">{money.format(payment)}</dd></div><div><dt className="text-[#b8dac8]">Monto transferido</dt><dd className="mt-1 font-mono text-lg">{money.format(transferred)}</dd></div></dl></aside></form>;
}
