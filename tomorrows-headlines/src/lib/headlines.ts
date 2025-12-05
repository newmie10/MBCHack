// AI Headline Generator
// Transforms prediction market data into newspaper headlines

import { FormattedMarket } from "./polymarket";

export interface Headline {
  id: string;
  title: string;
  subtitle: string;
  probability: number;
  marketQuestion: string;
  category: HeadlineCategory;
  tone: "positive" | "negative" | "neutral";
}

export type HeadlineCategory = 
  | "politics"
  | "crypto"
  | "tech"
  | "sports"
  | "finance"
  | "world"
  | "science";

export interface NewspaperEdition {
  date: string;
  headlines: Headline[];
  leadStory: Headline;
  timestamp: number;
}

// Shuffle array randomly
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Pick random item from array
function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate headlines client-side using market data
export function generateHeadlinesFromMarkets(markets: FormattedMarket[]): Headline[] {
  // Shuffle markets to get different headlines each refresh
  const shuffledMarkets = shuffle(markets);
  
  return shuffledMarkets.map((market) => {
    const category = detectCategory(market.question);
    const tone = market.yesPrice >= 50 ? "positive" : "negative";
    const headline = transformToHeadline(market, category);
    
    return {
      id: market.id,
      title: headline.title,
      subtitle: headline.subtitle,
      probability: market.yesPrice,
      marketQuestion: market.question,
      category,
      tone,
    };
  });
}

function detectCategory(question: string): HeadlineCategory {
  const q = question.toLowerCase();
  
  if (q.includes("bitcoin") || q.includes("ethereum") || q.includes("crypto") || q.includes("btc") || q.includes("eth") || q.includes("solana") || q.includes("token")) {
    return "crypto";
  }
  if (q.includes("president") || q.includes("congress") || q.includes("election") || q.includes("trump") || q.includes("biden") || q.includes("senate") || q.includes("governor") || q.includes("republican") || q.includes("democrat")) {
    return "politics";
  }
  if (q.includes("ai") || q.includes("openai") || q.includes("google") || q.includes("apple") || q.includes("microsoft") || q.includes("spacex") || q.includes("tesla") || q.includes("meta") || q.includes("nvidia")) {
    return "tech";
  }
  if (q.includes("fed") || q.includes("rate") || q.includes("stock") || q.includes("market") || q.includes("economy") || q.includes("inflation") || q.includes("gdp") || q.includes("recession")) {
    return "finance";
  }
  if (q.includes("super bowl") || q.includes("nba") || q.includes("nfl") || q.includes("world cup") || q.includes("championship") || q.includes("olympics") || q.includes("f1") || q.includes("driver") || q.includes("win the") || q.includes("world series")) {
    return "sports";
  }
  if (q.includes("climate") || q.includes("nasa") || q.includes("space") || q.includes("mars") || q.includes("research") || q.includes("science")) {
    return "science";
  }
  
  return "world";
}

interface HeadlineText {
  title: string;
  subtitle: string;
}

// Headline templates for variety
const headlineVerbs = {
  likely: ["SET TO", "POISED TO", "EXPECTED TO", "LIKELY TO", "ON TRACK TO"],
  unlikely: ["MAY NOT", "UNLIKELY TO", "FACES HURDLES TO", "STRUGGLES TO", "LONG SHOT TO"],
  neutral: ["COULD", "MIGHT", "MAY", "EYES", "TARGETS"]
};

function getVerb(prob: number): string {
  if (prob >= 65) return pickRandom(headlineVerbs.likely);
  if (prob <= 35) return pickRandom(headlineVerbs.unlikely);
  return pickRandom(headlineVerbs.neutral);
}

// Clean up market question for display
function cleanQuestion(question: string): string {
  return question
    .replace(/^Will /i, '')
    .replace(/\?$/, '')
    .trim();
}

// Generate a descriptive subtitle that includes the actual question
function getDescriptiveSubtitle(prob: number, question: string): string {
  const cleanedQ = cleanQuestion(question);
  const templates = [
    `"${cleanedQ}" — traders give this ${prob}% odds`,
    `Market question: "${cleanedQ}" currently at ${prob}%`,
    `${prob}% probability that ${cleanedQ.toLowerCase()}`,
    `Bettors assign ${prob}% chance: "${cleanedQ}"`,
  ];
  return pickRandom(templates);
}

function transformToHeadline(market: FormattedMarket, category: HeadlineCategory): HeadlineText {
  const q = market.question.toLowerCase();
  const prob = market.yesPrice;
  const verb = getVerb(prob);
  const isLikely = prob >= 50;
  const cleanedQuestion = cleanQuestion(market.question);
  
  // Crypto headlines
  if (category === "crypto") {
    if (q.includes("bitcoin")) {
      const targets = ["$100K", "$150K", "$200K", "NEW HIGHS", "SIX FIGURES"];
      const target = q.includes("150") ? "$150K" : q.includes("100") ? "$100K" : pickRandom(targets);
      return {
        title: `BITCOIN ${verb} REACH ${target}`,
        subtitle: `"${cleanedQuestion}" — prediction markets say ${prob}%`
      };
    }
    if (q.includes("ethereum") || q.includes("eth")) {
      return {
        title: `ETHEREUM ${verb} ${isLikely ? "SURGE" : "STALL"}`,
        subtitle: `"${cleanedQuestion}" — current odds: ${prob}%`
      };
    }
    return {
      title: `CRYPTO ${isLikely ? "BULLS CHARGE" : "BEARS CIRCLE"}: ${prob}%`,
      subtitle: getDescriptiveSubtitle(prob, market.question)
    };
  }
  
  // Politics headlines
  if (category === "politics") {
    if (q.includes("trump")) {
      return {
        title: `TRUMP ${verb} ${isLikely ? "PREVAIL" : "FACE SETBACK"}`,
        subtitle: `"${cleanedQuestion}" — markets at ${prob}%`
      };
    }
    if (q.includes("biden")) {
      return {
        title: `BIDEN ADMINISTRATION ${isLikely ? "ADVANCES" : "STALLS"}`,
        subtitle: `"${cleanedQuestion}" — ${prob}% odds`
      };
    }
    return {
      title: `POLITICAL ${isLikely ? "MOMENTUM BUILDS" : "UNCERTAINTY GROWS"}`,
      subtitle: getDescriptiveSubtitle(prob, market.question)
    };
  }
  
  // Tech headlines
  if (category === "tech") {
    if (q.includes("openai") || q.includes("gpt") || q.includes("ai")) {
      return {
        title: `AI BREAKTHROUGH ${verb} ${isLikely ? "ARRIVE" : "DELAY"}`,
        subtitle: `"${cleanedQuestion}" — traders say ${prob}%`
      };
    }
    if (q.includes("spacex") || q.includes("starship") || q.includes("mars")) {
      return {
        title: `SPACEX ${verb} ${isLikely ? "ACHIEVE MILESTONE" : "HIT TURBULENCE"}`,
        subtitle: `"${cleanedQuestion}" — ${prob}% probability`
      };
    }
    if (q.includes("apple")) {
      return {
        title: `APPLE ${verb} ${isLikely ? "DELIVER" : "POSTPONE"}`,
        subtitle: `"${cleanedQuestion}" — odds at ${prob}%`
      };
    }
    return {
      title: `TECH SECTOR ${isLikely ? "SURGES" : "WAVERS"}: ${prob}%`,
      subtitle: getDescriptiveSubtitle(prob, market.question)
    };
  }
  
  // Finance headlines
  if (category === "finance") {
    if (q.includes("fed") || q.includes("rate")) {
      return {
        title: `FED ${verb} ${isLikely ? "CUT RATES" : "HOLD STEADY"}`,
        subtitle: `"${cleanedQuestion}" — markets price in ${prob}%`
      };
    }
    if (q.includes("recession")) {
      return {
        title: `RECESSION ${isLikely ? "FEARS MOUNT" : "CONCERNS FADE"}`,
        subtitle: `"${cleanedQuestion}" — ${prob}% odds`
      };
    }
    return {
      title: `MARKETS ${isLikely ? "BULLISH" : "CAUTIOUS"}: ${prob}%`,
      subtitle: getDescriptiveSubtitle(prob, market.question)
    };
  }
  
  // Sports headlines  
  if (category === "sports") {
    // Extract team/player name if possible
    const words = market.question.split(' ');
    const nameWords = words.slice(1, 4).filter(w => w.length > 2 && w[0] === w[0].toUpperCase());
    const name = nameWords.length > 0 ? nameWords.join(' ').toUpperCase() : "CONTENDER";
    
    return {
      title: `${name} ${verb} ${isLikely ? "CLAIM TITLE" : "FALL SHORT"}`,
      subtitle: `"${cleanedQuestion}" — bettors say ${prob}%`
    };
  }
  
  // Science headlines
  if (category === "science") {
    return {
      title: `SCIENTIFIC ${isLikely ? "MILESTONE APPROACHES" : "GOALS SHIFT"}`,
      subtitle: getDescriptiveSubtitle(prob, market.question)
    };
  }
  
  // Default/World headlines - extract key words from question
  const keyWords = market.question
    .replace(/Will |will |be |the |a |an |in |on |by |to |of |for /g, '')
    .split(' ')
    .slice(0, 4)
    .join(' ')
    .toUpperCase();
  
  return {
    title: `${keyWords}: ${prob}% ${isLikely ? "LIKELY" : "UNCERTAIN"}`,
    subtitle: getDescriptiveSubtitle(prob, market.question)
  };
}

export function selectLeadStory(headlines: Headline[]): Headline {
  // Weight by interesting probability (not too close to 50%) and category importance
  const scored = headlines.map(h => ({
    headline: h,
    score: Math.abs(h.probability - 50) * 2 + 
           (h.category === "politics" ? 15 : 0) + 
           (h.category === "crypto" ? 10 : 0) +
           (h.category === "tech" ? 8 : 0) +
           (h.category === "finance" ? 5 : 0) +
           Math.random() * 10 // Add randomness for variety
  }));
  
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.headline || headlines[0];
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getTomorrowDate(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}
