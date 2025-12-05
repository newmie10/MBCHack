"use client";

import dynamic from "next/dynamic";
import { type ReactNode } from "react";

// Dynamically import to avoid SSR issues
const Providers = dynamic(
  () => import("@/app/providers").then((mod) => mod.Providers),
  { ssr: false }
);

const Header = dynamic(
  () => import("@/components/Header").then((mod) => mod.Header),
  { 
    ssr: false,
    loading: () => (
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-neutral-900">Forecast Feed</span>
          <div className="w-24 h-8 bg-neutral-100 rounded-md animate-pulse" />
        </div>
      </header>
    ),
  }
);

const Footer = dynamic(
  () => import("@/components/Footer").then((mod) => mod.Footer),
  { ssr: false }
);

const BaseNetworkSwitcher = dynamic(
  () => import("@/components/BaseNetworkSwitcher").then((mod) => mod.BaseNetworkSwitcher),
  { ssr: false }
);

export function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <BaseNetworkSwitcher />
        {children}
      </main>
      <Footer />
    </Providers>
  );
}
