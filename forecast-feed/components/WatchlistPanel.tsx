"use client";

import { useState } from "react";
import { useWatchlist } from "@/lib/WatchlistContext";
import { formatAddress, formatUSD } from "@/lib/polymarket";

export function WatchlistPanel() {
  const { watchlist, addWallet, removeWallet, resetToDefaults } = useWatchlist();
  const [showAdd, setShowAdd] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const handleAdd = () => {
    if (!newAddress || !newLabel) return;
    
    // Basic validation
    if (!newAddress.startsWith("0x") || newAddress.length !== 42) {
      alert("Invalid Ethereum address");
      return;
    }

    addWallet({
      address: newAddress,
      label: newLabel,
    });

    setNewAddress("");
    setNewLabel("");
    setShowAdd(false);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg">
      <div className="p-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-neutral-900">Watchlist</h2>
          <span className="text-xs text-neutral-400">{watchlist.length} wallets</span>
        </div>
      </div>

      <div className="divide-y divide-neutral-100">
        {watchlist.map((wallet) => (
          <div
            key={wallet.address}
            className="p-3 hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[10px] font-medium">
                  {wallet.label.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="text-sm font-medium text-neutral-900">
                    {wallet.label}
                  </span>
                  <p className="text-xs text-neutral-400">
                    {formatAddress(wallet.address)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeWallet(wallet.address)}
                className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            </div>
            {wallet.stats && (
              <div className="flex gap-3 mt-2 text-xs text-neutral-500">
                <span>{(wallet.stats.winRate * 100).toFixed(0)}% win</span>
                <span>{formatUSD(wallet.stats.totalVolume)} vol</span>
                <span className={wallet.stats.pnl >= 0 ? "text-emerald-600" : "text-red-600"}>
                  {wallet.stats.pnl >= 0 ? "+" : ""}{formatUSD(wallet.stats.pnl)}
                </span>
              </div>
            )}
            {wallet.description && (
              <p className="text-xs text-neutral-400 mt-1">{wallet.description}</p>
            )}
          </div>
        ))}
      </div>

      {showAdd ? (
        <div className="p-3 border-t border-neutral-100 space-y-2">
          <input
            type="text"
            placeholder="Label (e.g. Whale)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
          />
          <input
            type="text"
            placeholder="0x..."
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400 font-mono"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 px-3 py-2 bg-neutral-900 text-white text-sm rounded-md hover:bg-neutral-800 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-neutral-100 flex gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="flex-1 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-md hover:border-neutral-300 transition-colors"
          >
            + Add Wallet
          </button>
          <button
            onClick={resetToDefaults}
            className="px-3 py-2 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
