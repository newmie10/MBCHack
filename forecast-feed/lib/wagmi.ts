import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Base Sepolia RPC endpoint - using public Base RPC
const BASE_SEPOLIA_RPC = "https://sepolia.base.org";

// Enhanced config optimized for Base Sepolia
export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [baseSepolia.id]: http(BASE_SEPOLIA_RPC),
  },
  ssr: true,
});

// Base Sepolia chain ID constant
export const BASE_SEPOLIA_CHAIN_ID = baseSepolia.id;

// Contract addresses - update after deployment
export const FORECAST_FOLLOW_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` | undefined;

export const COPY_TRADE_ADDRESS = process.env
  .NEXT_PUBLIC_COPY_TRADE_ADDRESS as `0x${string}` | undefined;

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
] as const;

export const COPY_TRADE_ABI = [
  {
    inputs: [
      { name: "originalTrader", type: "address" },
      { name: "marketId", type: "string" },
      { name: "outcome", type: "string" },
      { name: "side", type: "string" },
      { name: "amount", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "originalTxHash", type: "bytes32" },
    ],
    name: "copyTrade",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserTrades",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tradeId", type: "uint256" }],
    name: "getTrade",
    outputs: [
      {
        components: [
          { name: "copier", type: "address" },
          { name: "originalTrader", type: "address" },
          { name: "marketId", type: "string" },
          { name: "outcome", type: "string" },
          { name: "side", type: "string" },
          { name: "amount", type: "uint256" },
          { name: "price", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "originalTxHash", type: "bytes32" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserTradeCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
