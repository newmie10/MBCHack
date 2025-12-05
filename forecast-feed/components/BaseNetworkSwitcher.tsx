"use client";

import { useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { BASE_SEPOLIA_CHAIN_ID } from "@/lib/wagmi";
import { addBaseSepoliaNetwork } from "@/lib/baseNetwork";

export function BaseNetworkSwitcher() {
  const { isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending, error } = useSwitchChain();
  const [isAdding, setIsAdding] = useState(false);
  const isBaseNetwork = chainId === BASE_SEPOLIA_CHAIN_ID;

  if (!isConnected) {
    return null;
  }

  if (isBaseNetwork) {
    return null; // Already on Base Sepolia
  }

  const handleSwitch = async () => {
    try {
      // Try to switch first
      switchChain({ chainId: BASE_SEPOLIA_CHAIN_ID });
    } catch (err: any) {
      // If switch fails (network not added), try to add it
      if (err?.code === 4902 || err?.message?.includes("Unrecognized chain")) {
        try {
          setIsAdding(true);
          const provider = await connector?.getProvider();
          if (provider) {
            await addBaseSepoliaNetwork(provider);
          }
        } catch (addError) {
          console.error("Failed to add Base Sepolia network:", addError);
        } finally {
          setIsAdding(false);
        }
      }
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 0L11.196 3V9L6 12L0.804 9V3L6 0Z" fill="white"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-900 mb-0.5">
              Switch to Base Sepolia
            </h3>
            <p className="text-xs text-amber-700">
              This app requires Base Sepolia network to interact with contracts.
            </p>
            {error && (
              <p className="text-xs text-red-600 mt-1">
                {error.message || "Failed to switch network"}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleSwitch}
          disabled={isPending || isAdding}
          className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending || isAdding ? "Switching..." : "Switch Network"}
        </button>
      </div>
    </div>
  );
}
