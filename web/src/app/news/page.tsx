"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type NewsResponse = {
  query: string;
  summary: string;
  bullets: string[];
  articles: {
    title: string;
    url?: string;
    domain?: string;
    snippet?: string;
    datetime?: string;
  }[];
};

const categories: { label: string; query: string }[] = [
  { label: "Crypto/Markets", query: "crypto markets betting liquidity" },
  { label: "Politics", query: "election politics prediction markets" },
  { label: "Macro", query: "inflation rates fed markets" },
  { label: "Tech AI", query: "ai technology regulation" },
];

export default function Newsroom() {
  const [query, setQuery] = useState(categories[0].query);
  const [customQuery, setCustomQuery] = useState("");
  const [summary, setSummary] = useState("");
  const [bullets, setBullets] = useState<string[]>([]);
  const [articles, setArticles] = useState<NewsResponse["articles"]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  const featured = articles[0];
  const rest = articles.slice(1);

  const imagePool = [
    "https://images.unsplash.com/photo-1522198874776-0fc1c34a4fd0?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1450101215322-bf5cd27642fc?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1451187863213-2307d7c2e576?auto=format&fit=crop&w=800&q=60",
    "https://images.unsplash.com/photo-1451188502541-13943edb6acb?auto=format&fit=crop&w=800&q=60",
  ];
  const pickImage = (idx: number) => imagePool[idx % imagePool.length];

  const run = async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news?q=${encodeURIComponent(q)}`, { cache: "no-store" });
      const data: NewsResponse = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      setQuery(data.query);
      setSummary(data.summary);
      setBullets(data.bullets || []);
      setArticles(data.articles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategory = (q: string) => {
    setQuery(q);
    run(q);
  };

  const handleCustom = () => {
    const q = customQuery.trim();
    if (!q) return;
    setQuery(q);
    run(q);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
          <Link
            href="/"
            className="rounded border border-slate-700 bg-slate-900 px-3 py-1 hover:border-slate-500"
          >
            Edge Radar
          </Link>
          <Link
            href="/surveillance"
            className="rounded border border-slate-700 bg-slate-900 px-3 py-1 hover:border-slate-500"
          >
            Feed2Forecast
          </Link>
          <Link
            href="/news"
            className="rounded border border-slate-500 bg-slate-800 px-3 py-1 font-semibold text-white"
          >
            The Daily Oracle
          </Link>
        </div>

        <header className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">AI newspaper</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Market news digest</h1>
          <p className="max-w-3xl text-sm text-slate-300">
            Pull headlines by category or custom query, then let Gemini write a short article and bullet
            highlights. Build another “edition” anytime.
          </p>
        </header>

        <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="rounded border border-indigo-400/60 bg-indigo-900/50 px-3 py-2 text-lg font-semibold uppercase tracking-[0.16em] text-white shadow">
                The Daily Oracle
              </div>
              <div className="text-sm text-slate-300">{today}</div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-200">
              <span className="rounded border border-slate-700 bg-slate-900 px-2 py-1">AI Edition</span>
              <span className="rounded border border-slate-700 bg-slate-900 px-2 py-1">
                Query: {query}
              </span>
              <span className="rounded border border-slate-700 bg-slate-900 px-2 py-1">
                {loading ? "Press time: updating…" : "Press time: live"}
              </span>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.label}
              onClick={() => handleCategory(c.query)}
              className={`rounded border px-3 py-2 text-sm ${
                query === c.query
                  ? "border-indigo-500 bg-indigo-900/40 text-white"
                  : "border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500"
              }`}
            >
              {c.label}
            </button>
          ))}
          <div className="flex flex-wrap gap-2">
            <input
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Custom query"
              className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            />
            <button
              onClick={handleCustom}
              className="rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              New edition
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-amber-500/70 bg-amber-900/30 px-4 py-3 text-sm text-amber-100">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 shadow">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="relative h-48 w-full overflow-hidden md:col-span-1">
                  <Image
                    src={pickImage(0)}
                    alt="feature"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-2 left-3 text-xs uppercase tracking-[0.16em] text-slate-100">
                    Feature
                  </div>
                </div>
                <div className="md:col-span-2 space-y-3 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Front page
                  </div>
                  <h2 className="text-2xl font-semibold text-white font-serif">
                    {featured?.title || "No feature yet"}
                  </h2>
                  <p className="text-sm text-slate-100 leading-relaxed">
                    {summary || "Run a query to generate the latest edition."}
                  </p>
                  {bullets.length > 0 && (
                    <ul className="grid grid-cols-1 gap-2 text-sm text-slate-100 md:grid-cols-2">
                      {bullets.map((b, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-indigo-300">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">More stories</h3>
                <span className="text-xs text-slate-400">{rest.length} items</span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {rest.slice(0, 6).map((a, idx) => (
                  <div
                    key={`${a.url}-${idx}`}
                    className="rounded border border-slate-800 bg-slate-900/70 px-3 py-3 text-sm text-slate-100 space-y-2"
                  >
                    <div className="relative h-24 w-full overflow-hidden rounded">
                      <Image
                        src={pickImage(idx + 1)}
                        alt="story"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    </div>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-indigo-200 hover:text-indigo-100 hover:underline"
                    >
                      {a.title}
                    </a>
                    <div className="text-[11px] text-slate-400">
                      {a.domain} {a.datetime ? `· ${new Date(a.datetime).toLocaleString()}` : ""}
                    </div>
                    {a.snippet && <p className="text-xs text-slate-200 line-clamp-3">{a.snippet}</p>}
                  </div>
                ))}
                {rest.length === 0 && (
                  <div className="rounded border border-dashed border-slate-700 bg-slate-900 px-3 py-6 text-center text-sm text-slate-300">
                    No more stories yet. Run a query.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 shadow">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Sources</h3>
              <span className="text-xs text-slate-400">{articles.length} articles</span>
            </div>
            <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
              {articles.length === 0 && (
                <div className="text-xs text-slate-400">No articles yet. Run a query.</div>
              )}
              {articles.map((a, idx) => (
                <div
                  key={`${a.url}-${idx}`}
                  className="rounded border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
                >
                  <div className="flex flex-col gap-1">
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-indigo-200 hover:text-indigo-100 hover:underline"
                    >
                      {a.title}
                    </a>
                    <div className="text-[11px] text-slate-400">
                      {a.domain} {a.datetime ? `· ${new Date(a.datetime).toLocaleString()}` : ""}
                    </div>
                    {a.snippet && <p className="text-xs text-slate-200">{a.snippet}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

