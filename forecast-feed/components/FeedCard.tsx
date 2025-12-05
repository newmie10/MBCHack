"use client";

import Link from "next/link";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  FeedItem,
  formatAddress,
  formatUSD,
  formatPercent,
  formatRelativeTime,
} from "@/lib/polymarket";
import { useWatchlist } from "@/lib/WatchlistContext";
import { COPY_TRADE_ADDRESS, COPY_TRADE_ABI } from "@/lib/wagmi";
import { useState, useEffect } from "react";

interface FeedCardProps {
  item: FeedItem;
}

export function FeedCard({ item }: FeedCardProps) {
  const { isConnected, address } = useAccount();
  const { watchlist } = useWatchlist();
  const [copyStatus, setCopyStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const isBuy = item.side === "BUY";
  const actionColor = isBuy ? "text-emerald-600" : "text-red-600";
  const actionText = isBuy ? "Buy" : "Sell";

  // Find wallet label from watchlist
  const walletInfo = watchlist.find(
    (w) => w.address.toLowerCase() === item.trader.toLowerCase()
  );
  const displayName = walletInfo?.label || formatAddress(item.trader);

  // Update status based on transaction state
  useEffect(() => {
    if (isPending || isConfirming) {
      setCopyStatus("pending");
    } else if (isSuccess) {
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 3000);
    } else if (error) {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 3000);
    }
  }, [isPending, isConfirming, isSuccess, error]);

  const handleCopyTrade = async () => {
    if (!isConnected) {
      alert("Connect your wallet to copy trades");
      return;
    }

    // If no contract deployed, just open the market
    if (!COPY_TRADE_ADDRESS) {
      window.open(
        `https://polymarket.com/event/${item.market.marketSlug}`,
        "_blank"
      );
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 2000);
      return;
    }

    try {
      // Convert price to uint (scaled by 1e4)
      const priceScaled = Math.floor(parseFloat(item.price) * 10000);
      // Convert amount to uint (scaled by 1e6)
      const amountScaled = Math.floor(parseFloat(item.size) * parseFloat(item.price) * 1000000);
      // Convert tx hash to bytes32
      const txHash = item.transactionHash 
        ? (item.transactionHash.padEnd(66, '0') as `0x${string}`)
        : ('0x' + '0'.repeat(64)) as `0x${string}`;

      writeContract({
        address: COPY_TRADE_ADDRESS,
        abi: COPY_TRADE_ABI,
        functionName: "copyTrade",
        args: [
          item.trader as `0x${string}`,
          item.market.conditionId,
          item.outcome,
          item.side,
          BigInt(amountScaled),
          BigInt(priceScaled),
          txHash as `0x${string}`,
        ],
      });
    } catch (err) {
      console.error("Copy trade error:", err);
      setCopyStatus("error");
    }
  };

  const getButtonText = () => {
    switch (copyStatus) {
      case "pending":
        return "Copying...";
      case "success":
        return "Copied!";
      case "error":
        return "Failed";
      default:
        return "Copy Trade";
    }
  };

  const getButtonStyle = () => {
    switch (copyStatus) {
      case "pending":
        return "bg-neutral-100 text-neutral-400";
      case "success":
        return "bg-emerald-50 text-emerald-600";
      case "error":
        return "bg-red-50 text-red-600";
      default:
        return "bg-neutral-900 text-white hover:bg-neutral-800";
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <Link
          href={`/profile/${item.trader}`}
          className="flex items-center gap-3 hover:opacity-70 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-medium">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="text-sm font-medium text-neutral-900">
              {displayName}
            </span>
            {walletInfo && (
              <span className="text-xs text-neutral-400 ml-2">
                {formatAddress(item.trader)}
              </span>
            )}
            <p className="text-xs text-neutral-400">
              {formatRelativeTime(item.timestamp)}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${actionColor}`}>
            {actionText}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <h3 className="text-sm text-neutral-900 leading-snug mb-2">
          {item.market.question}
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className={actionColor}>
            {item.outcome} @ {formatPercent(item.price)}
          </span>
          <span className="text-neutral-300">·</span>
          <span className="text-neutral-500">
            {formatUSD(parseFloat(item.size) * parseFloat(item.price))}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span>Vol {formatUSD(item.market.volume)}</span>
          {item.transactionHash && (
            <a
              href={`https://polygonscan.com/tx/${item.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-600 transition-colors"
            >
              Tx
            </a>
          )}
        </div>
        
        <button
          onClick={handleCopyTrade}
          disabled={copyStatus === "pending"}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${getButtonStyle()}`}
        >
          {getButtonText()}
        </button>
      </div>

      {hash && (
        <div className="mt-2 pt-2 border-t border-neutral-100">
          <a
            href={`https://sepolia.basescan.org/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            View copy trade on Base Sepolia →
          </a>
        </div>
      )}
    </div>
  );
}
