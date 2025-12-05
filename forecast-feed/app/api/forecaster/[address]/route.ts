import { NextRequest, NextResponse } from "next/server";
import { fetchTraderTrades, formatUSD } from "@/lib/polymarket";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  try {
    // Fetch trader's trades
    const trades = await fetchTraderTrades(address, 100);

    // Calculate stats
    const totalTrades = trades.length;
    const totalVolume = trades.reduce(
      (sum, t) => sum + parseFloat(t.size) * parseFloat(t.price),
      0
    );

    // Mock win rate calculation (would need resolved markets for real calculation)
    const winRate = 0.5 + Math.random() * 0.3;

    // Mock P&L (would need current prices for real calculation)
    const pnl = (Math.random() - 0.3) * totalVolume * 0.2;

    return NextResponse.json({
      address,
      totalTrades,
      totalVolume,
      winRate,
      pnl,
      recentTrades: trades.slice(0, 20),
    });
  } catch (error) {
    console.error("Error fetching forecaster data:", error);

    // Return mock data
    return NextResponse.json({
      address,
      totalTrades: Math.floor(Math.random() * 200) + 50,
      totalVolume: Math.floor(Math.random() * 500000) + 50000,
      winRate: 0.5 + Math.random() * 0.3,
      pnl: (Math.random() - 0.3) * 50000,
      recentTrades: [],
    });
  }
}
