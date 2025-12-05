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

const DEBUG_SCORE_LOG = process.env.DEBUG_SCORE_LOG === "1";

type ScoreResponse = {
  score: number;
  rationale: string;
  tags: string[];
};

const getMessage = (value: unknown) => {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  return "Failed to score market";
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
    let parsed: Partial<ScoreResponse> | null = null;
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
                    "You rank Polymarket markets for betting edge.",
                    "Consider: resolution clarity, timeline risk, information asymmetry (is there likely alpha?), liquidity/volume, bid-ask gap.",
                    "Score calibration (integer 0-100):",
                    "0-30 bad/ambiguous/no volume; 30-50 unclear or low liquidity; 50-70 decent but standard; 70-85 strong/clear with some edge; 85-95 rare, very strong edge; 95-100 extremely rare, only if unusually mispriced.",
                    "Penalize: ambiguous resolution sources, near-expiry with stale info, tiny liquidity, huge spread.",
                    "Return JSON {score: int, rationale: short string, tags: [strings]}",
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
        parsed = JSON.parse(text) as Partial<ScoreResponse>;
        break;
      } catch (err) {
        lastError = err;
        const msg = getMessage(err).toLowerCase();
        if (msg.includes("not found") || msg.includes("404")) {
          continue; // try next model
        }
        throw err;
      }
    }

    if (!parsed) throw lastError || new Error("Model did not return a result");
    if (typeof parsed.score !== "number") {
      throw new Error("Malformed score payload");
    }

    const responseBody = {
      score: parsed.score,
      rationale: parsed.rationale ?? "No rationale provided",
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.map((t) => String(t))
        : [],
    };

    if (DEBUG_SCORE_LOG) {
      console.log("score_request", {
        question: market.question,
        volume24hr: market.volume24hr,
        liquidityNum: market.liquidityNum,
        bestBid: market.bestBid,
        bestAsk: market.bestAsk,
      });
      console.log("score_response", responseBody);
    }

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error("AI scoring failed", error);
    return NextResponse.json(
      { error: getMessage(error) },
      { status: 500 },
    );
  }
}

