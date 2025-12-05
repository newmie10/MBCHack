import { NextResponse } from "next/server";
import type { Market } from "@/types/market";

const GAMMA_URL = "https://gamma-api.polymarket.com/markets";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {
      return [];
    }
  }
  return [];
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const simplifyMarket = (raw: Record<string, unknown>): Market | null => {
  const question = typeof raw.question === "string" ? raw.question : null;
  if (!question) return null;

  const outcomes = parseArray<string>(raw.outcomes);
  const prices = parseArray<number | string>(raw.outcomePrices).map((p) =>
    typeof p === "string" ? Number(p) : Number(p || 0),
  );

  const idValue = raw.id ?? raw.conditionId ?? crypto.randomUUID();

  return {
    id: String(idValue),
    question,
    description: typeof raw.description === "string" ? raw.description : null,
    outcomes,
    prices,
    bestBid: toNumber(raw.bestBid),
    bestAsk: toNumber(raw.bestAsk),
    volume24hr: toNumber(raw.volume24hr),
    volumeNum: toNumber(raw.volumeNum),
    liquidityNum: toNumber(raw.liquidityNum),
    endDate:
      typeof raw.endDate === "string"
        ? raw.endDate
        : typeof raw.endDateIso === "string"
          ? raw.endDateIso
          : null,
    slug: typeof raw.slug === "string" ? raw.slug : null,
  };
};

export async function GET() {
  const params = new URLSearchParams({
    limit: "80",
    active: "true",
    closed: "false",
  });

  try {
    const res = await fetch(`${GAMMA_URL}?${params.toString()}`, {
      headers: { accept: "application/json" },
      // Cache for a short period to keep UI snappy but not stale.
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to reach Polymarket Gamma API" },
        { status: 502 },
      );
    }

    const data = await res.json();
    const now = Date.now();

    const markets = (Array.isArray(data) ? data : [])
      .map((item) => (isRecord(item) ? simplifyMarket(item) : null))
      .filter((m): m is Market => !!m)
      .filter((m) => {
        if (!m.endDate) return true;
        const end = Date.parse(m.endDate);
        return Number.isFinite(end) ? end > now : true;
      })
      .sort((a, b) => (b.volume24hr ?? 0) - (a.volume24hr ?? 0));

    return NextResponse.json({ markets });
  } catch (error) {
    console.error("Error fetching markets", error);
    return NextResponse.json(
      { error: "Unexpected error fetching markets" },
      { status: 500 },
    );
  }
}

