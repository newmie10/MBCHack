import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import type { Market } from "@/types/market";

const client =
  process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 0
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : null;

type SentimentResponse = {
  sentimentScore: number;
  sentimentRationale: string;
  sentimentTags: string[];
  sources: { title: string; url?: string; domain?: string }[];
};

const getMessage = (value: unknown) => {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  return "Failed to analyze sentiment";
};

const fetchArticles = async (query: string) => {
  try {
    const search = encodeURIComponent(query.slice(0, 120));
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${search}&maxrecords=5&format=json&timespan=7d&sort=datedesc`;
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(7000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { articles?: unknown };
    const articles = Array.isArray(data?.articles) ? data.articles : [];
    return articles
      .map((a: Record<string, unknown>) => ({
        title: typeof a.title === "string" ? a.title : "",
        url: typeof a.url === "string" ? a.url : undefined,
        domain: typeof a.domain === "string" ? a.domain : undefined,
      }))
      .filter((a: { title: string }) => a.title);
  } catch {
    return [];
  }
};

export async function POST(req: Request) {
  if (!client) {
    return NextResponse.json(
      { error: "Missing GROQ_API_KEY" },
      { status: 400 },
    );
  }

  const body = (await req.json()) as { market?: Market };
  const market: Market | undefined = body?.market;

  if (!market?.question) {
    return NextResponse.json(
      { error: "Invalid market payload" },
      { status: 400 },
    );
  }

  try {
    const sources = await fetchArticles(market.question);
    const headlines = sources.map((s) => s.title).slice(0, 5);

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            [
              "You are evaluating market sentiment for a Polymarket question using recent headlines.",
              "Return JSON {sentimentScore: -100..100, sentimentRationale: short string, sentimentTags: [strings]}",
              "Interpretation: -100 very negative for the thesis, 0 neutral/mixed, +100 very positive for the thesis.",
              "Be concise, and base your judgment only on provided headlines.",
            ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({
            question: market.question,
            endDate: market.endDate,
            headlines,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No content returned from model");

    const parsed = JSON.parse(content) as Partial<SentimentResponse>;
    if (typeof parsed.sentimentScore !== "number") {
      throw new Error("Malformed sentiment payload");
    }

    return NextResponse.json({
      sentimentScore: parsed.sentimentScore,
      sentimentRationale:
        parsed.sentimentRationale ?? "No rationale provided",
      sentimentTags: Array.isArray(parsed.sentimentTags)
        ? parsed.sentimentTags.map((t) => String(t))
        : [],
      sources,
    });
  } catch (error) {
    console.error("Sentiment failed", error);
    return NextResponse.json(
      { error: getMessage(error) },
      { status: 500 },
    );
  }
}

