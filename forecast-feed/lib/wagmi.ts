import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Forecast Feed",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "demo",
  chains: [baseSepolia],
  ssr: true,
});

// Contract address - will be updated after deployment
export const FORECAST_FOLLOW_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` | undefined;

export const FORECAST_FOLLOW_ABI = [
  {
    inputs: [{ name: "forecaster", type: "address" }],
    name: "follow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "forecaster", type: "address" }],
    name: "unfollow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getFollowing",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getFollowers",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "forecaster", type: "address" },
    ],
    name: "isFollowing",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "follower", type: "address" },
      { indexed: true, name: "forecaster", type: "address" },
    ],
    name: "Followed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "follower", type: "address" },
      { indexed: true, name: "forecaster", type: "address" },
    ],
    name: "Unfollowed",
    type: "event",
  },
] as const;
