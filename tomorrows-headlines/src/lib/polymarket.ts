// Polymarket API Client
// Fetches live prediction market data

export interface PolymarketEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  image: string;
  markets: PolymarketMarket[];
}

export interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  active: boolean;
  closed: boolean;
  image?: string;
}

export interface FormattedMarket {
  id: string;
  question: string;
  yesPrice: number; // Probability as percentage (0-100)
  noPrice: number;
  volume: number;
  category?: string;
  image?: string;
}

const GAMMA_API_BASE = "https://gamma-api.polymarket.com";

function parsePrice(priceValue: unknown): number {
  if (typeof priceValue === 'number') {
    return priceValue > 1 ? priceValue : Math.round(priceValue * 100);
  }
  if (typeof priceValue === 'string') {
    const parsed = parseFloat(priceValue);
    if (!isNaN(parsed)) {
      return parsed > 1 ? Math.round(parsed) : Math.round(parsed * 100);
    }
  }
  return 0;
}

export async function fetchTopMarkets(limit: number = 20): Promise<FormattedMarket[]> {
  try {
    const response = await fetch(
      `${GAMMA_API_BASE}/events?limit=${limit}&active=true&closed=false&order=volume&ascending=false`,
      {
        headers: { "Accept": "application/json" },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const events: PolymarketEvent[] = await response.json();
    const markets: FormattedMarket[] = [];
    
    for (const event of events) {
      if (event.markets && event.markets.length > 0) {
        for (const market of event.markets) {
          if (market.active && !market.closed) {
            try {
              let yesPrice = 0;
              
              if (market.outcomePrices) {
                if (typeof market.outcomePrices === 'string') {
                  try {
                    const parsed = JSON.parse(market.outcomePrices);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      yesPrice = parsePrice(parsed[0]);
                    }
                  } catch {
                    // If not JSON, try direct parse
                    yesPrice = parsePrice(market.outcomePrices);
                  }
                } else if (Array.isArray(market.outcomePrices)) {
                  yesPrice = parsePrice((market.outcomePrices as unknown[])[0]);
                }
              }
              
              // Only include markets with interesting probabilities (5-95%)
              if (yesPrice >= 5 && yesPrice <= 95) {
                markets.push({
                  id: market.id,
                  question: market.question || event.title,
                  yesPrice,
                  noPrice: 100 - yesPrice,
                  volume: parseFloat(market.volume) || 0,
                  image: market.image || event.image,
                });
              }
            } catch (e) {
              console.error("Error parsing market:", e);
            }
          }
        }
      }
    }

    const sorted = markets
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit);
    
    // Use live data if we have enough interesting markets, otherwise use mock
    if (sorted.length >= 6) {
      return sorted;
    }
    
    // Blend with mock data if we don't have enough
    const mockData = getMockMarkets();
    return [...sorted, ...mockData].slice(0, limit);
  } catch (error) {
    console.error("Error fetching Polymarket data:", error);
    return getMockMarkets();
  }
}

export async function fetchMarketsByCategory(category: string): Promise<FormattedMarket[]> {
  try {
    const response = await fetch(
      `${GAMMA_API_BASE}/events?limit=50&active=true&closed=false&tag_slug=${category}`,
      {
        headers: { "Accept": "application/json" },
        cache: 'no-store',
      }
    );

    if (!response.ok) throw new Error(`Polymarket API error: ${response.status}`);

    const events: PolymarketEvent[] = await response.json();
    const markets: FormattedMarket[] = [];
    
    for (const event of events) {
      if (event.markets && event.markets.length > 0) {
        for (const market of event.markets) {
          if (market.active && !market.closed && market.outcomePrices) {
            try {
              let yesPrice = 50;
              if (typeof market.outcomePrices === 'string') {
                const parsed = JSON.parse(market.outcomePrices);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  yesPrice = parsePrice(parsed[0]);
                }
              }
              
              if (yesPrice >= 5 && yesPrice <= 95) {
                markets.push({
                  id: market.id,
                  question: market.question || event.title,
                  yesPrice,
                  noPrice: 100 - yesPrice,
                  volume: parseFloat(market.volume) || 0,
                  category,
                  image: market.image || event.image,
                });
              }
            } catch (e) {
              console.error("Error parsing market:", e);
            }
          }
        }
      }
    }

    return markets.sort((a, b) => b.volume - a.volume);
  } catch (error) {
    console.error("Error fetching category markets:", error);
    return [];
  }
}

// Mock data featuring current prediction market topics
function getMockMarkets(): FormattedMarket[] {
  return [
    {
      id: "mock-1",
      question: "Will Bitcoin reach $150,000 by end of 2025?",
      yesPrice: 34,
      noPrice: 66,
      volume: 15000000,
    },
    {
      id: "mock-2", 
      question: "Will the Federal Reserve cut rates in January 2025?",
      yesPrice: 72,
      noPrice: 28,
      volume: 8500000,
    },
    {
      id: "mock-3",
      question: "Will SpaceX launch Starship to orbit before March 2025?",
      yesPrice: 58,
      noPrice: 42,
      volume: 4200000,
    },
    {
      id: "mock-4",
      question: "Will AI model beat human experts at coding by 2025?",
      yesPrice: 45,
      noPrice: 55,
      volume: 3100000,
    },
    {
      id: "mock-5",
      question: "Will Ethereum reach $10,000 in 2025?",
      yesPrice: 23,
      noPrice: 77,
      volume: 6700000,
    },
    {
      id: "mock-6",
      question: "Will there be a major tech company bankruptcy in 2025?",
      yesPrice: 18,
      noPrice: 82,
      volume: 2900000,
    },
    {
      id: "mock-7",
      question: "Will unemployment rate exceed 5% in Q1 2025?",
      yesPrice: 31,
      noPrice: 69,
      volume: 1800000,
    },
    {
      id: "mock-8",
      question: "Will OpenAI release GPT-5 before July 2025?",
      yesPrice: 67,
      noPrice: 33,
      volume: 5400000,
    },
    {
      id: "mock-9",
      question: "Will Trump be inaugurated as President in January 2025?",
      yesPrice: 95,
      noPrice: 5,
      volume: 12000000,
    },
    {
      id: "mock-10",
      question: "Will gas prices exceed $4/gallon nationally by Summer 2025?",
      yesPrice: 42,
      noPrice: 58,
      volume: 1500000,
    },
    {
      id: "mock-11",
      question: "Will Apple release AR glasses in 2025?",
      yesPrice: 28,
      noPrice: 72,
      volume: 2200000,
    },
    {
      id: "mock-12",
      question: "Will there be a government shutdown in Q1 2025?",
      yesPrice: 35,
      noPrice: 65,
      volume: 3800000,
    },
  ];
}
