"use client";

import Link from "next/link";
import {
  FeedItem,
  formatAddress,
  formatUSD,
  formatPercent,
  formatRelativeTime,
} from "@/lib/polymarket";

interface FeedCardProps {
  item: FeedItem;
}

export function FeedCard({ item }: FeedCardProps) {
  const isBuy = item.side === "BUY";
  const actionColor = isBuy ? "text-green-400" : "text-red-400";
  const actionBg = isBuy ? "bg-green-500/10" : "bg-red-500/10";
  const actionText = isBuy ? "bought" : "sold";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Link
          href={`/profile/${item.trader}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {item.trader.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <span className="font-medium text-white">
              {formatAddress(item.trader)}
            </span>
            <p className="text-xs text-zinc-500">
              {formatRelativeTime(item.timestamp)}
            </p>
          </div>
        </Link>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${actionBg} ${actionColor}`}
        >
          {actionText.toUpperCase()}
        </span>
      </div>

      {/* Market Info */}
      <div className="mb-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{item.market.icon || "📊"}</span>
          <div className="flex-1">
            <h3 className="text-white font-medium leading-tight mb-1">
              {item.market.question}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span className={actionColor}>
                {item.outcome} @ {formatPercent(item.price)}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400">
                {formatUSD(parseFloat(item.size) * parseFloat(item.price))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Stats */}
      <div className="flex items-center gap-4 text-xs text-zinc-500 pt-3 border-t border-zinc-800">
        <div className="flex items-center gap-1">
          <span>📈</span>
          <span>Vol: {formatUSD(item.market.volume)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💧</span>
          <span>Liq: {formatUSD(item.market.liquidity)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>⏰</span>
          <span>
            Ends: {new Date(item.market.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Transaction Link */}
      {item.transactionHash && (
        <div className="mt-2 pt-2 border-t border-zinc-800">
          <a
            href={`https://polygonscan.com/tx/${item.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            View transaction ↗
          </a>
        </div>
      )}
    </div>
  );
}
