import { Feed } from "@/components/Feed";
import { ForecasterCard } from "@/components/ForecasterCard";

// Mock top forecasters for the sidebar
const topForecasters = [
  {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    totalTrades: 245,
    totalVolume: 523000,
    winRate: 0.68,
    pnl: 42500,
  },
  {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    totalTrades: 189,
    totalVolume: 312000,
    winRate: 0.72,
    pnl: 28900,
  },
  {
    address: "0x9876543210fedcba9876543210fedcba98765432",
    totalTrades: 412,
    totalVolume: 890000,
    winRate: 0.55,
    pnl: -12300,
  },
];

export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Feed */}
      <div className="lg:col-span-2">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Prediction Activity
          </h1>
          <p className="text-zinc-500">
            Real-time trades and positions from Polymarket forecasters
          </p>
        </div>
        <Feed />
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Top Forecasters */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🏆</span> Top Forecasters
          </h2>
          <div className="space-y-3">
            {topForecasters.map((forecaster, index) => (
              <ForecasterCard
                key={forecaster.address}
                forecaster={forecaster}
                rank={index + 1}
              />
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-2">About Forecast Feed</h3>
          <p className="text-sm text-zinc-400 mb-3">
            Track prediction market activity, follow top forecasters, and build
            your network of trusted predictors.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400">
              Powered by Polymarket
            </span>
            <span className="px-2 py-1 bg-zinc-800 rounded-full text-xs text-zinc-400">
              Built on Base
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-blue-800/50 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-3">Platform Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-white">$2.5B+</p>
              <p className="text-xs text-zinc-400">Total Volume</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">50K+</p>
              <p className="text-xs text-zinc-400">Active Traders</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-xs text-zinc-400">Active Markets</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-xs text-zinc-400">Live Trading</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
