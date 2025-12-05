"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { FORECAST_FOLLOW_ADDRESS, FORECAST_FOLLOW_ABI } from "@/lib/wagmi";

interface FollowButtonProps {
  address: string;
}

export function FollowButton({ address }: FollowButtonProps) {
  const { address: userAddress, isConnected } = useAccount();
  const [isFollowingState, setIsFollowingState] = useState(false);

  // Check if user is following this address
  const { data: isFollowing, refetch } = useReadContract({
    address: FORECAST_FOLLOW_ADDRESS,
    abi: FORECAST_FOLLOW_ABI,
    functionName: "isFollowing",
    args: userAddress ? [userAddress, address as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress && !!FORECAST_FOLLOW_ADDRESS,
    },
  });

  // Write contract hooks
  const { writeContract, data: hash, isPending } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Update state when contract data changes
  useEffect(() => {
    if (typeof isFollowing === "boolean") {
      setIsFollowingState(isFollowing);
    }
  }, [isFollowing]);

  // Refetch after transaction success
  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const handleFollow = () => {
    if (!FORECAST_FOLLOW_ADDRESS) {
      // Demo mode - toggle state locally
      setIsFollowingState(!isFollowingState);
      return;
    }

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
  };

  // Don't show button if viewing own profile
  if (userAddress?.toLowerCase() === address.toLowerCase()) {
    return null;
  }

  const isLoading = isPending || isConfirming;
  const buttonText = isLoading
    ? "..."
    : isFollowingState
    ? "Following"
    : "Follow";

  const buttonStyle = isFollowingState
    ? "bg-zinc-700 hover:bg-red-600 text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  if (!isConnected) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-full text-sm font-medium bg-zinc-800 text-zinc-500 cursor-not-allowed"
      >
        Connect to Follow
      </button>
    );
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${buttonStyle} disabled:opacity-50`}
    >
      {buttonText}
    </button>
  );
}
