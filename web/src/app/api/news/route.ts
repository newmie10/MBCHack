import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const geminiKey = process.env.GOOGLE_API_KEY;
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite-001",
];

const getModel = (modelId: string) =>
  new GoogleGenerativeAI(geminiKey!).getGenerativeModel({
    model: modelId,
    generationConfig: { responseMimeType: "application/json" },
  });

const getMessage = (value: unknown) => {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  return "News error";
};

type Article = {
  title: string;
  url?: string;
  domain?: string;
  snippet?: string;
  datetime?: string;
};

const fetchNews = async (query: string) => {
  const search = encodeURIComponent(query.slice(0, 120));
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${search}&maxrecords=10&format=json&timespan=7d&sort=datedesc`;
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];
  const data = await res.json();
  const articles = Array.isArray(data?.articles) ? data.articles : [];
  return articles
    .map((a: Record<string, unknown>) => ({
      title: typeof a.title === "string" ? a.title : "",
      url: typeof a.url === "string" ? a.url : undefined,
      domain: typeof a.domain === "string" ? a.domain : undefined,
      snippet: typeof a.excerpt === "string" ? a.excerpt : undefined,
      datetime: typeof a.seendate === "string" ? a.seendate : undefined,
    }))
    .filter((a: Article) => a.title);
};

export async function GET(req: Request) {
  if (!geminiKey) {
    return NextResponse.json(
      { error: "Missing GOOGLE_API_KEY" },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "polymarket markets crypto betting";

  try {
    const articles = await fetchNews(query);
    const headlines = articles.map((a) => a.title).slice(0, 8);

    let parsed: { summary: string; bullets: string[] } | null = null;
    let lastError: unknown = null;

    for (const modelId of GEMINI_MODELS) {
      try {
        const model = getModel(modelId);
        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: [
                    "Create a short newspaper-style brief for a Polymarket/markets reader.",
                    "Return JSON {summary: string, bullets: [strings]}",
                    "Summary should be 3-5 sentences; bullets should be concise signals.",
                    "Headlines:",
                    JSON.stringify(headlines),
                  ].join("\n"),
                },
              ],
            },
          ],
        });
        const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error(`No content returned from Gemini model ${modelId}`);
        parsed = JSON.parse(text) as { summary: string; bullets: string[] };
        break;
      } catch (err) {
        lastError = err;
        const msg = getMessage(err).toLowerCase();
        if (msg.includes("not found") || msg.includes("404")) continue;
        throw err;
      }
    }

    if (!parsed) throw lastError || new Error("Model did not return a result");

    return NextResponse.json({
      query,
      summary: parsed.summary,
      bullets: Array.isArray(parsed.bullets) ? parsed.bullets : [],
      articles,
    });
  } catch (error) {
    console.error("News failed", error);
    return NextResponse.json(
      { error: getMessage(error) },
      { status: 500 },
    );
  }
}

