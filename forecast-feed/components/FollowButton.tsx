"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import { FORECAST_FOLLOW_ADDRESS, FORECAST_FOLLOW_ABI, BASE_SEPOLIA_CHAIN_ID } from "@/lib/wagmi";

interface FollowButtonProps {
  address: string;
}

export function FollowButton({ address }: FollowButtonProps) {
  const { address: userAddress, isConnected } = useAccount();
  const chainId = useChainId();
  const [isFollowingState, setIsFollowingState] = useState(false);
  const isBaseNetwork = chainId === BASE_SEPOLIA_CHAIN_ID;

  const { data: isFollowing, refetch, error: readError } = useReadContract({
    address: FORECAST_FOLLOW_ADDRESS,
    abi: FORECAST_FOLLOW_ABI,
    functionName: "isFollowing",
    args: userAddress ? [userAddress, address as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress && !!FORECAST_FOLLOW_ADDRESS && isBaseNetwork,
      retry: 2,
    },
  });

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess, isError: receiptError } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (typeof isFollowing === "boolean") {
      setIsFollowingState(isFollowing);
    }
  }, [isFollowing]);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      // Show success feedback
      setIsFollowingState(!isFollowingState);
    }
  }, [isSuccess, refetch]);

  useEffect(() => {
    if (writeError || receiptError) {
      console.error("Follow/Unfollow error:", writeError || receiptError);
    }
  }, [writeError, receiptError]);

  const handleFollow = () => {
    if (!isBaseNetwork) {
      alert("Please switch to Base Sepolia network to follow users");
      return;
    }

    if (!FORECAST_FOLLOW_ADDRESS) {
      // If no contract deployed, just toggle local state
      setIsFollowingState(!isFollowingState);
      return;
    }

    // Validate address format
    if (!address || !address.startsWith("0x") || address.length !== 42) {
      console.error("Invalid address format:", address);
      return;
    }

    try {
      if (isFollowingState) {
        writeContract({
          address: FORECAST_FOLLOW_ADDRESS,
          abi: FORECAST_FOLLOW_ABI,
          functionName: "unfollow",
          args: [address as `0x${string}`],
        });
      } else {
        writeContract({
          address: FORECAST_FOLLOW_ADDRESS,
          abi: FORECAST_FOLLOW_ABI,
          functionName: "follow",
          args: [address as `0x${string}`],
        });
      }
    } catch (err: any) {
      console.error("Follow/Unfollow error:", err);
    }
  };

  if (userAddress?.toLowerCase() === address.toLowerCase()) {
    return null;
  }

  const isLoading = isPending || isConfirming;
  const buttonText = isLoading
    ? "..."
    : isFollowingState
    ? "Following"
    : "Follow";

  if (!isConnected) {
    return (
      <button
        disabled
        className="px-3 py-1.5 rounded-md text-xs font-medium bg-neutral-100 text-neutral-400 cursor-not-allowed"
      >
        Connect
      </button>
    );
  }

  if (!isBaseNetwork) {
    return (
      <button
        disabled
        className="px-3 py-1.5 rounded-md text-xs font-medium bg-amber-100 text-amber-600 cursor-not-allowed"
        title="Switch to Base Sepolia"
      >
        Switch Network
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleFollow}
        disabled={isLoading}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 ${
          isFollowingState
            ? "bg-neutral-100 text-neutral-600 hover:bg-red-50 hover:text-red-600"
            : "bg-neutral-900 text-white hover:bg-neutral-800"
        }`}
      >
        {buttonText}
      </button>
      {hash && (
        <a
          href={`https://sepolia.basescan.org/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          View on BaseScan →
        </a>
      )}
      {(writeError || receiptError) && (
        <span className="text-[10px] text-red-500">
          Transaction failed
        </span>
      )}
    </div>
  );
}
