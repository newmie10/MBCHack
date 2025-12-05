"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Trade } from "@/types/market";

type TradesResponse = { trades: Trade[] };

const formatUsd = (v: number) =>
  `$${v.toLocaleString(undefined, { maximumFractionDigits: v >= 1000 ? 0 : 2 })}`;

const formatTime = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

export default function Surveillance() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [suspects, setSuspects] = useState<string[]>([]);
  const [newWatch, setNewWatch] = useState("");
  const [marketFilter, setMarketFilter] = useState("");
  const [minNotional, setMinNotional] = useState(500);
  const [alertNotional, setAlertNotional] = useState(3000);
  const [alertLowOdds, setAlertLowOdds] = useState(0.25);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = async () => {
    try {
      const params = new URLSearchParams();
      params.set("limit", "200");
      params.set("minNotional", String(minNotional));
      if (marketFilter.trim()) params.set("marketId", marketFilter.trim());
      const res = await fetch(`/api/trades?${params.toString()}`, { cache: "no-store" });
      const data: TradesResponse = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      setTrades((prev) => {
        const merged = [...data.trades, ...prev].slice(0, 300);
        return merged;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch trades");
    }
  };

  useEffect(() => {
    fetchTrades();
    const id = setInterval(fetchTrades, 8000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minNotional, marketFilter]);

  const suspectTrades = useMemo(() => {
    return trades.filter((t) => {
      const big = t.notional >= alertNotional;
      const lowOdds = typeof t.odds === "number" && t.odds <= alertLowOdds;
      const watched =
        (watchlist.length > 0 || suspects.length > 0) && t.trader
          ? [...watchlist, ...suspects].some((w) => t.trader?.toLowerCase() === w.toLowerCase())
          : false;
      return big || (lowOdds && t.notional >= minNotional) || watched;
    });
  }, [trades, alertNotional, alertLowOdds, watchlist, suspects, minNotional]);

  const filtered = trades.filter((t) => t.notional >= minNotional);

  const addWatch = () => {
    const val = newWatch.trim();
    if (!val) return;
    setWatchlist((prev) =>
      prev.includes(val.toLowerCase()) ? prev : [...prev, val.toLowerCase()],
    );
    setNewWatch("");
  };

  const removeWatch = (w: string) =>
    setWatchlist((prev) => prev.filter((x) => x !== w.toLowerCase()));

  const addSuspect = (w: string) => {
    const key = w.toLowerCase();
    setWatchlist((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setSuspects((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const removeSuspect = (w: string) =>
    setSuspects((prev) => prev.filter((x) => x !== w.toLowerCase()));

  const Tag = ({ children }: { children: React.ReactNode }) => (
    <span className="rounded-full border border-indigo-400/50 bg-indigo-900/40 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-100">
      {children}
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
          <Link
            href="/"
            className="rounded border border-slate-700 bg-slate-900 px-3 py-1 hover:border-slate-500"
          >
            Edge Radar
          </Link>
          <Link
            href="/surveillance"
            className="rounded border border-slate-500 bg-slate-800 px-3 py-1 font-semibold text-white"
          >
            Feed2Forecast
          </Link>
          <Link
            href="/news"
            className="rounded border border-slate-700 bg-slate-900 px-3 py-1 hover:border-slate-500"
          >
            The Daily Oracle
          </Link>
        </div>
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-950 shadow-sm">
                Feed2Forecast
              </div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Polymarket surveillance
              </p>
            </div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Feed2Forecast</h1>
            <p className="max-w-3xl text-sm text-slate-300">
              Live feed of large trades, low-odds punches, and watchlisted wallets. Alerts bubble up
              anything that looks like potential insider/edge flow.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-200">
            <Tag>Min ${minNotional}</Tag>
            <Tag>Alert &gt; ${alertNotional}</Tag>
            <Tag>Low odds &lt;= {Math.round(alertLowOdds * 100)}%</Tag>
          </div>
        </header>

        {error && (
          <div className="rounded-lg border border-amber-500/70 bg-amber-900/30 px-4 py-3 text-sm text-amber-100">
            {error}
          </div>
        )}

        <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 shadow-lg shadow-black/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">
                Feed size: {trades.length}
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">
                Suspects: {suspectTrades.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Min notional</span>
                <input
                  type="number"
                  value={minNotional}
                  onChange={(e) => setMinNotional(Number(e.target.value) || 0)}
                  className="w-24 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Market filter</span>
                <input
                  value={marketFilter}
                  onChange={(e) => setMarketFilter(e.target.value)}
                  placeholder="marketId or slug"
                  className="w-32 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Alert notional</span>
                <input
                  type="number"
                  value={alertNotional}
                  onChange={(e) => setAlertNotional(Number(e.target.value) || 0)}
                  className="w-24 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Low-odds threshold</span>
                <input
                  type="number"
                  step="0.01"
                  value={alertLowOdds}
                  onChange={(e) => setAlertLowOdds(Number(e.target.value) || 0)}
                  className="w-24 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Live tape (filtered)</h2>
              <span className="text-xs text-slate-400">Updating ~6s</span>
            </div>
            <div className="max-h-[520px] overflow-y-auto space-y-2">
              {filtered.map((t) => {
                const isLowOdds = typeof t.odds === "number" && t.odds <= alertLowOdds;
                const isBig = t.notional >= alertNotional;
                const watched =
                  watchlist.length > 0 && t.trader
                    ? watchlist.some((w) => t.trader?.toLowerCase() === w.toLowerCase())
                    : false;
                return (
                  <div
                    key={t.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-sm text-slate-100"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs uppercase tracking-[0.14em] text-slate-400">
                          {formatTime(t.timestamp)}
                        </span>
                        <span className="rounded bg-slate-800 px-2 py-1 text-xs">
                          {t.takerSide.toUpperCase()}
                        </span>
                        <span className="rounded bg-indigo-900/40 px-2 py-1 text-xs text-indigo-100">
                          {t.outcome}
                        </span>
                        {t.trader && (
                          <span className="rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-200">
                            {t.trader}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{t.marketQuestion}</div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-200">
                      <span className="rounded bg-slate-800 px-2 py-1">Price {t.price}</span>
                      <span className="rounded bg-slate-800 px-2 py-1">Size {t.size}</span>
                      <span className="rounded bg-slate-800 px-2 py-1">Notional {formatUsd(t.notional)}</span>
                      {typeof t.odds === "number" && (
                        <span className="rounded bg-slate-800 px-2 py-1">
                          Odds {(t.odds * 100).toFixed(1)}%
                        </span>
                      )}
                      {isBig && <Tag>HUGE</Tag>}
                      {isLowOdds && <Tag>LOW ODDS</Tag>}
                      {watched && <Tag>WATCH</Tag>}
                    {t.trader && (
                      <button
                        onClick={() => addSuspect(t.trader!)}
                        className="rounded bg-amber-900/60 px-2 py-1 text-[11px] font-semibold text-amber-100 hover:bg-amber-800/80"
                      >
                        Flag suspect
                      </button>
                    )}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="rounded border border-dashed border-slate-700 bg-slate-900 px-3 py-6 text-center text-sm text-slate-300">
                  No trades pass the current filters.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-amber-700 bg-amber-950/40 p-4 shadow">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-amber-100">Alerts (suspect)</h3>
                <span className="text-xs text-amber-200">{suspectTrades.length}</span>
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {suspectTrades.length === 0 ? (
                  <div className="text-xs text-amber-200">No suspect trades yet.</div>
                ) : (
                  suspectTrades.map((t) => (
                    <div
                      key={t.id}
                      className="rounded border border-amber-700 bg-amber-900/40 px-2 py-2 text-xs text-amber-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{formatUsd(t.notional)}</span>
                        <span>{formatTime(t.timestamp)}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-amber-100">
                        <span>{t.takerSide.toUpperCase()}</span>
                        <span>{t.outcome}</span>
                        {typeof t.odds === "number" && <span>Odds {(t.odds * 100).toFixed(1)}%</span>}
                        {t.trader && <span>{t.trader}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow">
              <h3 className="text-sm font-semibold text-white">Watchlist</h3>
              <div className="mt-2 flex gap-2">
                <input
                  value={newWatch}
                  onChange={(e) => setNewWatch(e.target.value)}
                  placeholder="0x... wallet"
                  className="flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100"
                />
                <button
                  onClick={addWatch}
                  className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-indigo-500"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {watchlist.length === 0 && (
                  <span className="text-xs text-slate-400">No wallets tracked yet.</span>
                )}
                {watchlist.map((w) => (
                  <span
                    key={w}
                    className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                  >
                    {w}
                    <button
                      onClick={() => addSuspect(w)}
                      className="text-amber-300 hover:text-amber-100"
                    >
                      flag
                    </button>
                    <button
                      onClick={() => removeWatch(w)}
                      className="text-slate-400 hover:text-white"
                      aria-label="Remove wallet"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-700 bg-amber-950/50 p-4 shadow">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-amber-100">Suspect wallets</h3>
                <span className="text-xs text-amber-200">{suspects.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suspects.length === 0 && (
                  <span className="text-xs text-amber-200">No suspects yet. Flag from tape or watchlist.</span>
                )}
                {suspects.map((w) => (
                  <span
                    key={w}
                    className="flex items-center gap-1 rounded-full border border-amber-600 bg-amber-900/40 px-2 py-1 text-xs text-amber-100"
                  >
                    {w}
                    <button
                      onClick={() => removeSuspect(w)}
                      className="text-amber-300 hover:text-amber-50"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

