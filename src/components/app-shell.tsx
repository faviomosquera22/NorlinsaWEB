"use client";

import { BarChart3, BookOpenCheck, ChevronDown, CircleDollarSign, Database, FileClock, FileText, LogOut, Menu, ReceiptText, Settings, Truck, WalletCards, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const sections = [
  { label: "PRINCIPAL", items: [{ href: "/", label: "Resumen 2026", icon: BarChart3 }] },
  { label: "OPERACIÓN", items: [{ href: "/guias", label: "Control de guías", icon: Truck }, { href: "/logistica", label: "Servicios logísticos", icon: Truck }, { href: "/guias?estado=Pendiente", label: "Guías pendientes", icon: FileClock }, { href: "/guias?vista=filtracion", label: "Filtración de guías", icon: BookOpenCheck }] },
  { label: "CONTABILIDAD", items: [{ href: "/gastos", label: "Gastos SRI declarados", icon: ReceiptText }, { href: "/gastos-empresa", label: "Control de gastos", icon: WalletCards }, { href: "/saldos", label: "Saldos por socio", icon: CircleDollarSign }, { href: "/inversion", label: "Gastos, facturas e inversión", icon: CircleDollarSign }, { href: "/facturas?filtro=caducar", label: "Facturas por caducar", icon: FileText }] },
  { label: "CATÁLOGOS", items: [{ href: "/base-datos", label: "Base de datos", icon: Database }, { href: "/configuracion", label: "Configuración", icon: Settings }] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    setIsMobileMenuOpen(false);
    router.replace("/login");
    router.refresh();
  }
  const isActive = (href: string) => {
    const [path, query] = href.split("?");
    if (pathname !== path) return false;
    if (!query) return searchParams.toString().length === 0;
    return new URLSearchParams(query).toString() === searchParams.toString();
  };
  const linkClass = (href: string) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${isActive(href) ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]" : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"}`;
  const links = () => <nav className="space-y-5">{sections.map((section) => <div key={section.label}><p className="mb-1 px-3 text-[10px] font-semibold tracking-[0.12em] text-[#91a097]">{section.label}</p>{section.items.map(({ href, label, icon: Icon }) => <Link key={href} onClick={() => setIsMobileMenuOpen(false)} href={href} className={linkClass(href)}><Icon size={17} />{label}</Link>)}</div>)}<details className="group"><summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"><span className="flex items-center gap-3"><Truck size={17}/>Guías por mes</span><ChevronDown size={15} className="transition group-open:rotate-180"/></summary><div className="ml-4 mt-1 border-l border-[var(--line)] pl-2">{monthNames.map((month, index) => { const href = `/guias?mes=${index + 1}`; return <Link key={month} onClick={() => setIsMobileMenuOpen(false)} href={href} className={`block rounded-md px-3 py-1.5 text-xs ${isActive(href) ? "bg-[var(--accent-soft)] font-medium text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--accent)]"}`}>{month}</Link>; })}</div></details><button onClick={signOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#a24c40] transition hover:bg-[#fdefec]"><LogOut size={17}/>Cerrar sesión</button></nav>;
  return <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--line)] bg-white/95 px-5 backdrop-blur lg:hidden"><Link href="/" className="relative h-12 w-32"><Image src="/norlinsa-logo.jpg" alt="NORLINSA Logística de Transporte" fill sizes="128px" className="object-contain" priority/></Link><button onClick={() => setIsMobileMenuOpen((open) => !open)} aria-label="Abrir navegación" className="rounded-lg p-2 text-[var(--muted)]">{isMobileMenuOpen ? <X size={20}/> : <Menu size={20}/>}</button></header>
    {isMobileMenuOpen && <div className="fixed inset-x-0 top-16 z-20 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-[var(--line)] bg-white p-4 shadow-lg lg:hidden">{links()}</div>}
    <aside className="fixed inset-y-0 hidden w-64 flex-col border-r border-[var(--line)] bg-white px-4 py-6 lg:flex">
      <Link href="/" className="relative mb-8 block h-28 w-full"><Image src="/norlinsa-logo.jpg" alt="NORLINSA Logística de Transporte" fill sizes="224px" className="object-contain" priority/></Link>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">{links()}</div>
      <div className="mt-4 shrink-0 rounded-xl bg-[#f0f4f1] p-3 text-xs text-[var(--muted)]"><strong className="mb-1 block text-[var(--foreground)]">Equipo NORLINSA</strong>Acceso compartido y trazabilidad de cada cambio.</div>
    </aside>
    <main className="lg:ml-64">{children}</main>
  </div>;
}
