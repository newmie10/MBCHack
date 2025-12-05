"use client";

import { useEffect, useMemo, useState } from "react";
import type { ScoredMarket } from "@/types/market";

type MarketResponse = {
  markets: ScoredMarket[];
};

const getErrorMessage = (value: unknown) => {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  return "Something went wrong";
};

const formatUsd = (value?: number | null) => {
  if (value === null || value === undefined) return "$0";
  return `$${value.toLocaleString(undefined, {
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  })}`;
};

const formatPct = (value?: number | null) => {
  if (value === null || value === undefined) return "—";
  return `${(value * 100).toFixed(1)}%`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export default function Home() {
  const [markets, setMarkets] = useState<ScoredMarket[]>([]);
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [sentimenting, setSentimenting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...markets].sort(
        (a, b) => (b.score ?? -1) - (a.score ?? -1) || (b.volume24hr ?? 0) - (a.volume24hr ?? 0),
      ),
    [markets],
  );

  const fetchMarkets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/markets", { cache: "no-store" });
      const payload: MarketResponse = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(payload));
      setMarkets(payload.markets ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const scoreTop = async (count = 8) => {
    if (!markets.length) return;
    setScoring(true);
    setError(null);
    const updated = [...markets];
    const limit = Math.min(count, updated.length);

    for (let i = 0; i < limit; i++) {
      updated[i] = { ...updated[i], loading: true, error: undefined };
      setMarkets([...updated]);

      try {
        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ market: updated[i] }),
        });
        const payload = await res.json();

        if (!res.ok) throw new Error(payload?.error || "Failed to score");

        updated[i] = {
          ...updated[i],
          score: payload.score,
          rationale: payload.rationale,
          tags: payload.tags,
          loading: false,
        };
      } catch (err) {
        updated[i] = {
          ...updated[i],
          loading: false,
          error: getErrorMessage(err),
        };
        setError("AI scoring failed — check OPENAI_API_KEY in web/.env.local");
      }

      setMarkets([...updated]);
    }

    setScoring(false);
  };

  const scoreAll = () => scoreTop(markets.length || 0);

  const sentimentTop = async (count = 8) => {
    if (!markets.length) return;
    setSentimenting(true);
    setError(null);
    const updated = [...markets];
    const limit = Math.min(count, updated.length);

    for (let i = 0; i < limit; i++) {
      updated[i] = { ...updated[i], sentimentLoading: true, sentimentError: undefined };
      setMarkets([...updated]);

      try {
        const res = await fetch("/api/sentiment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ market: updated[i] }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(getErrorMessage(payload));

        updated[i] = {
          ...updated[i],
          sentimentScore: payload.sentimentScore,
          sentimentRationale: payload.sentimentRationale,
          sentimentTags: payload.sentimentTags,
          sentimentLoading: false,
        };
      } catch (err) {
        updated[i] = {
          ...updated[i],
          sentimentLoading: false,
          sentimentError: getErrorMessage(err),
        };
        setError("Sentiment analysis failed — check GROQ_API_KEY or network.");
      }

      setMarkets([...updated]);
    }

    setSentimenting(false);
  };

  const sentimentAll = () => sentimentTop(markets.length || 0);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Polymarket AI companion
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Edge finder: rank markets with AI
            </h1>
            <p className="max-w-2xl text-sm text-zinc-600">
              Pulls active Polymarket markets, then uses an LLM to score clarity, timing, and
              information edge so you can spot mispriced odds fast.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchMarkets}
              disabled={loading}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh markets"}
            </button>
            <button
              onClick={() => scoreTop(8)}
              disabled={loading || scoring}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
            >
              {scoring ? "Scoring..." : "AI rank top 8"}
            </button>
            <button
              onClick={scoreAll}
              disabled={loading || scoring || markets.length === 0}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
            >
              {scoring ? "Scoring..." : "AI rank all"}
            </button>
            <button
              onClick={() => sentimentTop(8)}
              disabled={loading || sentimenting || markets.length === 0}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sentimenting ? "Sentiment..." : "News sentiment top 8"}
            </button>
            <button
              onClick={sentimentAll}
              disabled={loading || sentimenting || markets.length === 0}
              className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sentimenting ? "Sentiment..." : "News sentiment all"}
            </button>
          </div>
        </header>

        <section className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
            Markets loaded: {markets.length || "—"}
          </span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
            Status:{" "}
            {loading
              ? "Loading markets…"
              : scoring
                ? "Scoring…"
                : sentimenting
                  ? "Sentiment…"
                  : "Idle"}
          </span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">
            Needs OPENAI_API_KEY in web/.env.local
          </span>
        </section>

        {error && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sorted.map((market) => {
            const link = market.slug
              ? `https://polymarket.com/event/${market.slug}`
              : undefined;
            const outcomes =
              market.outcomes && market.outcomes.length
                ? market.outcomes.join(" / ")
                : "Outcomes unavailable";

            return (
              <article
                key={market.id}
                className="flex h-full flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                      {formatDate(market.endDate)} · 24h vol {formatUsd(market.volume24hr)}
                    </p>
                    <h2 className="text-lg font-semibold leading-snug">
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-700 hover:underline"
                        >
                          {market.question}
                        </a>
                      ) : (
                        market.question
                      )}
                    </h2>
                    <p className="text-sm text-zinc-600">{outcomes}</p>
                    {market.description ? (
                      <p className="text-sm text-zinc-500 line-clamp-2">{market.description}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <div className="text-xs text-zinc-500">Edge score</div>
                    <div className="text-2xl font-semibold">
                      {market.score !== undefined ? market.score : "—"}
                    </div>
                    {market.loading && (
                      <div className="text-xs text-indigo-600">Scoring…</div>
                    )}
                    {market.error && (
                      <div className="text-xs text-amber-600">AI error</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-zinc-600">
                  {market.bestBid !== null && market.bestBid !== undefined && (
                    <span className="rounded-full bg-zinc-100 px-2 py-1">
                      Best bid: {formatPct(market.bestBid)}
                    </span>
                  )}
                  {market.bestAsk !== null && market.bestAsk !== undefined && (
                    <span className="rounded-full bg-zinc-100 px-2 py-1">
                      Best ask: {formatPct(market.bestAsk)}
                    </span>
                  )}
                  {market.liquidityNum !== null && market.liquidityNum !== undefined && (
                    <span className="rounded-full bg-zinc-100 px-2 py-1">
                      Liquidity: {formatUsd(market.liquidityNum)}
                    </span>
                  )}
                </div>

                {market.rationale && (
                  <p className="text-sm text-zinc-700">{market.rationale}</p>
                )}
                {market.tags && market.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {market.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {(market.sentimentScore !== undefined ||
                  market.sentimentLoading ||
                  market.sentimentError) && (
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">News sentiment</div>
                      <div className="text-xs text-emerald-700">
                        {market.sentimentLoading
                          ? "Loading…"
                          : market.sentimentScore !== undefined
                            ? `${market.sentimentScore}`
                            : ""}
                      </div>
                    </div>
                    {market.sentimentRationale && (
                      <p className="mt-1 text-sm">{market.sentimentRationale}</p>
                    )}
                    {market.sentimentTags && market.sentimentTags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {market.sentimentTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white px-2 py-1 text-xs font-medium text-emerald-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {market.sentimentError && (
                      <p className="mt-1 text-xs text-red-700">{market.sentimentError}</p>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {!loading && sorted.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-500">
            No markets yet. Click “Refresh markets” to load active Polymarket markets.
          </div>
        )}
      </div>
    </div>
  );
}
