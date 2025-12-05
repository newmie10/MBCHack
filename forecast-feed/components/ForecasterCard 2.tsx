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
  const pnlColor = forecaster.pnl >= 0 ? "text-emerald-600" : "text-red-600";
  const pnlPrefix = forecaster.pnl >= 0 ? "+" : "";

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-300 transition-colors">
      <div className="flex items-center justify-between">
        <Link
          href={`/profile/${forecaster.address}`}
          className="flex items-center gap-3 hover:opacity-70 transition-opacity"
        >
          {rank && (
            <span className="text-xs text-neutral-400 w-4">
              {rank}
            </span>
          )}
          <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 text-xs font-medium">
            {forecaster.address.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <span className="text-sm font-medium text-neutral-900 block">
              {formatAddress(forecaster.address)}
            </span>
            <span className="text-xs text-neutral-400">
              {forecaster.totalTrades} trades
            </span>
          </div>
        </Link>
        <FollowButton address={forecaster.address} />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-neutral-100">
        <div>
          <p className="text-xs text-neutral-400 mb-0.5">Volume</p>
          <p className="text-sm font-medium text-neutral-900">
            {formatUSD(forecaster.totalVolume)}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-0.5">Win Rate</p>
          <p className="text-sm font-medium text-neutral-900">
            {(forecaster.winRate * 100).toFixed(0)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-400 mb-0.5">P&L</p>
          <p className={`text-sm font-medium ${pnlColor}`}>
            {pnlPrefix}{formatUSD(Math.abs(forecaster.pnl))}
          </p>
        </div>
      </div>
    </div>
  );
}
