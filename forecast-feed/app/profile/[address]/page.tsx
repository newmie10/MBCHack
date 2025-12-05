"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { FollowButton } from "@/components/FollowButton";
import { FeedCard } from "@/components/FeedCard";
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
  const { data: followers } = useReadContract({
    address: FORECAST_FOLLOW_ADDRESS,
    abi: FORECAST_FOLLOW_ABI,
    functionName: "getFollowers",
    args: [address as `0x${string}`],
    query: {
      enabled: !!FORECAST_FOLLOW_ADDRESS,
    },
  });

  // Get following count
  const { data: following } = useReadContract({
    address: FORECAST_FOLLOW_ADDRESS,
    abi: FORECAST_FOLLOW_ABI,
    functionName: "getFollowing",
    args: [address as `0x${string}`],
    query: {
      enabled: !!FORECAST_FOLLOW_ADDRESS,
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

      // Get mock trades for this address
      const mockTrades = getMockFeedItems().filter(
        (t) => t.trader.toLowerCase() === address.toLowerCase()
      );
      // If no matching trades, show some random ones as "their" activity
      setTrades(
        mockTrades.length > 0
          ? mockTrades
          : getMockFeedItems()
              .slice(0, 5)
              .map((t) => ({ ...t, trader: address }))
      );

      setIsLoading(false);
    };

    fetchData();
  }, [address]);

  const isOwnProfile = userAddress?.toLowerCase() === address.toLowerCase();
  const pnlColor =
    forecaster && forecaster.pnl >= 0 ? "text-green-400" : "text-red-400";
  const pnlPrefix = forecaster && forecaster.pnl >= 0 ? "+" : "";

  // Badges
  const badges = [];
  if (forecaster) {
    if (forecaster.winRate >= 0.6) {
      badges.push({ icon: "🏆", label: "High Win Rate", color: "yellow" });
    }
    if (forecaster.totalVolume >= 100000) {
      badges.push({ icon: "🐋", label: "Whale", color: "blue" });
    }
    if (forecaster.totalTrades >= 100) {
      badges.push({ icon: "⚡", label: "Active Trader", color: "purple" });
    }
    if (forecaster.pnl > 10000) {
      badges.push({ icon: "💰", label: "Top Performer", color: "green" });
    }
  }

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
              {address.slice(2, 4).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {formatAddress(address)}
              </h1>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <span>
                  <strong className="text-white">
                    {(followers as string[])?.length || 0}
                  </strong>{" "}
                  followers
                </span>
                <span>
                  <strong className="text-white">
                    {(following as string[])?.length || 0}
                  </strong>{" "}
                  following
                </span>
              </div>
            </div>
          </div>
          {!isOwnProfile && <FollowButton address={address} />}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {badges.map((badge, i) => (
              <span
                key={i}
                className={`px-3 py-1 bg-${badge.color}-500/20 text-${badge.color}-400 rounded-full text-sm font-medium`}
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
              <div key={i} className="bg-zinc-800 rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-zinc-700 rounded w-16 mb-2" />
                <div className="h-6 bg-zinc-700 rounded w-24" />
              </div>
            ))}
          </div>
        ) : (
          forecaster && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <p className="text-sm text-zinc-500 mb-1">Total Trades</p>
                <p className="text-xl font-bold text-white">
                  {forecaster.totalTrades}
                </p>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <p className="text-sm text-zinc-500 mb-1">Volume</p>
                <p className="text-xl font-bold text-white">
                  {formatUSD(forecaster.totalVolume)}
                </p>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <p className="text-sm text-zinc-500 mb-1">Win Rate</p>
                <p className="text-xl font-bold text-white">
                  {(forecaster.winRate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <p className="text-sm text-zinc-500 mb-1">P&L</p>
                <p className={`text-xl font-bold ${pnlColor}`}>
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
        <h2 className="text-lg font-semibold text-white mb-4">
          Recent Activity
        </h2>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse"
              >
                <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-zinc-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : trades.length > 0 ? (
          <div className="space-y-4">
            {trades.map((trade) => (
              <FeedCard key={trade.id} item={trade} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-500">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
}
