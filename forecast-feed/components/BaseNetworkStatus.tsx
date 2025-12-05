"use client";

import { useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { BASE_SEPOLIA_CHAIN_ID } from "@/lib/wagmi";
import { addBaseSepoliaNetwork } from "@/lib/baseNetwork";

export function BaseNetworkStatus() {
  const { isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [isAdding, setIsAdding] = useState(false);
  const isBaseNetwork = chainId === BASE_SEPOLIA_CHAIN_ID;

  if (!isConnected) {
    return null;
  }

  const handleSwitch = async () => {
    if (isBaseNetwork) return;
    
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
    <button
      onClick={handleSwitch}
      disabled={isPending || isAdding || isBaseNetwork}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:cursor-default ${
        isBaseNetwork 
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default' 
          : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer'
      }`}
    >
      <div className={`w-2 h-2 rounded-full ${isBaseNetwork ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      <span>
        {isPending || isAdding
          ? 'Switching...' 
          : isBaseNetwork 
            ? 'On Base Sepolia' 
            : 'Switch to Base Sepolia'}
      </span>
    </button>
  );
}
