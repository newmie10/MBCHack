"use client";

import dynamic from "next/dynamic";
import { type ReactNode } from "react";

// Dynamically import providers to avoid SSR issues with RainbowKit
const Providers = dynamic(
  () => import("@/app/providers").then((mod) => mod.Providers),
  { ssr: false }
);

// Dynamically import Header to avoid SSR issues with ConnectButton
const Header = dynamic(
  () => import("@/components/Header").then((mod) => mod.Header),
  {
    ssr: false,
    loading: () => (
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span className="text-xl font-bold text-white">Forecast Feed</span>
          </div>
          <div className="w-32 h-10 bg-zinc-800 rounded-xl animate-pulse" />
        </div>
      </header>
    ),
  }
);

export function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </Providers>
  );
}
