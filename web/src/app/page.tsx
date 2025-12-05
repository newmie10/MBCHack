"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChatMessage, ScoredMarket } from "@/types/market";
import { supabaseClient } from "@/lib/supabase";

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

type ChatPanelProps = {
  marketId: string;
  marketSlug?: string | null;
  question: string;
};

function ChatPanel({ marketId, marketSlug, question }: ChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [nickname, setNickname] = useState("anon");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat?marketId=${encodeURIComponent(marketId)}`);
      const payload = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(payload));
      setMessages(payload.messages ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [marketId]);

  useEffect(() => {
    if (!open) return;
    loadMessages();
  }, [open, loadMessages]);

  useEffect(() => {
    if (!open) return;
    if (!supabaseClient) return;

    const channel = supabaseClient
      .channel(`chat-${marketId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `market_id=eq.${marketId}` },
        (payload: { new: Record<string, unknown> }) => {
          const record = payload.new;
          setMessages((prev) => [
            {
              id: String(record.id),
              marketId: String(record.market_id),
              nickname: typeof record.nickname === "string" ? record.nickname : "anon",
              body: typeof record.body === "string" ? record.body : "",
              createdAt: String(record.created_at),
            },
            ...prev,
          ]);
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [marketId, open]);

  const sendMessage = async () => {
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId,
          nickname: nickname || "anon",
          message: body.trim(),
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(payload));
      setBody("");
      // Optimistic add if realtime not configured
      if (!supabaseClient) {
        const msg = payload.message as ChatMessage;
        setMessages((prev) => [msg, ...prev]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-100 hover:bg-slate-900/60"
      >
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
            Market chat
          </div>
          <div className="text-sm text-slate-200 line-clamp-1">
            {question}
          </div>
        </div>
        <span className="text-xs text-slate-400">{open ? "Hide" : "Open"}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-slate-800 px-3 py-3">
          <div className="flex gap-2">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="name"
              className="w-28 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
            />
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Drop a take"
              className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !body.trim()}
              className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "..." : "Send"}
            </button>
          </div>
          {error && <div className="text-xs text-amber-300">{error}</div>}
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <div className="text-xs text-slate-400">Loading chat…</div>
            ) : messages.length === 0 ? (
              <div className="text-xs text-slate-400">No chat yet. Start it.</div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className="rounded border border-slate-800 bg-slate-900/70 px-2 py-1 text-xs text-slate-100"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-200">{m.nickname || "anon"}</span>
                    <span>{new Date(m.createdAt).toLocaleString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-100">{m.body}</div>
                </div>
              ))
            )}
          </div>
          {marketSlug && (
            <a
              href={`https://polymarket.com/event/${marketSlug}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-300 hover:underline"
            >
              Open market on Polymarket
            </a>
          )}
        </div>
      )}
    </div>
  );
}
export default function Home() {
  const [markets, setMarkets] = useState<ScoredMarket[]>([]);
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [sentimenting, setSentimenting] = useState(false);
  const [briefing, setBriefing] = useState(false);
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
        setError("Sentiment analysis failed — check GOOGLE_API_KEY or network.");
      }

      setMarkets([...updated]);
    }

    setSentimenting(false);
  };

  const sentimentAll = () => sentimentTop(markets.length || 0);

  const briefOne = async (marketId: string) => {
    setBriefing(true);
    setError(null);
    setMarkets((prev) =>
      prev.map((m) =>
        m.id === marketId ? { ...m, briefLoading: true, briefError: undefined } : m,
      ),
    );
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market: markets.find((m) => m.id === marketId) }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(payload));
      setMarkets((prev) =>
        prev.map((m) =>
          m.id === marketId
            ? {
                ...m,
                brief: payload.brief,
                briefRisk: payload.risk,
                briefAction: payload.action,
                briefConfidence: payload.confidence,
                briefLoading: false,
              }
            : m,
        ),
      );
    } catch (err) {
      setMarkets((prev) =>
        prev.map((m) =>
          m.id === marketId
            ? { ...m, briefLoading: false, briefError: getErrorMessage(err) }
            : m,
        ),
      );
      setError("Brief generation failed — check GOOGLE_API_KEY or network.");
    } finally {
      setBriefing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-950 shadow-sm">
                Edge Radar
              </div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Polymarket edge desk
              </p>
            </div>
            <h1 className="text-3xl font-semibold sm:text-4xl text-white">Edge Radar</h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Pulls live Polymarket markets, scores edge (clarity, liquidity, timing), and layers in news
              sentiment. Built for quick reads, not vibes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/surveillance"
              className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400"
            >
              Feed2Forecast
            </a>
            <a
              href="/news"
              className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400"
            >
              The Daily Oracle
            </a>
            <button
              onClick={fetchMarkets}
              disabled={loading}
              className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => scoreTop(8)}
              disabled={loading || scoring}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {scoring ? "Scoring..." : "AI rank top 8"}
            </button>
            <button
              onClick={scoreAll}
              disabled={loading || scoring || markets.length === 0}
              className="rounded-lg bg-indigo-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {scoring ? "Scoring..." : "AI rank all"}
            </button>
            <button
              onClick={() => sentimentTop(8)}
              disabled={loading || sentimenting || markets.length === 0}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sentimenting ? "Sentiment..." : "News sentiment top 8"}
            </button>
            <button
              onClick={sentimentAll}
              disabled={loading || sentimenting || markets.length === 0}
              className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sentimenting ? "Sentiment..." : "News sentiment all"}
            </button>
          </div>
        </header>

        <section className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 shadow-sm">
            Markets: {markets.length || "—"}
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 shadow-sm">
            Status:{" "}
            {loading
              ? "Loading…"
              : scoring
                ? "Scoring…"
                : sentimenting
                  ? "Sentiment…"
                  : briefing
                    ? "Briefing…"
                    : "Idle"}
          </span>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 shadow-sm">
            Keys: GOOGLE_API_KEY (optional DEBUG_SCORE_LOG=1)
          </span>
        </section>

        {error && (
          <div className="rounded-lg border border-amber-500/70 bg-amber-900/30 px-4 py-3 text-sm text-amber-100">
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
                className="flex h-full flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:border-slate-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                      {formatDate(market.endDate)} · 24h vol {formatUsd(market.volume24hr)}
                    </p>
                    <h2 className="text-lg font-semibold leading-snug text-white">
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-300 hover:text-indigo-200 hover:underline"
                        >
                          {market.question}
                        </a>
                      ) : (
                        market.question
                      )}
                    </h2>
                    <p className="text-sm text-slate-300">{outcomes}</p>
                    {market.description ? (
                      <p className="text-sm text-slate-400 line-clamp-2">{market.description}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Edge score
                    </div>
                    <div className="text-3xl font-semibold text-indigo-200">
                      {market.score !== undefined ? market.score : "—"}
                    </div>
                    {market.loading && (
                      <div className="text-xs text-indigo-300">Scoring…</div>
                    )}
                    {market.error && (
                      <div className="text-xs text-amber-300">AI error</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-slate-200">
                  {market.bestBid !== null && market.bestBid !== undefined && (
                    <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1">
                      Best bid: {formatPct(market.bestBid)}
                    </span>
                  )}
                  {market.bestAsk !== null && market.bestAsk !== undefined && (
                    <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1">
                      Best ask: {formatPct(market.bestAsk)}
                    </span>
                  )}
                  {market.liquidityNum !== null && market.liquidityNum !== undefined && (
                    <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1">
                      Liquidity: {formatUsd(market.liquidityNum)}
                    </span>
                  )}
                </div>

                {market.rationale && (
                  <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
                    <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
                      Why this edge score
                    </div>
                    <p className="mt-1 text-sm">{market.rationale}</p>
                  </div>
                )}
                {market.tags && market.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {market.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-indigo-500/40 bg-indigo-900/30 px-2 py-1 text-xs font-medium text-indigo-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => briefOne(market.id)}
                    disabled={market.briefLoading || briefing}
                    className="rounded border border-cyan-600 bg-cyan-900/40 px-3 py-1 text-xs font-semibold text-cyan-100 transition hover:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {market.briefLoading ? "Briefing…" : "AI trade brief"}
                  </button>
                </div>
                {(market.brief || market.briefLoading || market.briefError) && (
                  <div className="rounded-lg border border-cyan-700 bg-cyan-950/50 px-3 py-2 text-sm text-cyan-50">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase tracking-[0.14em] text-cyan-200">
                        Trading brief
                      </div>
                      {market.briefConfidence !== undefined && (
                        <div className="text-xs text-cyan-100">
                          Conf: {market.briefConfidence}
                        </div>
                      )}
                    </div>
                    {market.brief && <p className="mt-1 text-sm">{market.brief}</p>}
                    {market.briefRisk && (
                      <p className="mt-1 text-xs text-cyan-200">Risk: {market.briefRisk}</p>
                    )}
                    {market.briefAction && (
                      <p className="mt-1 text-xs text-cyan-200">Action: {market.briefAction}</p>
                    )}
                    {market.briefError && (
                      <p className="mt-1 text-xs text-red-300">{market.briefError}</p>
                    )}
                  </div>
                )}
                {(market.sentimentScore !== undefined ||
                  market.sentimentLoading ||
                  market.sentimentError) && (
                  <div className="rounded-lg border border-emerald-800 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-100">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase tracking-[0.14em] text-emerald-200">
                        News sentiment
                      </div>
                      <div className="text-lg font-semibold">
                        {market.sentimentLoading
                          ? "..."
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
                            className="rounded-full border border-emerald-500/40 bg-emerald-900/40 px-2 py-1 text-xs font-medium text-emerald-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {market.sentimentError && (
                      <p className="mt-1 text-xs text-red-300">{market.sentimentError}</p>
                    )}
                  </div>
                )}
                <ChatPanel marketId={market.id} marketSlug={market.slug} question={market.question} />
              </article>
            );
          })}
        </div>

        {!loading && sorted.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900 px-4 py-10 text-center text-sm text-slate-300">
            No markets yet. Click “Refresh” to load active Polymarket markets.
          </div>
        )}
      </div>
    </div>
  );
}
