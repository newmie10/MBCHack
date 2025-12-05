"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { FollowButton } from "@/components/FollowButton";
import { FeedCard } from "@/components/FeedCard";
import { BaseNetworkStatus } from "@/components/BaseNetworkStatus";
import {
  formatAddress,
  formatUSD,
  getMockFeedItems,
  FeedItem,
} from "@/lib/polymarket";
import { FORECAST_FOLLOW_ADDRESS, FORECAST_FOLLOW_ABI } from "@/lib/wagmi";

interface ForecasterData {
  address: string;
  totalTrades: number;
  totalVolume: number;
  winRate: number;
  pnl: number;
}

export default function ProfilePage() {
  const params = useParams();
  const address = params.address as string;
  const { address: userAddress } = useAccount();

  const [forecaster, setForecaster] = useState<ForecasterData | null>(null);
  const [trades, setTrades] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get follower count
  const { data: followers, error: followersError } = useReadContract({
    address: FORECAST_FOLLOW_ADDRESS,
    abi: FORECAST_FOLLOW_ABI,
    functionName: "getFollowers",
    args: [address as `0x${string}`],
    query: {
      enabled: !!FORECAST_FOLLOW_ADDRESS && !!address,
      retry: 2,
    },
  });

  // Get following count
  const { data: following, error: followingError } = useReadContract({
    address: FORECAST_FOLLOW_ADDRESS,
    abi: FORECAST_FOLLOW_ABI,
    functionName: "getFollowing",
    args: [address as `0x${string}`],
    query: {
      enabled: !!FORECAST_FOLLOW_ADDRESS && !!address,
      retry: 2,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/forecaster/${address}`);
        if (response.ok) {
          const data = await response.json();
          setForecaster(data);
        }
      } catch (error) {
        console.error("Error fetching forecaster:", error);
      }

      // Get mock trades for this address - show 10 trades
      const mockTrades = getMockFeedItems().filter(
        (t) => t.trader.toLowerCase() === address.toLowerCase()
      );
      // If no matching trades, show some random ones as "their" activity
      setTrades(
        mockTrades.length > 0
          ? mockTrades
          : getMockFeedItems()
              .slice(0, 10)
              .map((t) => ({ ...t, trader: address }))
      );

      setIsLoading(false);
    };

    fetchData();
  }, [address]);

  const isOwnProfile = userAddress?.toLowerCase() === address.toLowerCase();
  const pnlColor =
    forecaster && forecaster.pnl >= 0 ? "text-emerald-600" : "text-red-600";
  const pnlPrefix = forecaster && forecaster.pnl >= 0 ? "+" : "";

  // Badges with proper Tailwind classes
  const getBadges = () => {
    const badges: { icon: string; label: string; bgClass: string; textClass: string }[] = [];
    if (forecaster) {
      if (forecaster.winRate >= 0.6) {
        badges.push({ icon: "🏆", label: "High Win Rate", bgClass: "bg-amber-50", textClass: "text-amber-700" });
      }
      if (forecaster.totalVolume >= 100000) {
        badges.push({ icon: "🐋", label: "Whale", bgClass: "bg-blue-50", textClass: "text-blue-700" });
      }
      if (forecaster.totalTrades >= 100) {
        badges.push({ icon: "⚡", label: "Active Trader", bgClass: "bg-purple-50", textClass: "text-purple-700" });
      }
      if (forecaster.pnl > 10000) {
        badges.push({ icon: "💰", label: "Top Performer", bgClass: "bg-emerald-50", textClass: "text-emerald-700" });
      }
    }
    return badges;
  };

  const badges = getBadges();

  return (
    <div className="max-w-3xl">
      {/* Back Link */}
      <Link 
        href="/leaderboard" 
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4 transition-colors"
      >
        ← Back to Leaderboard
      </Link>

      {/* Profile Header */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-xl">
              {address.slice(2, 4).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold text-neutral-900">
                  {formatAddress(address)}
                </h1>
                <a
                  href={`https://sepolia.basescan.org/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded hover:bg-blue-100 transition-colors"
                  title="View on BaseScan"
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 0L11.196 3V9L6 12L0.804 9V3L6 0Z" fill="currentColor"/>
                  </svg>
                  Base
                </a>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <span>
                  <strong className="text-neutral-900">
                    {(followers as string[])?.length || 0}
                  </strong>{" "}
                  followers
                </span>
                <span>
                  <strong className="text-neutral-900">
                    {(following as string[])?.length || 0}
                  </strong>{" "}
                  following
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BaseNetworkStatus />
            {!isOwnProfile && <FollowButton address={address} />}
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {badges.map((badge, i) => (
              <span
                key={i}
                className={`px-3 py-1 ${badge.bgClass} ${badge.textClass} rounded-full text-xs font-medium`}
              >
                {badge.icon} {badge.label}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-neutral-50 rounded-lg p-4">
                <div className="h-3 bg-neutral-200 rounded w-16 mb-2 skeleton" />
                <div className="h-6 bg-neutral-200 rounded w-20 skeleton" />
              </div>
            ))}
          </div>
        ) : (
          forecaster && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-400 mb-1">Total Trades</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {forecaster.totalTrades.toLocaleString()}
                </p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-400 mb-1">Volume</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatUSD(forecaster.totalVolume)}
                </p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-400 mb-1">Win Rate</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {(forecaster.winRate * 100).toFixed(0)}%
                </p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-xs text-neutral-400 mb-1">P&L</p>
                <p className={`text-lg font-semibold ${pnlColor}`}>
                  {pnlPrefix}
                  {formatUSD(Math.abs(forecaster.pnl))}
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Activity Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-neutral-900">
            Recent Activity
          </h2>
          <span className="text-xs text-neutral-400">
            {trades.length} trades
          </span>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-neutral-200 rounded-lg p-4"
              >
                <div className="h-4 bg-neutral-100 rounded w-3/4 mb-2 skeleton" />
                <div className="h-4 bg-neutral-100 rounded w-1/2 skeleton" />
              </div>
            ))}
          </div>
        ) : trades.length > 0 ? (
          <div className="space-y-3">
            {trades.map((trade) => (
              <FeedCard key={trade.id} item={trade} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-neutral-200 rounded-lg text-neutral-400 text-sm">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
}
