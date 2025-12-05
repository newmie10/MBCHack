"use client";

import { useState } from "react";
import Link from "next/link";
import { formatAddress, formatUSD } from "@/lib/polymarket";
import { useWatchlist } from "@/lib/WatchlistContext";

type SortBy = "volume" | "winRate" | "pnl" | "trades";

// Leaderboard data - combines watchlist + additional traders
const leaderboardData = [
  {
    address: "0x566b19c0CfC6F8dCd7411EA8Dfb81C01D25a6C48",
    label: "Theo",
    totalTrades: 1245,
    totalVolume: 8200000,
    winRate: 0.71,
    pnl: 1420000,
  },
  {
    address: "0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69",
    label: "Whale",
    totalTrades: 892,
    totalVolume: 12500000,
    winRate: 0.62,
    pnl: 2100000,
  },
  {
    address: "0xF8c47C3C1c4f8B6D5b9C5C3c5F8c47C3C1c4f8B6",
    label: "Polymath",
    totalTrades: 567,
    totalVolume: 4500000,
    winRate: 0.68,
    pnl: 890000,
  },
  {
    address: "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF",
    label: "Oracle",
    totalTrades: 423,
    totalVolume: 3200000,
    winRate: 0.65,
    pnl: 520000,
  },
  {
    address: "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",
    label: "Sharp",
    totalTrades: 312,
    totalVolume: 1800000,
    winRate: 0.74,
    pnl: 340000,
  },
  {
    address: "0x9876543210fedcba9876543210fedcba98765432",
    label: "Trader6",
    totalTrades: 289,
    totalVolume: 2100000,
    winRate: 0.58,
    pnl: 185000,
  },
  {
    address: "0xfedcba9876543210fedcba9876543210fedcba98",
    label: "Trader7",
    totalTrades: 456,
    totalVolume: 1650000,
    winRate: 0.63,
    pnl: 142000,
  },
  {
    address: "0x5555555555555555555555555555555555555555",
    label: "Trader8",
    totalTrades: 189,
    totalVolume: 980000,
    winRate: 0.69,
    pnl: 98000,
  },
  {
    address: "0x6666666666666666666666666666666666666666",
    label: "Trader9",
    totalTrades: 534,
    totalVolume: 2800000,
    winRate: 0.54,
    pnl: -45000,
  },
  {
    address: "0x7777777777777777777777777777777777777777",
    label: "Trader10",
    totalTrades: 278,
    totalVolume: 1200000,
    winRate: 0.61,
    pnl: 67000,
  },
];

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<SortBy>("pnl");
  const { addWallet, isWatched } = useWatchlist();

  const sortedData = [...leaderboardData].sort((a, b) => {
    switch (sortBy) {
      case "volume":
        return b.totalVolume - a.totalVolume;
      case "winRate":
        return b.winRate - a.winRate;
      case "pnl":
        return b.pnl - a.pnl;
      case "trades":
        return b.totalTrades - a.totalTrades;
      default:
        return 0;
    }
  });

  const handleAddToWatchlist = (trader: typeof leaderboardData[0]) => {
    addWallet({
      address: trader.address,
      label: trader.label,
      stats: {
        winRate: trader.winRate,
        totalVolume: trader.totalVolume,
        pnl: trader.pnl,
      },
    });
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900 mb-1">
          Leaderboard
        </h1>
        <p className="text-sm text-neutral-500">
          Top traders ranked by performance
        </p>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "pnl", label: "P&L" },
          { key: "volume", label: "Volume" },
          { key: "winRate", label: "Win Rate" },
          { key: "trades", label: "Trades" },
        ].map((option) => (
          <button
            key={option.key}
            onClick={() => setSortBy(option.key as SortBy)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              sortBy === option.key
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Rank</th>
              <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Trader</th>
              <th className="text-right text-xs font-medium text-neutral-400 px-4 py-3">Win Rate</th>
              <th className="text-right text-xs font-medium text-neutral-400 px-4 py-3">Volume</th>
              <th className="text-right text-xs font-medium text-neutral-400 px-4 py-3">P&L</th>
              <th className="text-right text-xs font-medium text-neutral-400 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((trader, index) => {
              const watched = isWatched(trader.address);
              const pnlColor = trader.pnl >= 0 ? "text-emerald-600" : "text-red-600";
              
              return (
                <tr 
                  key={trader.address} 
                  className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-400">{index + 1}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link 
                      href={`/profile/${trader.address}`}
                      className="flex items-center gap-3 hover:opacity-70 transition-opacity"
                    >
                      <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-medium">
                        {trader.label.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-neutral-900 block">
                          {trader.label}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {formatAddress(trader.address)}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-neutral-900">
                      {(trader.winRate * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-neutral-900">
                      {formatUSD(trader.totalVolume)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-medium ${pnlColor}`}>
                      {trader.pnl >= 0 ? "+" : ""}{formatUSD(trader.pnl)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {watched ? (
                      <span className="text-xs text-neutral-400">Watching</span>
                    ) : (
                      <button
                        onClick={() => handleAddToWatchlist(trader)}
                        className="px-3 py-1 text-xs font-medium text-neutral-600 border border-neutral-200 rounded-md hover:border-neutral-300 hover:text-neutral-900 transition-colors"
                      >
                        + Watch
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <p className="text-xs text-neutral-400 mb-1">Total Volume</p>
          <p className="text-lg font-semibold text-neutral-900">
            {formatUSD(leaderboardData.reduce((sum, t) => sum + t.totalVolume, 0))}
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <p className="text-xs text-neutral-400 mb-1">Avg Win Rate</p>
          <p className="text-lg font-semibold text-neutral-900">
            {(leaderboardData.reduce((sum, t) => sum + t.winRate, 0) / leaderboardData.length * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <p className="text-xs text-neutral-400 mb-1">Total Traders</p>
          <p className="text-lg font-semibold text-neutral-900">
            {leaderboardData.length}
          </p>
        </div>
      </div>
    </div>
  );
}
