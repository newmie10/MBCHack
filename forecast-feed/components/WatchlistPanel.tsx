"use client";

import { useState } from "react";
import { useWatchlist } from "@/lib/WatchlistContext";
import { formatAddress, formatUSD } from "@/lib/polymarket";
import { useAccount, useChainId } from "wagmi";
import { BASE_SEPOLIA_CHAIN_ID } from "@/lib/wagmi";

export function WatchlistPanel() {
  const { watchlist, addWallet, removeWallet, resetToDefaults } = useWatchlist();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isBaseNetwork = chainId === BASE_SEPOLIA_CHAIN_ID;
  const [showAdd, setShowAdd] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    setError(null);
    
    if (!newAddress || !newLabel) {
      setError("Please fill in both label and address");
      return;
    }
    
    // Validate Ethereum address format
    const trimmedAddress = newAddress.trim();
    if (!trimmedAddress.startsWith("0x") || trimmedAddress.length !== 42) {
      setError("Invalid address format. Must start with 0x and be 42 characters long.");
      return;
    }

    // Additional validation: check if it's a valid hex address
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)) {
      setError("Invalid Ethereum address format");
      return;
    }

    // Check if address already exists
    const exists = watchlist.some(
      (w) => w.address.toLowerCase() === trimmedAddress.toLowerCase()
    );
    
    if (exists) {
      setError("This address is already in your watchlist");
      return;
    }

    addWallet({
      address: trimmedAddress,
      label: newLabel.trim(),
    });

    setNewAddress("");
    setNewLabel("");
    setError(null);
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
              <div className="flex items-center gap-2">
                <a
                  href={`https://sepolia.basescan.org/address/${wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  title="View on BaseScan"
                >
                  BaseScan
                </a>
                <button
                  onClick={() => removeWallet(wallet.address)}
                  className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
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
            onChange={(e) => {
              setNewLabel(e.target.value);
              setError(null);
            }}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
          />
          <input
            type="text"
            placeholder="0x..."
            value={newAddress}
            onChange={(e) => {
              setNewAddress(e.target.value);
              setError(null);
            }}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400 font-mono"
          />
          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}
          {isConnected && !isBaseNetwork && (
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
              ⚠️ Connected to Base Sepolia recommended for best experience
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 px-3 py-2 bg-neutral-900 text-white text-sm rounded-md hover:bg-neutral-800 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAdd(false);
                setError(null);
                setNewAddress("");
                setNewLabel("");
              }}
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
