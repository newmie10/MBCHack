import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import type { Market } from "@/types/market";

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

type BriefResponse = {
  brief: string;
  risk: string;
  action: string;
  confidence: number;
};

const getMessage = (value: unknown) => {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  return "Failed to generate brief";
};

export async function POST(req: Request) {
  if (!geminiKey) {
    return NextResponse.json(
      { error: "Missing GOOGLE_API_KEY" },
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
    let parsed: Partial<BriefResponse> | null = null;
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
                    "You create a quick trading brief for a Polymarket market.",
                    "Return JSON {brief: string, risk: string, action: string, confidence: 0-100}.",
                    "Keep it concise and actionable. Consider liquidity, bid/ask, timeline, info asymmetry.",
                    "Input:",
                    JSON.stringify({
                      question: market.question,
                      description: market.description,
                      outcomes: market.outcomes,
                      prices: market.prices,
                      bestBid: market.bestBid,
                      bestAsk: market.bestAsk,
                      volume24hr: market.volume24hr,
                      volumeNum: market.volumeNum,
                      liquidityNum: market.liquidityNum,
                      endDate: market.endDate,
                    }),
                  ].join("\n"),
                },
              ],
            },
          ],
        });
        const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error(`No content returned from Gemini model ${modelId}`);
        parsed = JSON.parse(text) as Partial<BriefResponse>;
        break;
      } catch (err) {
        lastError = err;
        const msg = getMessage(err).toLowerCase();
        if (msg.includes("not found") || msg.includes("404")) continue;
        throw err;
      }
    }

    if (!parsed) throw lastError || new Error("Model did not return a result");
    if (typeof parsed.confidence !== "number") {
      throw new Error("Malformed brief payload");
    }

    return NextResponse.json({
      brief: parsed.brief ?? "No brief",
      risk: parsed.risk ?? "No risk notes",
      action: parsed.action ?? "No action",
      confidence: parsed.confidence,
    });
  } catch (error) {
    console.error("Brief failed", error);
    return NextResponse.json(
      { error: getMessage(error) },
      { status: 500 },
    );
  }
}

