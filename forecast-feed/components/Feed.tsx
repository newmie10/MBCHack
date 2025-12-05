"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { FeedCard } from "./FeedCard";
import { FeedItem, getMockFeedItems } from "@/lib/polymarket";
import { FORECAST_FOLLOW_ADDRESS, FORECAST_FOLLOW_ABI } from "@/lib/wagmi";

type FeedFilter = "all" | "following";

export function Feed() {
  const { address, isConnected } = useAccount();
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get list of followed addresses
  const { data: following } = useReadContract({
    address: FORECAST_FOLLOW_ADDRESS,
    abi: FORECAST_FOLLOW_ABI,
    functionName: "getFollowing",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!FORECAST_FOLLOW_ADDRESS,
    },
  });

  // Fetch feed data
  useEffect(() => {
    const fetchFeed = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from API first
        const response = await fetch("/api/feed");
        if (response.ok) {
          const data = await response.json();
          setFeedItems(data);
        } else {
          // Fall back to mock data
          setFeedItems(getMockFeedItems());
        }
      } catch (error) {
        console.error("Error fetching feed:", error);
        // Fall back to mock data
        setFeedItems(getMockFeedItems());
      }
      setIsLoading(false);
    };

    fetchFeed();
  }, []);

  // Filter feed items
  const filteredItems =
    filter === "following" && following
      ? feedItems.filter((item) =>
          (following as string[])
            .map((a) => a.toLowerCase())
            .includes(item.trader.toLowerCase())
        )
      : feedItems;

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilter("following")}
          disabled={!isConnected}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === "following"
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-white"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Following
          {following && (following as string[]).length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-zinc-700 rounded-full text-xs">
              {(following as string[]).length}
            </span>
          )}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800" />
                <div className="flex-1">
                  <div className="h-4 bg-zinc-800 rounded w-24 mb-2" />
                  <div className="h-3 bg-zinc-800 rounded w-16" />
                </div>
              </div>
              <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
              <div className="h-4 bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Feed Items */}
      {!isLoading && filteredItems.length > 0 && (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500 mb-2">
            {filter === "following"
              ? "No activity from forecasters you follow"
              : "No recent activity"}
          </p>
          {filter === "following" && (
            <button
              onClick={() => setFilter("all")}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all activity →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
