export type Market = {
  id: string;
  question: string;
  description?: string | null;
  outcomes: string[];
  prices: number[];
  bestBid?: number | null;
  bestAsk?: number | null;
  volume24hr?: number | null;
  volumeNum?: number | null;
  liquidityNum?: number | null;
  endDate?: string | null;
  slug?: string | null;
};

export type ScoredMarket = Market & {
  score?: number;
  rationale?: string;
  tags?: string[];
  loading?: boolean;
  error?: string;
  sentimentScore?: number;
  sentimentRationale?: string;
  sentimentTags?: string[];
  sentimentLoading?: boolean;
  sentimentError?: string;
  brief?: string;
  briefRisk?: string;
  briefAction?: string;
  briefConfidence?: number;
  briefLoading?: boolean;
  briefError?: string;
};

export type ChatMessage = {
  id: string;
  marketId: string;
  nickname: string;
  body: string;
  createdAt: string;
};

export type Trade = {
  id: string;
  marketId: string;
  marketQuestion?: string;
  marketSlug?: string;
  outcome: string;
  price: number;
  size: number;
  notional: number;
  takerSide: "buy" | "sell";
  trader?: string;
  timestamp: string;
  odds?: number;
};

