import { Feed } from "@/components/Feed";
import { WatchlistPanel } from "@/components/WatchlistPanel";

export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-neutral-900 mb-1">
            Recent Trades
          </h1>
          <p className="text-sm text-neutral-500">
            Live activity from your watchlist
          </p>
        </div>
        <Feed />
      </div>

      <div className="space-y-6">
        <WatchlistPanel />
        
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-neutral-900 mb-2">
            Copy Trading
          </h3>
          <p className="text-sm text-neutral-500 leading-relaxed mb-3">
            Connect your wallet to copy trades from top performers. Click
            &quot;Copy Trade&quot; on any trade to open the market.
          </p>
          <div className="text-xs text-neutral-400 space-y-1">
            <p>• Trades are not executed automatically</p>
            <p>• Always do your own research</p>
            <p>• Past performance ≠ future results</p>
          </div>
        </div>
      </div>
    </div>
  );
}
