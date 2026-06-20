"use client";

import { Landmark, Mail } from "lucide-react";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    setMessage(error ? error.message : "Revise su correo para abrir el enlace de acceso.");
  }
  return <main className="grid min-h-screen place-items-center bg-[#f5f7f5] p-5"><section className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-8 shadow-sm"><div className="grid size-11 place-items-center rounded-xl bg-[var(--accent)] text-white"><Landmark size={21}/></div><h1 className="mt-6 text-2xl font-semibold">Acceso NORLINSA</h1><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Ingrese con su correo autorizado. Todos los movimientos quedan asociados a su usuario.</p>{configured ? <form onSubmit={signIn} className="mt-6"><label className="text-sm font-medium">Correo electrónico<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@empresa.com" className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]" /></label><button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white"><Mail size={16}/>Enviar enlace de acceso</button>{message && <p className="mt-4 rounded-lg bg-[var(--accent-soft)] p-3 text-sm text-[#23563e]">{message}</p>}</form> : <p className="mt-6 rounded-lg bg-[#fff7df] p-4 text-sm leading-6 text-[#765c1c]">Falta conectar Supabase. Copie <code className="font-mono text-xs">.env.example</code> a <code className="font-mono text-xs">.env.local</code> y agregue las credenciales del proyecto.</p>}</section></main>;
}
