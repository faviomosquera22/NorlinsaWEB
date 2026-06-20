"use client";

import { Eye, EyeOff, Landmark, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);
    if (error) { setMessage("Correo o contraseña incorrectos."); return; }
    router.push("/");
    router.refresh();
  }
  return <main className="grid min-h-screen place-items-center overflow-hidden bg-[#102d22] p-5"><div className="pointer-events-none absolute -left-24 top-[-7rem] size-96 rounded-full bg-[#2a8a66]/40 blur-3xl"/><div className="pointer-events-none absolute -bottom-32 right-[-7rem] size-96 rounded-full bg-[#b4d7a4]/25 blur-3xl"/><section className="relative w-full max-w-md rounded-2xl border border-white/25 bg-white p-8 shadow-2xl shadow-black/20"><div className="grid size-12 place-items-center rounded-xl bg-[var(--accent)] text-white shadow-lg shadow-emerald-900/20"><Landmark size={22}/></div><p className="mt-6 text-xs font-semibold tracking-[0.14em] text-[var(--accent)]">SISTEMA FINANCIERO</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Acceso NORLINSA</h1><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Ingrese con su cuenta autorizada para consultar y registrar operaciones.</p>{configured ? <form onSubmit={signIn} className="mt-7 space-y-4"><label className="block text-sm font-medium">Correo electrónico<span className="mt-1.5 flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 focus-within:border-[var(--accent)]"><Mail size={16} className="text-[var(--muted)]"/><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@empresa.com" className="w-full py-2.5 text-sm outline-none" /></span></label><label className="block text-sm font-medium">Contraseña<span className="mt-1.5 flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 focus-within:border-[var(--accent)]"><LockKeyhole size={16} className="text-[var(--muted)]"/><input type={showPassword ? "text" : "password"} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Su contraseña" className="w-full py-2.5 text-sm outline-none"/><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} className="text-[var(--muted)]">{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></span></label><button disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#15583f] disabled:opacity-60">{isSubmitting ? "Ingresando…" : "Ingresar al sistema"}</button>{message && <p role="alert" className="rounded-lg bg-[#fdefec] p-3 text-sm text-[#963f32]">{message}</p>}</form> : <p className="mt-6 rounded-lg bg-[#fff7df] p-4 text-sm leading-6 text-[#765c1c]">Falta conectar Supabase. Agregue las variables de entorno del proyecto para habilitar las cuentas.</p>}<p className="mt-6 border-t border-[var(--line)] pt-4 text-center text-xs text-[var(--muted)]">Acceso exclusivo para el equipo autorizado de NORLINSA.</p></section></main>;
}
