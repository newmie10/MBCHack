import { NextResponse } from "next/server";
import {
  fetchRecentTrades,
  buildFeedItems,
  getMockFeedItems,
} from "@/lib/polymarket";

export async function GET() {
  try {
    // Try to fetch real data from Polymarket
    const trades = await fetchRecentTrades(50);

    if (trades.length > 0) {
      const feedItems = await buildFeedItems(trades);
      return NextResponse.json(feedItems);
    }

    // Fall back to mock data if no trades returned
    return NextResponse.json(getMockFeedItems());
  } catch (error) {
    console.error("Error in feed API:", error);
    // Return mock data on error
    return NextResponse.json(getMockFeedItems());
  }
}
