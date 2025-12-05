import { NextResponse } from "next/server";
import { fetchTopMarkets } from "@/lib/polymarket";

export async function GET() {
  try {
    const markets = await fetchTopMarkets(12);
    return NextResponse.json({ markets });
  } catch (error) {
    console.error("Error fetching markets:", error);
    return NextResponse.json(
      { error: "Failed to fetch markets" },
      { status: 500 }
    );
  }
}

