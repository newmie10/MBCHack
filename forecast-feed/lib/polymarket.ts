// Polymarket API integration
// Documentation: https://docs.polymarket.com/

const GAMMA_API = "https://gamma-api.polymarket.com";
const DATA_API = "https://data-api.polymarket.com";

export interface Market {
  id: string;
  question: string;
  description: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: string;
  liquidity: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  marketSlug: string;
  conditionId: string;
}

export interface Trade {
  // Data API fields
  proxyWallet?: string;
  side: "BUY" | "SELL";
  asset?: string;
  conditionId?: string;
  size: string | number;
  price: string | number;
  timestamp?: number;
  title?: string;
  slug?: string;
  icon?: string;
  eventSlug?: string;
  outcome?: string;
  outcomeIndex?: number;
  name?: string;
  pseudonym?: string;
  transactionHash?: string;
  // Legacy CLOB fields (for compatibility)
  id?: string;
  taker_order_id?: string;
  market?: string;
  asset_id?: string;
  fee_rate_bps?: string;
  status?: string;
  match_time?: string;
  last_update?: string;
  maker_address?: string;
  trader_address?: string;
  transaction_hash?: string;
  bucket_index?: number;
}

export interface ForecasterStats {
  address: string;
  totalTrades: number;
  totalVolume: number;
  profitLoss: number;
  winRate: number;
  positions: Position[];
}

export interface Position {
  market: string;
  marketQuestion: string;
  outcome: string;
  size: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
}

export interface FeedItem {
  id: string;
  type: "trade" | "position";
  trader: string;
  market: Market;
  outcome: string;
  side: "BUY" | "SELL";
  size: string;
  price: string;
  timestamp: string;
  transactionHash?: string;
}

// Fetch active markets from Polymarket
export async function fetchMarkets(limit = 20): Promise<Market[]> {
  try {
    const response = await fetch(
      `${GAMMA_API}/markets?limit=${limit}&active=true&closed=false`,
      { next: { revalidate: 60 } }
    );
    if (!response.ok) throw new Error("Failed to fetch markets");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching markets:", error);
    return [];
  }
}

// Fetch a single market by condition ID
export async function fetchMarket(conditionId: string): Promise<Market | null> {
  try {
    const response = await fetch(`${GAMMA_API}/markets/${conditionId}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error("Failed to fetch market");
    return response.json();
  } catch (error) {
    console.error("Error fetching market:", error);
    return null;
  }
}

// Fetch recent trades from Data API (public, no auth required)
export async function fetchRecentTrades(limit = 50): Promise<Trade[]> {
  try {
    const response = await fetch(`${DATA_API}/trades?limit=${limit}`, {
      next: { revalidate: 30 },
    });
    if (!response.ok) throw new Error("Failed to fetch trades");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching trades:", error);
    return [];
  }
}

// Fetch trades for a specific trader using Data API (public, no auth required)
export async function fetchTraderTrades(
  traderAddress: string,
  limit = 50
): Promise<Trade[]> {
  try {
    // Data API uses 'user' parameter for filtering by address
    const response = await fetch(
      `${DATA_API}/trades?user=${traderAddress}&limit=${limit}`,
      { next: { revalidate: 30 } }
    );
    if (!response.ok) throw new Error("Failed to fetch trader trades");
    return response.json();
  } catch (error) {
    console.error("Error fetching trader trades:", error);
    return [];
  }
}

// Build feed items combining market and trade data
export async function buildFeedItems(trades: Trade[]): Promise<FeedItem[]> {
  const markets = await fetchMarkets(100);
  const marketMap = new Map(markets.map((m) => [m.conditionId, m]));

  const feedItems: FeedItem[] = [];
  
  for (const trade of trades) {
    // Try to get market from conditionId or market field
    const market = marketMap.get(trade.conditionId || "") || marketMap.get(trade.market || "");
    
    // Build market object from trade data if not found in markets
    const marketData: Market = market || {
      id: trade.conditionId || trade.market || "unknown",
      question: trade.title || `Market ${(trade.conditionId || trade.market || "").slice(0, 10)}...`,
      description: "",
      outcomes: ["Yes", "No"],
      outcomePrices: ["0.5", "0.5"],
      volume: "0",
      liquidity: "0",
      endDate: "",
      image: trade.icon || "",
      icon: trade.icon || "",
      active: true,
      closed: false,
      marketSlug: trade.slug || "",
      conditionId: trade.conditionId || trade.market || "",
    };

    // Convert timestamp to ISO string
    const timestampStr = trade.timestamp 
      ? new Date(trade.timestamp * 1000).toISOString()
      : trade.match_time || trade.last_update || new Date().toISOString();

    feedItems.push({
      id: trade.transactionHash || trade.transaction_hash || trade.id || `trade-${Date.now()}`,
      type: "trade" as const,
      trader: trade.proxyWallet || trade.trader_address || trade.maker_address || "Unknown",
      market: marketData,
      outcome: trade.outcome || (trade.asset_id === "0" ? "Yes" : "No"),
      side: trade.side,
      size: String(trade.size),
      price: String(trade.price),
      timestamp: timestampStr,
      transactionHash: trade.transactionHash || trade.transaction_hash,
    });
  }
  
  return feedItems;
}

// Mock data for demo/development when API is unavailable
export function getMockFeedItems(): FeedItem[] {
  const mockMarkets: Market[] = [
    {
      id: "1",
      question: "Will Bitcoin reach $150,000 by end of 2025?",
      description: "This market resolves to Yes if Bitcoin reaches $150k",
      outcomes: ["Yes", "No"],
      outcomePrices: ["0.42", "0.58"],
      volume: "2500000",
      liquidity: "500000",
      endDate: "2025-12-31T23:59:59Z",
      image: "",
      icon: "₿",
      active: true,
      closed: false,
      marketSlug: "btc-150k-2025",
      conditionId: "0x1234",
    },
    {
      id: "2",
      question: "Will the Fed cut rates in January 2025?",
      description: "Federal Reserve interest rate decision",
      outcomes: ["Yes", "No"],
      outcomePrices: ["0.35", "0.65"],
      volume: "1800000",
      liquidity: "350000",
      endDate: "2025-01-31T23:59:59Z",
      image: "",
      icon: "🏦",
      active: true,
      closed: false,
      marketSlug: "fed-rate-cut-jan-2025",
      conditionId: "0x2345",
    },
    {
      id: "3",
      question: "Will Ethereum ETF approval happen in Q1 2025?",
      description: "SEC approval of spot Ethereum ETF",
      outcomes: ["Yes", "No"],
      outcomePrices: ["0.72", "0.28"],
      volume: "3200000",
      liquidity: "620000",
      endDate: "2025-03-31T23:59:59Z",
      image: "",
      icon: "Ξ",
      active: true,
      closed: false,
      marketSlug: "eth-etf-q1-2025",
      conditionId: "0x3456",
    },
    {
      id: "4",
      question: "Will AI pass the Turing test by 2026?",
      description: "Formal Turing test administered by recognized body",
      outcomes: ["Yes", "No"],
      outcomePrices: ["0.28", "0.72"],
      volume: "890000",
      liquidity: "180000",
      endDate: "2026-12-31T23:59:59Z",
      image: "",
      icon: "🤖",
      active: true,
      closed: false,
      marketSlug: "ai-turing-2026",
      conditionId: "0x4567",
    },
    {
      id: "5",
      question: "Will SpaceX Starship reach orbit in December 2024?",
      description: "Successful orbital flight of Starship",
      outcomes: ["Yes", "No"],
      outcomePrices: ["0.85", "0.15"],
      volume: "1500000",
      liquidity: "290000",
      endDate: "2024-12-31T23:59:59Z",
      image: "",
      icon: "🚀",
      active: true,
      closed: false,
      marketSlug: "starship-orbit-dec-2024",
      conditionId: "0x5678",
    },
  ];

  const mockTraders = [
    "0x1234567890abcdef1234567890abcdef12345678",
    "0xabcdef1234567890abcdef1234567890abcdef12",
    "0x9876543210fedcba9876543210fedcba98765432",
    "0xfedcba9876543210fedcba9876543210fedcba98",
    "0x5555555555555555555555555555555555555555",
  ];

  const sides: ("BUY" | "SELL")[] = ["BUY", "SELL"];
  const outcomes = ["Yes", "No"];

  return Array.from({ length: 20 }, (_, i) => ({
    id: `mock-${i}`,
    type: "trade" as const,
    trader: mockTraders[i % mockTraders.length],
    market: mockMarkets[i % mockMarkets.length],
    outcome: outcomes[Math.floor(Math.random() * 2)],
    side: sides[Math.floor(Math.random() * 2)],
    size: (Math.random() * 1000 + 100).toFixed(2),
    price: (Math.random() * 0.5 + 0.25).toFixed(2),
    timestamp: new Date(
      Date.now() - Math.random() * 86400000 * 3
    ).toISOString(),
    transactionHash: `0x${Math.random().toString(16).slice(2)}`,
  }));
}

// Format address for display
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format currency
export function formatUSD(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// Format percentage
export function formatPercent(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `${(num * 100).toFixed(1)}%`;
}

// Format relative time
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}
