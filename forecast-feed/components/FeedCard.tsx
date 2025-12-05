"use client";

import Link from "next/link";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from "wagmi";
import {
  FeedItem,
  formatAddress,
  formatUSD,
  formatPercent,
  formatRelativeTime,
} from "@/lib/polymarket";
import { useWatchlist } from "@/lib/WatchlistContext";
import { COPY_TRADE_ADDRESS, COPY_TRADE_ABI, BASE_SEPOLIA_CHAIN_ID } from "@/lib/wagmi";
import { useState, useEffect } from "react";

interface FeedCardProps {
  item: FeedItem;
}

export function FeedCard({ item }: FeedCardProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { watchlist } = useWatchlist();
  const [copyStatus, setCopyStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const isBaseNetwork = chainId === BASE_SEPOLIA_CHAIN_ID;

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

    // Check if on Base Sepolia network when contract is deployed
    if (COPY_TRADE_ADDRESS && !isBaseNetwork) {
      alert("Please switch to Base Sepolia network to copy trades on-chain");
      return;
    }

    // If no contract deployed, just open the market with transaction ID
    if (!COPY_TRADE_ADDRESS) {
      // Use tradeId if available, otherwise fall back to timestamp in milliseconds
      const tid = item.tradeId || new Date(item.timestamp).getTime().toString();
      
      // Build Polymarket URL - prefer eventSlug, then marketSlug, with correct format
      let url: string;
      if (item.market.eventSlug) {
        // Use event URL format: /event/{event-slug}
        url = `https://polymarket.com/event/${item.market.eventSlug}${tid ? `?tid=${tid}` : ""}`;
      } else if (item.market.marketSlug) {
        // Use market URL format: /market/{market-slug}
        url = `https://polymarket.com/market/${item.market.marketSlug}${tid ? `?tid=${tid}` : ""}`;
      } else {
        url = `https://polymarket.com/market/${item.market.conditionId}${tid ? `?tid=${tid}` : ""}`;
      }
      
      window.open(url, "_blank");
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 2000);
      return;
    }

    try {
      // Validate required fields
      if (!item.trader || !item.market.conditionId || !item.outcome || !item.side) {
        setCopyStatus("error");
        setTimeout(() => setCopyStatus("idle"), 3000);
        return;
      }

      // Convert price to uint (scaled by 1e4)
      const priceScaled = Math.floor(parseFloat(item.price) * 10000);
      if (priceScaled <= 0 || isNaN(priceScaled)) {
        console.error("Invalid price:", item.price);
        setCopyStatus("error");
        setTimeout(() => setCopyStatus("idle"), 3000);
        return;
      }

      // Convert amount to uint (scaled by 1e6)
      const amountScaled = Math.floor(parseFloat(item.size) * parseFloat(item.price) * 1000000);
      if (amountScaled <= 0 || isNaN(amountScaled)) {
        console.error("Invalid amount:", item.size, item.price);
        setCopyStatus("error");
        setTimeout(() => setCopyStatus("idle"), 3000);
        return;
      }

      // Convert tx hash to bytes32 - ensure proper format
      let txHash: `0x${string}`;
      if (item.transactionHash) {
        // Remove 0x if present, pad to 64 chars, then add 0x
        const hashWithoutPrefix = item.transactionHash.replace(/^0x/, '');
        const paddedHash = hashWithoutPrefix.padEnd(64, '0').slice(0, 64);
        txHash = `0x${paddedHash}` as `0x${string}`;
      } else {
        txHash = ('0x' + '0'.repeat(64)) as `0x${string}`;
      }

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
          txHash,
        ],
      });
    } catch (err: any) {
      console.error("Copy trade error:", err);
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 3000);
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
          disabled={copyStatus === "pending" || (COPY_TRADE_ADDRESS && !isBaseNetwork)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${getButtonStyle()}`}
          title={COPY_TRADE_ADDRESS && !isBaseNetwork ? "Switch to Base Sepolia to copy trades" : undefined}
        >
          {getButtonText()}
        </button>
      </div>

      {hash && (
        <div className="mt-2 pt-2 border-t border-neutral-100 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              {isConfirming ? "Confirming transaction..." : isSuccess ? "Transaction confirmed!" : "Transaction pending..."}
            </span>
            <a
              href={`https://sepolia.basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors font-medium"
            >
              View on BaseScan →
            </a>
          </div>
          {isSuccess && (
            <p className="text-xs text-emerald-600">
              ✓ Copy trade recorded on Base Sepolia
            </p>
          )}
          {error && (
            <p className="text-xs text-red-600">
              ✗ Transaction failed. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
