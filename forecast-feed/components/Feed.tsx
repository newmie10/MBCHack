"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FeedCard } from "./FeedCard";
import { FeedItem } from "@/lib/polymarket";
import { useWatchlist } from "@/lib/WatchlistContext";

type FeedMode = "watchlist" | "all";

const formatFilterLabel = (value: number) => {
  if (value === 0) return "All trades";
  if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k+`;
  return `$${value}+`;
};

export function Feed() {
  const { watchlist, isLoaded } = useWatchlist();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<FeedMode>("all");
  const [minAmount, setMinAmount] = useState(10); // UI value (updates immediately)
  const [debouncedMinAmount, setDebouncedMinAmount] = useState(10); // Debounced value for API
  const [inputValue, setInputValue] = useState("10");
  const [showFilters, setShowFilters] = useState(false);
  const lastFetchRef = useRef<number>(0);

  // Debounce minAmount changes - only update after 500ms of no changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinAmount(minAmount);
    }, 500);
    return () => clearTimeout(timer);
  }, [minAmount]);

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
        response = await fetch(`/api/feed?minAmount=${debouncedMinAmount}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addresses }),
        });
      } else {
        // Fetch all recent trades with filters
        response = await fetch(`/api/feed?minAmount=${debouncedMinAmount}`);
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
  }, [mode, watchlist, debouncedMinAmount]);

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
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Segmented Control */}
        <div className="inline-flex gap-1 p-1 bg-neutral-100 rounded-full">
          <button
            onClick={() => setMode("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === "all"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            All Trades
          </button>
          <button
            onClick={() => setMode("watchlist")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === "watchlist"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            Watchlist ({watchlist.length})
          </button>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
            minAmount > 0
              ? "bg-blue-50 text-blue-700"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          {formatFilterLabel(minAmount)}
        </button>

        {/* Refresh Button */}
        <button
          onClick={() => fetchFeed(true)}
          disabled={isLoading}
          className="ml-auto px-4 py-2 rounded-full text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
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
        <div className="bg-neutral-50 rounded-2xl p-4 mb-4">
          <div className="flex flex-col gap-2">
            {/* Slider with floating bubble */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400 w-6">$0</span>
              <div className="flex-1 relative">
                {/* Floating bubble input */}
                <div 
                  className="absolute -top-7 -translate-x-1/2 transition-all duration-75 z-10"
                  style={{ left: `calc(${(minAmount / 10000) * 100}% + ${8 - (minAmount / 10000) * 16}px)` }}
                >
                  <div className="flex items-center px-2 py-1 bg-neutral-900 text-white rounded-full shadow-lg">
                    <span className="text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        const val = Math.min(10000, Math.max(0, parseInt(e.target.value) || 0));
                        setMinAmount(val);
                      }}
                      onBlur={() => {
                        const val = Math.min(10000, Math.max(0, parseInt(inputValue) || 0));
                        setInputValue(val.toString());
                        setMinAmount(val);
                      }}
                      style={{ width: `${Math.max(1, inputValue.length) * 0.6}em` }}
                      className="bg-transparent text-xs text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-1.5 h-1.5 bg-neutral-900 rotate-45" />
                </div>
                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="10"
                  value={minAmount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setMinAmount(val);
                    setInputValue(val.toString());
                  }}
                  className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-neutral-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm"
                />
              </div>
              <span className="text-xs text-neutral-400 w-6 text-right">$10k</span>
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
