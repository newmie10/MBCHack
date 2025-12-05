import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import type { Market } from "@/types/market";

const client =
  process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 0
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : null;

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
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            [
              "You rank Polymarket markets for betting edge.",
              "Consider: resolution clarity, timeline risk, information asymmetry (is there likely alpha?), liquidity/volume, bid-ask gap.",
              "Score calibration (integer 0-100):",
              "0-30 bad/ambiguous/no volume; 30-50 unclear or low liquidity; 50-70 decent but standard; 70-85 strong/clear with some edge; 85-95 rare, very strong edge; 95-100 extremely rare, only if unusually mispriced.",
              "Penalize: ambiguous resolution sources, near-expiry with stale info, tiny liquidity, huge spread.",
              "Return JSON {score: int, rationale: short string, tags: [strings]}",
            ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({
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
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from model");
    }

    const parsed = JSON.parse(content) as Partial<ScoreResponse>;
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

