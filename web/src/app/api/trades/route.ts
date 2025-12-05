import { NextResponse } from "next/server";
import type { Trade } from "@/types/market";

const POLY_TRADE_URL = "https://data-api.polymarket.com/trades";

const toNumber = (v: unknown): number | null => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const mapTrade = (raw: Record<string, unknown>): Trade | null => {
  const id = String(raw.transactionHash ?? raw.id ?? crypto.randomUUID());
  const price = toNumber(raw.price);
  const size = toNumber(raw.size);
  if (price === null || size === null) return null;
  const notional = Number((price * size).toFixed(2));

  const marketId = String(raw.conditionId ?? raw.asset ?? "unknown");
  const outcome = typeof raw.outcome === "string" ? raw.outcome : "N/A";
  const side = typeof raw.side === "string" ? raw.side.toUpperCase() : "BUY";

  return {
    id,
    marketId,
    marketQuestion: typeof raw.title === "string" ? raw.title : undefined,
    marketSlug: typeof raw.slug === "string" ? raw.slug : undefined,
    outcome,
    price,
    size,
    notional,
    takerSide: side === "SELL" ? "sell" : "buy",
    trader: typeof raw.proxyWallet === "string" ? raw.proxyWallet : undefined,
    timestamp:
      typeof raw.timestamp === "number"
        ? new Date(raw.timestamp * 1000).toISOString()
        : new Date().toISOString(),
    odds: price,
  };
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 120), 500);
  const minNotional = Number(searchParams.get("minNotional") || 0);
  const marketFilter = searchParams.get("marketId")?.toLowerCase() || "";

  try {
    const url = new URL(POLY_TRADE_URL);
    url.searchParams.set("limit", limit.toString());
    const res = await fetch(url.toString(), {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Polymarket trades fetch failed (${res.status})`);
    }
    const data = await res.json();
    const rows = Array.isArray(data)
      ? (data as Record<string, unknown>[])
      : Array.isArray((data as { trades?: unknown[] })?.trades)
        ? ((data as { trades?: unknown[] }).trades as Record<string, unknown>[])
        : [];
    const trades = rows
      .map((t: Record<string, unknown>) => mapTrade(t))
      .filter((t): t is Trade => !!t)
      .filter((t) => t.notional >= minNotional)
      .filter((t) =>
        marketFilter
          ? (t.marketId && t.marketId.toLowerCase().includes(marketFilter)) ||
            (t.marketSlug && t.marketSlug.toLowerCase().includes(marketFilter))
          : true,
      );

    return NextResponse.json({ trades });
  } catch (error) {
    console.error("Trades fetch failed", error);
    return NextResponse.json(
      { error: "Failed to fetch live trades. Check Polymarket API availability." },
      { status: 502 },
    );
  }
}

