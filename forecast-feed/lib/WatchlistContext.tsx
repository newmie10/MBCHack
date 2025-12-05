"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  WatchedWallet,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  DEFAULT_WATCHED_WALLETS,
} from "./watchlist";

interface WatchlistContextType {
  watchlist: WatchedWallet[];
  addWallet: (wallet: WatchedWallet) => void;
  removeWallet: (address: string) => void;
  isWatched: (address: string) => boolean;
  resetToDefaults: () => void;
  isLoaded: boolean;
}

const WatchlistContext = createContext<WatchlistContextType | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchedWallet[]>(DEFAULT_WATCHED_WALLETS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setWatchlist(getWatchlist());
    setIsLoaded(true);
  }, []);

  const addWallet = (wallet: WatchedWallet) => {
    const updated = addToWatchlist(wallet);
    setWatchlist(updated);
  };

  const removeWallet = (address: string) => {
    const updated = removeFromWatchlist(address);
    setWatchlist(updated);
  };

  const isWatched = (address: string) => {
    return watchlist.some(
      (w) => w.address.toLowerCase() === address.toLowerCase()
    );
  };

  const resetToDefaults = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("forecast-feed-watchlist", JSON.stringify(DEFAULT_WATCHED_WALLETS));
    }
    setWatchlist(DEFAULT_WATCHED_WALLETS);
  };

  return (
    <WatchlistContext.Provider
      value={{ watchlist, addWallet, removeWallet, isWatched, resetToDefaults, isLoaded }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

// Default value for when context is not available (SSR/initial load)
const defaultContextValue: WatchlistContextType = {
  watchlist: DEFAULT_WATCHED_WALLETS,
  addWallet: () => {},
  removeWallet: () => {},
  isWatched: () => false,
  resetToDefaults: () => {},
  isLoaded: false,
};

export function useWatchlist(): WatchlistContextType {
  const context = useContext(WatchlistContext);
  // Return default value if context not available (SSR)
  if (!context) {
    return defaultContextValue;
  }
  return context;
}
