"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FeedCard } from "./FeedCard";
import { FeedItem } from "@/lib/polymarket";
import { useWatchlist } from "@/lib/WatchlistContext";

type FeedMode = "watchlist" | "all";

const MIN_AMOUNT_OPTIONS = [
  { value: "0", label: "All trades" },
  { value: "10", label: "$10+" },
  { value: "50", label: "$50+" },
  { value: "100", label: "$100+" },
  { value: "500", label: "$500+" },
  { value: "1000", label: "$1,000+" },
  { value: "5000", label: "$5,000+" },
  { value: "10000", label: "$10,000+" },
];

export function Feed() {
  const { watchlist, isLoaded } = useWatchlist();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<FeedMode>("all");
  const [minAmount, setMinAmount] = useState("10"); // Default $10 min
  const [showFilters, setShowFilters] = useState(false);
  const lastFetchRef = useRef<number>(0);

  const fetchFeed = useCallback(async (force = false) => {
    // Prevent duplicate fetches within 1 second unless forced
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 1000) return;
    lastFetchRef.current = now;

    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      if (mode === "watchlist" && watchlist.length > 0) {
        // Fetch trades for watchlist addresses
        const addresses = watchlist.map((w) => w.address);
        response = await fetch(`/api/feed?minAmount=${minAmount}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addresses }),
        });
      } else {
        // Fetch all recent trades with filters
        response = await fetch(`/api/feed?minAmount=${minAmount}`);
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setFeedItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching feed:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch trades");
      setFeedItems([]);
    }
    
    setIsLoading(false);
  }, [mode, watchlist, minAmount]);

  useEffect(() => {
    if (!isLoaded) return;
    fetchFeed(true);
  }, [isLoaded, fetchFeed]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchFeed(false), 30000);
    return () => clearInterval(interval);
  }, [fetchFeed]);

  return (
    <div>
      {/* Mode Toggle & Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setMode("all")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "all"
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300"
          }`}
        >
          All Trades
        </button>
        <button
          onClick={() => setMode("watchlist")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            mode === "watchlist"
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300"
          }`}
        >
          Watchlist ({watchlist.length})
        </button>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
            minAmount !== "0"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          {minAmount !== "0" ? MIN_AMOUNT_OPTIONS.find(o => o.value === minAmount)?.label : "Filters"}
        </button>

        {/* Refresh Button */}
        <button
          onClick={() => fetchFeed(true)}
          disabled={isLoading}
          className="ml-auto px-3 py-1.5 rounded-md text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isLoading ? "animate-spin" : ""}>
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
          </svg>
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-neutral-700">Min trade size:</label>
            <div className="flex flex-wrap gap-1.5">
              {MIN_AMOUNT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMinAmount(option.value)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    minAmount === option.value
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => fetchFeed(true)}
            className="mt-2 text-sm text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-neutral-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-neutral-100 rounded w-24 mb-2 animate-pulse" />
                  <div className="h-3 bg-neutral-100 rounded w-16 animate-pulse" />
                </div>
              </div>
              <div className="h-4 bg-neutral-100 rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-4 bg-neutral-100 rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Feed Items */}
      {!isLoading && !error && feedItems.length > 0 && (
        <div className="space-y-3">
          {feedItems.map((item, index) => (
            <FeedCard key={item.id || index} item={item} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && feedItems.length === 0 && (
        <div className="text-center py-12 bg-white border border-neutral-200 rounded-lg">
          <p className="text-neutral-500 mb-1">
            {mode === "watchlist" 
              ? "No trades from your watchlist" 
              : "No recent trades found"}
          </p>
          <p className="text-sm text-neutral-400">
            {mode === "watchlist" 
              ? "Try switching to 'All Trades' or add more wallets"
              : "Polymarket API may be unavailable"}
          </p>
        </div>
      )}

      {/* Live indicator */}
      {!isLoading && feedItems.length > 0 && (
        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-2 text-xs text-neutral-400">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live data from Polymarket • Updates every 30s
          </span>
        </div>
      )}
    </div>
  );
}
