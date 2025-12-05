"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import ConnectButton to avoid SSR issues
const ConnectButton = dynamic(
  () => import("@rainbow-me/rainbowkit").then((mod) => mod.ConnectButton),
  { 
    ssr: false,
    loading: () => (
      <div className="w-24 h-8 bg-neutral-100 rounded-md animate-pulse" />
    ),
  }
);

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-200">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-neutral-900 text-lg">◆</span>
          <span className="text-lg font-bold tracking-tight text-neutral-900">
            Forecast<span className="text-neutral-400 font-medium">Feed</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Feed
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Leaderboard
          </Link>
        </nav>

        <ConnectButton
          accountStatus="avatar"
          chainStatus="none"
          showBalance={false}
        />
      </div>
    </header>
  );
}
