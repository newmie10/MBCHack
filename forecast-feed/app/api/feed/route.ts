import { NextResponse } from "next/server";

const DATA_API = "https://data-api.polymarket.com";
const GAMMA_API = "https://gamma-api.polymarket.com";

interface PolymarketTrade {
  // Data API response fields
  proxyWallet?: string;
  side?: string;
  asset?: string;
  conditionId?: string;
  size?: number;
  price?: number;
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
  // Legacy CLOB fields (fallback)
  id?: string;
  asset_id?: string;
  market?: string;
  maker_address?: string;
  taker_address?: string;
  match_time?: string;
  created_at?: string;
  transaction_hash?: string;
}

interface PolymarketMarket {
  id?: string;
  question?: string;
  description?: string;
  outcomes?: string[];
  outcomePrices?: string[];
  volume?: string;
  liquidity?: string;
  endDate?: string;
  image?: string;
  slug?: string;
  marketSlug?: string;
  eventSlug?: string;
  conditionId?: string;
  clobTokenIds?: string[];
  active?: boolean;
  closed?: boolean;
}

// GET: Fetch all recent trades from Polymarket
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minAmount = searchParams.get("minAmount") || "10"; // Default $10 min
    const limit = searchParams.get("limit") || "30";
    
    console.log(`Fetching recent trades from Polymarket (min: $${minAmount})...`);
    
    // Build URL with filters - Data API supports filterType and filterAmount
    const apiUrl = new URL(`${DATA_API}/trades`);
    apiUrl.searchParams.set("limit", limit);
    if (parseFloat(minAmount) > 0) {
      apiUrl.searchParams.set("filterType", "CASH");
      apiUrl.searchParams.set("filterAmount", minAmount);
    }
    
    // Fetch recent trades from the public Data API (no auth required)
    const tradesResponse = await fetch(apiUrl.toString(), {
      headers: { 
        "Accept": "application/json",
        "User-Agent": "ForecastFeed/1.0"
      },
    });

    if (!tradesResponse.ok) {
      console.error("Polymarket trades API error:", tradesResponse.status, tradesResponse.statusText);
      return NextResponse.json({ 
        error: `Polymarket API returned ${tradesResponse.status}` 
      }, { status: 502 });
    }

    const tradesText = await tradesResponse.text();
    if (!tradesText) {
      return NextResponse.json({ error: "Empty response from Polymarket" }, { status: 502 });
    }

    let trades: PolymarketTrade[];
    try {
      trades = JSON.parse(tradesText);
    } catch {
      console.error("Failed to parse trades:", tradesText.slice(0, 200));
      return NextResponse.json({ error: "Invalid JSON from Polymarket" }, { status: 502 });
    }

    if (!Array.isArray(trades)) {
      console.error("Trades is not an array:", typeof trades);
      return NextResponse.json({ error: "Unexpected response format" }, { status: 502 });
    }

    console.log(`Fetched ${trades.length} trades`);

    // Fetch markets
    const marketsResponse = await fetch(`${GAMMA_API}/markets?limit=100&active=true`, {
      headers: { 
        "Accept": "application/json",
        "User-Agent": "ForecastFeed/1.0"
      },
    });

    let markets: PolymarketMarket[] = [];
    if (marketsResponse.ok) {
      const marketsText = await marketsResponse.text();
      try {
        markets = JSON.parse(marketsText);
        // Normalize volume fields for all markets
        markets = markets.map((market: any) => {
          if (!market.volume) {
            market.volume = market.volume24h || 
                           market.volumeUsd || 
                           market.volumeUSD || 
                           market.totalVolume ||
                           market.volume24 || 
                           "0";
          }
          return market;
        });
      } catch {
        console.error("Failed to parse markets");
      }
    }

    console.log(`Fetched ${markets.length} markets`);

    // Create token to market mapping
    const tokenToMarket = new Map<string, PolymarketMarket>();
    for (const market of markets) {
      if (market.clobTokenIds) {
        for (const tokenId of market.clobTokenIds) {
          tokenToMarket.set(tokenId, market);
        }
      }
      if (market.conditionId) {
        tokenToMarket.set(market.conditionId, market);
      }
      // Also map by market ID
      if (market.id) {
        tokenToMarket.set(market.id, market);
      }
    }

    // Helper function to fetch individual market data if needed
    const fetchMarketData = async (conditionId: string): Promise<PolymarketMarket | null> => {
      if (!conditionId || conditionId === "unknown") return null;
      try {
        const response = await fetch(`${GAMMA_API}/markets/${conditionId}`, {
          headers: { 
            "Accept": "application/json",
            "User-Agent": "ForecastFeed/1.0"
          },
        });
        if (response.ok) {
          const marketData = await response.json();
          // Polymarket API may return volume in different fields
          // Try to normalize volume field
          if (marketData && !marketData.volume) {
            // Check for alternative volume field names
            marketData.volume = marketData.volume24h || 
                               marketData.volumeUsd || 
                               marketData.volumeUSD || 
                               marketData.totalVolume ||
                               marketData.volume24 || 
                               "0";
          }
          return marketData;
        }
      } catch (error) {
        console.error(`Failed to fetch market ${conditionId}:`, error);
      }
      return null;
    };

    // Build feed items
    // Data API includes market info directly in trade response
    const feedItems = await Promise.all(trades.map(async (trade, index) => {
      // Try to get additional market info from our fetched markets
      let market = tokenToMarket.get(trade.conditionId || "") || 
                   tokenToMarket.get(trade.asset || "") ||
                   tokenToMarket.get(trade.asset_id || "") || 
                   tokenToMarket.get(trade.market || "");
      
      // Normalize volume field if market exists
      if (market && !market.volume) {
        market.volume = (market as any).volume24h || 
                       (market as any).volumeUsd || 
                       (market as any).volumeUSD || 
                       (market as any).totalVolume ||
                       (market as any).volume24 || 
                       "0";
      }
      
      // If market not found or volume is missing/zero, try to fetch individual market data
      const conditionId = trade.conditionId || trade.asset || trade.asset_id || trade.market;
      if ((!market || !market.volume || market.volume === "0") && conditionId) {
        const fetchedMarket = await fetchMarketData(conditionId);
        if (fetchedMarket) {
          market = fetchedMarket;
        }
      }
      
      // Use market volume only - no fallback to trade volume
      const finalVolume = market?.volume || "0";
      
      // Convert timestamp (Unix seconds) to ISO string
      const timestampStr = trade.timestamp 
        ? new Date(trade.timestamp * 1000).toISOString()
        : trade.match_time || trade.created_at || new Date().toISOString();
      
      // Get trade ID for Polymarket URL tid parameter (use id if available, otherwise timestamp in ms)
      const tradeId = trade.id || (trade.timestamp ? String(trade.timestamp * 1000) : undefined);
      
      // Determine URL slug - prefer eventSlug from trade, then slug from trade, then slug from market
      const eventSlug = trade.eventSlug || "";
      const marketSlug = trade.slug || market?.slug || market?.marketSlug || "";
      
      return {
        id: trade.transactionHash || trade.transaction_hash || trade.id || `trade-${index}-${Date.now()}`,
        type: "trade",
        trader: trade.proxyWallet || trade.maker_address || trade.taker_address || "Unknown",
        traderName: trade.name || trade.pseudonym || undefined,
        market: {
          id: market?.id || trade.conditionId || trade.asset_id || "unknown",
          question: trade.title || market?.question || `Market ${(trade.conditionId || trade.asset_id || "").slice(0, 10)}...`,
          description: market?.description || "",
          outcomes: market?.outcomes || ["Yes", "No"],
          outcomePrices: market?.outcomePrices || ["0.5", "0.5"],
          volume: finalVolume,
          liquidity: market?.liquidity || "0",
          endDate: market?.endDate || "",
          image: market?.image || trade.icon || "",
          icon: trade.icon || "",
          active: market?.active ?? true,
          closed: market?.closed ?? false,
          marketSlug: marketSlug,
          eventSlug: eventSlug,
          conditionId: trade.conditionId || market?.conditionId || trade.market || trade.asset_id || "",
        },
        outcome: trade.outcome || "Yes",
        side: (trade.side as "BUY" | "SELL") || "BUY",
        size: String(trade.size ?? "0"),
        price: String(trade.price ?? "0.5"),
        timestamp: timestampStr,
        transactionHash: trade.transactionHash || trade.transaction_hash,
        tradeId: tradeId,
      };
    }));

    return NextResponse.json(feedItems);
  } catch (error) {
    console.error("Feed API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Polymarket", details: String(error) },
      { status: 500 }
    );
  }
}

// POST: Fetch trades for specific addresses
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minAmount = searchParams.get("minAmount") || "10"; // Default $10 min
    
    let addresses: string[] = [];
    
    try {
      const body = await request.json();
      addresses = body.addresses || [];
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json({ error: "No addresses provided" }, { status: 400 });
    }

    // Build URL with filters
    const apiUrl = new URL(`${DATA_API}/trades`);
    apiUrl.searchParams.set("limit", "100");
    if (parseFloat(minAmount) > 0) {
      apiUrl.searchParams.set("filterType", "CASH");
      apiUrl.searchParams.set("filterAmount", minAmount);
    }

    // For now, fetch all trades and filter by addresses
    // (Polymarket API doesn't support filtering by multiple makers efficiently)
    const tradesResponse = await fetch(apiUrl.toString(), {
      headers: { 
        "Accept": "application/json",
        "User-Agent": "ForecastFeed/1.0"
      },
    });

    if (!tradesResponse.ok) {
      return NextResponse.json({ 
        error: `Polymarket API returned ${tradesResponse.status}` 
      }, { status: 502 });
    }

    const tradesText = await tradesResponse.text();
    let trades: PolymarketTrade[];
    try {
      trades = JSON.parse(tradesText);
    } catch {
      return NextResponse.json({ error: "Invalid JSON from Polymarket" }, { status: 502 });
    }

    if (!Array.isArray(trades)) {
      return NextResponse.json({ error: "Unexpected response format" }, { status: 502 });
    }

    // Filter trades by watched addresses
    const watchedSet = new Set(addresses.map(a => a.toLowerCase()));
    const filteredTrades = trades.filter(trade => {
      const proxy = (trade.proxyWallet || "").toLowerCase();
      const maker = (trade.maker_address || "").toLowerCase();
      const taker = (trade.taker_address || "").toLowerCase();
      return watchedSet.has(proxy) || watchedSet.has(maker) || watchedSet.has(taker);
    });

    // Fetch markets
    const marketsResponse = await fetch(`${GAMMA_API}/markets?limit=100&active=true`, {
      headers: { 
        "Accept": "application/json",
        "User-Agent": "ForecastFeed/1.0"
      },
    });

    let markets: PolymarketMarket[] = [];
    if (marketsResponse.ok) {
      try {
        markets = await marketsResponse.json();
        // Normalize volume fields for all markets
        markets = markets.map((market: any) => {
          if (!market.volume) {
            market.volume = market.volume24h || 
                           market.volumeUsd || 
                           market.volumeUSD || 
                           market.totalVolume ||
                           market.volume24 || 
                           "0";
          }
          return market;
        });
      } catch {
        // ignore
      }
    }

    const tokenToMarket = new Map<string, PolymarketMarket>();
    for (const market of markets) {
      if (market.clobTokenIds) {
        for (const tokenId of market.clobTokenIds) {
          tokenToMarket.set(tokenId, market);
        }
      }
      if (market.conditionId) {
        tokenToMarket.set(market.conditionId, market);
      }
      // Also map by market ID
      if (market.id) {
        tokenToMarket.set(market.id, market);
      }
    }

    // Helper function to fetch individual market data if needed
    const fetchMarketData = async (conditionId: string): Promise<PolymarketMarket | null> => {
      if (!conditionId || conditionId === "unknown") return null;
      try {
        const response = await fetch(`${GAMMA_API}/markets/${conditionId}`, {
          headers: { 
            "Accept": "application/json",
            "User-Agent": "ForecastFeed/1.0"
          },
        });
        if (response.ok) {
          const marketData = await response.json();
          // Polymarket API may return volume in different fields
          // Try to normalize volume field
          if (marketData && !marketData.volume) {
            // Check for alternative volume field names
            marketData.volume = marketData.volume24h || 
                               marketData.volumeUsd || 
                               marketData.volumeUSD || 
                               marketData.totalVolume ||
                               marketData.volume24 || 
                               "0";
          }
          return marketData;
        }
      } catch (error) {
        console.error(`Failed to fetch market ${conditionId}:`, error);
      }
      return null;
    };

    const feedItems = await Promise.all(filteredTrades.map(async (trade, index) => {
      let market = tokenToMarket.get(trade.conditionId || "") || 
                   tokenToMarket.get(trade.asset || "") ||
                   tokenToMarket.get(trade.asset_id || "") || 
                   tokenToMarket.get(trade.market || "");
      
      // Normalize volume field if market exists
      if (market && !market.volume) {
        market.volume = (market as any).volume24h || 
                       (market as any).volumeUsd || 
                       (market as any).volumeUSD || 
                       (market as any).totalVolume ||
                       (market as any).volume24 || 
                       "0";
      }
      
      // If market not found or volume is missing/zero, try to fetch individual market data
      const conditionId = trade.conditionId || trade.asset || trade.asset_id || trade.market;
      if ((!market || !market.volume || market.volume === "0") && conditionId) {
        const fetchedMarket = await fetchMarketData(conditionId);
        if (fetchedMarket) {
          market = fetchedMarket;
        }
      }
      
      // Use market volume only - no fallback to trade volume
      const finalVolume = market?.volume || "0";
      
      // Convert timestamp (Unix seconds) to ISO string
      const timestampStr = trade.timestamp 
        ? new Date(trade.timestamp * 1000).toISOString()
        : trade.match_time || trade.created_at || new Date().toISOString();
      
      // Get trade ID for Polymarket URL tid parameter (use id if available, otherwise timestamp in ms)
      const tradeId = trade.id || (trade.timestamp ? String(trade.timestamp * 1000) : undefined);
      
      // Determine URL slug - prefer eventSlug from trade, then slug from trade, then slug from market
      const eventSlug = trade.eventSlug || "";
      const marketSlug = trade.slug || market?.slug || market?.marketSlug || "";
      
      return {
        id: trade.transactionHash || trade.transaction_hash || trade.id || `trade-${index}-${Date.now()}`,
        type: "trade",
        trader: trade.proxyWallet || trade.maker_address || trade.taker_address || "Unknown",
        traderName: trade.name || trade.pseudonym || undefined,
        market: {
          id: market?.id || trade.conditionId || trade.asset_id || "unknown",
          question: trade.title || market?.question || `Market ${(trade.conditionId || trade.asset_id || "").slice(0, 10)}...`,
          description: market?.description || "",
          outcomes: market?.outcomes || ["Yes", "No"],
          outcomePrices: market?.outcomePrices || ["0.5", "0.5"],
          volume: finalVolume,
          liquidity: market?.liquidity || "0",
          endDate: market?.endDate || "",
          image: market?.image || trade.icon || "",
          icon: trade.icon || "",
          active: market?.active ?? true,
          closed: market?.closed ?? false,
          marketSlug: marketSlug,
          eventSlug: eventSlug,
          conditionId: trade.conditionId || market?.conditionId || trade.market || trade.asset_id || "",
        },
        outcome: trade.outcome || "Yes",
        side: (trade.side as "BUY" | "SELL") || "BUY",
        size: String(trade.size ?? "0"),
        price: String(trade.price ?? "0.5"),
        timestamp: timestampStr,
        transactionHash: trade.transactionHash || trade.transaction_hash,
        tradeId: tradeId,
      };
    }));

    return NextResponse.json(feedItems);
  } catch (error) {
    console.error("Feed API POST error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trades", details: String(error) },
      { status: 500 }
    );
  }
}
