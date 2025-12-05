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
            Connect your wallet on Base Sepolia to copy trades from top performers. Click
            &quot;Copy Trade&quot; on any trade to open the market or record on-chain.
          </p>
          <div className="text-xs text-neutral-400 space-y-1">
            <p>• Requires Base Sepolia network</p>
            <p>• Trades are not executed automatically</p>
            <p>• Always do your own research</p>
            <p>• Past performance ≠ future results</p>
          </div>
        </div>

        {/* Base Track Feature */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 0L11.196 3V9L6 12L0.804 9V3L6 0Z" fill="white"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Built on Base
              </h3>
              <p className="text-xs text-blue-700 leading-relaxed mb-3">
                Powered by Base Sepolia. All social relationships and copy trades are stored on-chain with low gas fees.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://base.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Learn about Base →
                </a>
                <a
                  href="https://docs.base.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Base Docs →
                </a>
                <a
                  href="https://sepolia.basescan.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  BaseScan →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
