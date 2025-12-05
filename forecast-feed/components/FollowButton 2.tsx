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

  const { data: isFollowing, refetch } = useReadContract({
    address: FORECAST_FOLLOW_ADDRESS,
    abi: FORECAST_FOLLOW_ABI,
    functionName: "isFollowing",
    args: userAddress ? [userAddress, address as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress && !!FORECAST_FOLLOW_ADDRESS,
    },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
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
    }
  }, [isSuccess, refetch]);

  const handleFollow = () => {
    if (!FORECAST_FOLLOW_ADDRESS) {
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

  return (
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
  );
}
