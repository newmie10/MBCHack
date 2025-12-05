import { NextResponse } from "next/server";
import OpenAI from "openai";
import { FormattedMarket } from "@/lib/polymarket";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { markets } = await request.json() as { markets: FormattedMarket[] };
    
    if (!markets || markets.length === 0) {
      return NextResponse.json(
        { error: "No markets provided" },
        { status: 400 }
      );
    }

    // Generate AI-enhanced headlines for each market
    const prompt = `You are a newspaper editor creating headlines for tomorrow's paper. Based on these prediction market probabilities, write compelling newspaper headlines.

For each market, write:
1. A dramatic, punchy headline (max 8 words, ALL CAPS)
2. A subtitle that contextualizes the probability (max 15 words)

Markets:
${markets.slice(0, 6).map((m, i) => `${i + 1}. "${m.question}" - ${m.yesPrice}% YES probability`).join('\n')}

Respond in JSON format:
{
  "headlines": [
    { "marketId": "0", "title": "HEADLINE HERE", "subtitle": "Subtitle explaining the market" },
    ...
  ]
}

Make headlines feel like real newspaper headlines - dramatic, attention-grabbing, but grounded in the probability data.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert newspaper editor who transforms prediction market data into compelling headlines."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error generating headlines:", error);
    return NextResponse.json(
      { error: "Failed to generate headlines" },
      { status: 500 }
    );
  }
}

