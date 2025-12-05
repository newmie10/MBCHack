// Watchlist management and top trader data

export interface WatchedWallet {
  address: string;
  label: string;
  description?: string;
  stats?: {
    winRate: number;
    totalVolume: number;
    pnl: number;
  };
}

// Top Polymarket traders - known high-performing wallets
// These are example addresses - replace with real Polymarket traders
export const DEFAULT_WATCHED_WALLETS: WatchedWallet[] = [
  {
    address: "0x566b19c0CfC6F8dCd7411EA8Dfb81C01D25a6C48",
    label: "Theo",
    description: "High volume political markets",
    stats: { winRate: 0.71, totalVolume: 8200000, pnl: 1420000 },
  },
  {
    address: "0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69",
    label: "Whale",
    description: "Large positions, election markets",
    stats: { winRate: 0.62, totalVolume: 12500000, pnl: 2100000 },
  },
  {
    address: "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF",
    label: "Oracle",
    description: "Consistent across categories",
    stats: { winRate: 0.65, totalVolume: 3200000, pnl: 520000 },
  },
  {
    address: "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",
    label: "Sharp",
    description: "Quick on breaking news",
    stats: { winRate: 0.74, totalVolume: 1800000, pnl: 340000 },
  },
];

const WATCHLIST_KEY = "forecast-feed-watchlist";

export function getWatchlist(): WatchedWallet[] {
  if (typeof window === "undefined") return DEFAULT_WATCHED_WALLETS;
  
  const stored = localStorage.getItem(WATCHLIST_KEY);
  if (!stored) {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(DEFAULT_WATCHED_WALLETS));
    return DEFAULT_WATCHED_WALLETS;
  }
  
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_WATCHED_WALLETS;
  }
}

export function saveWatchlist(wallets: WatchedWallet[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(wallets));
}

export function addToWatchlist(wallet: WatchedWallet): WatchedWallet[] {
  const current = getWatchlist();
  const exists = current.some(
    (w) => w.address.toLowerCase() === wallet.address.toLowerCase()
  );
  
  if (exists) return current;
  
  const updated = [...current, wallet];
  saveWatchlist(updated);
  return updated;
}

export function removeFromWatchlist(address: string): WatchedWallet[] {
  const current = getWatchlist();
  const updated = current.filter(
    (w) => w.address.toLowerCase() !== address.toLowerCase()
  );
  saveWatchlist(updated);
  return updated;
}

export function isWatched(address: string): boolean {
  const watchlist = getWatchlist();
  return watchlist.some(
    (w) => w.address.toLowerCase() === address.toLowerCase()
  );
}

