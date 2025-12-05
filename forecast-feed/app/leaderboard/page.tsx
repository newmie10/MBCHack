"use client";

import { useState } from "react";
import { ForecasterCard } from "@/components/ForecasterCard";

type SortBy = "volume" | "winRate" | "pnl" | "trades";

// Mock leaderboard data
const leaderboardData = [
  {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    totalTrades: 245,
    totalVolume: 523000,
    winRate: 0.68,
    pnl: 42500,
  },
  {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    totalTrades: 189,
    totalVolume: 312000,
    winRate: 0.72,
    pnl: 28900,
  },
  {
    address: "0x9876543210fedcba9876543210fedcba98765432",
    totalTrades: 412,
    totalVolume: 890000,
    winRate: 0.55,
    pnl: 65200,
  },
  {
    address: "0xfedcba9876543210fedcba9876543210fedcba98",
    totalTrades: 156,
    totalVolume: 245000,
    winRate: 0.64,
    pnl: 18700,
  },
  {
    address: "0x5555555555555555555555555555555555555555",
    totalTrades: 89,
    totalVolume: 178000,
    winRate: 0.78,
    pnl: 31200,
  },
  {
    address: "0x6666666666666666666666666666666666666666",
    totalTrades: 324,
    totalVolume: 654000,
    winRate: 0.61,
    pnl: 45600,
  },
  {
    address: "0x7777777777777777777777777777777777777777",
    totalTrades: 278,
    totalVolume: 445000,
    winRate: 0.59,
    pnl: -8900,
  },
  {
    address: "0x8888888888888888888888888888888888888888",
    totalTrades: 198,
    totalVolume: 389000,
    winRate: 0.66,
    pnl: 22100,
  },
  {
    address: "0x9999999999999999999999999999999999999999",
    totalTrades: 567,
    totalVolume: 1230000,
    winRate: 0.52,
    pnl: 78400,
  },
  {
    address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    totalTrades: 134,
    totalVolume: 267000,
    winRate: 0.71,
    pnl: 19800,
  },
];

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<SortBy>("pnl");

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          🏆 Forecaster Leaderboard
        </h1>
        <p className="text-zinc-500">
          Top performing prediction market traders ranked by performance
        </p>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: "pnl", label: "Profit & Loss" },
          { key: "volume", label: "Volume" },
          { key: "winRate", label: "Win Rate" },
          { key: "trades", label: "Total Trades" },
        ].map((option) => (
          <button
            key={option.key}
            onClick={() => setSortBy(option.key as SortBy)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              sortBy === option.key
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {sortedData.map((forecaster, index) => (
          <ForecasterCard
            key={forecaster.address}
            forecaster={forecaster}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
}
