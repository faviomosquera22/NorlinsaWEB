import { AppShell } from "@/components/app-shell";
import { Suspense } from "react";

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<main className="min-h-screen bg-[var(--background)]" />}><AppShell>{children}</AppShell></Suspense>;
}
