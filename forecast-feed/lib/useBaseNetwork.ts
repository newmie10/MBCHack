"use client";

import { useAccount, useChainId } from "wagmi";
import { BASE_SEPOLIA_CHAIN_ID } from "./wagmi";

/**
 * Hook to check if user is connected to Base Sepolia network
 * @returns {Object} Network status and helper functions
 */
export function useBaseNetwork() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isBaseNetwork = chainId === BASE_SEPOLIA_CHAIN_ID;

  return {
    isConnected,
    chainId,
    isBaseNetwork,
    isReady: isConnected && isBaseNetwork,
  };
}
