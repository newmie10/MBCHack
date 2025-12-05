"use client";

import Link from "next/link";
import { formatAddress, formatUSD } from "@/lib/polymarket";
import { FollowButton } from "./FollowButton";

interface ForecasterStats {
  address: string;
  totalTrades: number;
  totalVolume: number;
  winRate: number;
  pnl: number;
}

interface ForecasterCardProps {
  forecaster: ForecasterStats;
  rank?: number;
}

export function ForecasterCard({ forecaster, rank }: ForecasterCardProps) {
  const pnlColor = forecaster.pnl >= 0 ? "text-green-400" : "text-red-400";
  const pnlPrefix = forecaster.pnl >= 0 ? "+" : "";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all">
      <div className="flex items-center justify-between">
        <Link
          href={`/profile/${forecaster.address}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          {rank && (
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400">
              #{rank}
            </div>
          )}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {forecaster.address.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <span className="font-medium text-white block">
              {formatAddress(forecaster.address)}
            </span>
            <span className="text-xs text-zinc-500">
              {forecaster.totalTrades} trades
            </span>
          </div>
        </Link>
        <FollowButton address={forecaster.address} />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-zinc-800">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Volume</p>
          <p className="text-sm font-medium text-white">
            {formatUSD(forecaster.totalVolume)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Win Rate</p>
          <p className="text-sm font-medium text-white">
            {(forecaster.winRate * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">P&L</p>
          <p className={`text-sm font-medium ${pnlColor}`}>
            {pnlPrefix}
            {formatUSD(Math.abs(forecaster.pnl))}
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-2 mt-3">
        {forecaster.winRate >= 0.6 && (
          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
            🏆 High Win Rate
          </span>
        )}
        {forecaster.totalVolume >= 100000 && (
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
            🐋 Whale
          </span>
        )}
        {forecaster.totalTrades >= 100 && (
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
            ⚡ Active Trader
          </span>
        )}
      </div>
    </div>
  );
}
