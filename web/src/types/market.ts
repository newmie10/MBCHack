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
};

