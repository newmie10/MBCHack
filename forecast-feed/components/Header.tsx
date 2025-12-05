"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-zinc-800">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <span className="text-xl font-bold text-white">Forecast Feed</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Feed
          </Link>
          <Link
            href="/leaderboard"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Leaderboard
          </Link>
        </nav>

        <ConnectButton
          accountStatus="avatar"
          chainStatus="icon"
          showBalance={false}
        />
      </div>
    </header>
  );
}
