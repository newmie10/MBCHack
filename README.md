# Forecast Feed 📊

A social media-style feed for prediction market activity. Follow top forecasters, see their bets, and track performance on Polymarket - all powered by Base.

![Forecast Feed](https://img.shields.io/badge/Built%20on-Base-blue) ![Polymarket](https://img.shields.io/badge/Data-Polymarket-purple) ![Next.js](https://img.shields.io/badge/Next.js-16-black)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Smart Contract](#smart-contract)
  - [Contract Overview](#contract-overview)
  - [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Why Base?](#why-base)
- [Team](#team)

## Overview

**Forecast Feed** transforms prediction market trading into a social experience. Instead of just viewing markets, you can:

- **Follow** the best forecasters and learn from their strategies
- **Track** real-time trading activity in a familiar feed format
- **Discover** trending markets based on what top traders are buying
- **Build** your network of trusted predictors

This project integrates **Polymarket's** prediction market data with an on-chain social graph stored on **Base Sepolia**, creating a unique social layer for the prediction market ecosystem.

https://github.com/user-attachments/assets/567f6e8d-7263-41bc-bf34-36583e410177

## Features

### Core Features (MVP)

- **📱 Social Feed**: Real-time activity feed showing trades from Polymarket
- **👥 Follow System**: On-chain follow/unfollow relationships stored on Base
- **📊 Forecaster Profiles**: View trader stats including win rate, volume, and P&L
- **🏆 Leaderboard**: Ranked list of top performing forecasters
- **🔗 Wallet Integration**: Connect with MetaMask, Coinbase Wallet, WalletConnect

### Coming Soon

- **🏅 Verified Track Record Badges**: NFT badges showing verified performance
- **🎫 Prediction Receipts**: Shareable NFTs for winning bets
- **💬 Discussion Threads**: Comment and discuss markets with other forecasters

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │    Feed     │  │   Profile   │  │    Leaderboard      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌───────────────────┐ ┌─────────────┐ ┌─────────────────────┐
│  Polymarket APIs  │ │    Base     │ │     RainbowKit      │
│  (Market Data)    │ │  Sepolia    │ │   (Wallet Connect)  │
│                   │ │ (Follow SC) │ │                     │
└───────────────────┘ └─────────────┘ └─────────────────────┘
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | TailwindCSS 4 |
| Web3 | wagmi, viem, RainbowKit |
| Blockchain | Base Sepolia (Ethereum L2) |
| Data Source | Polymarket CLOB & Gamma APIs |
| Smart Contracts | Solidity 0.8.20, Foundry |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A wallet (MetaMask, Coinbase Wallet, etc.)
- Base Sepolia ETH for transactions ([Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/forecast-feed.git
cd forecast-feed

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# WalletConnect Project ID (optional - get one at https://cloud.walletconnect.com/)
# Not required for basic functionality with MetaMask
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# Deployed contract address on Base Sepolia (optional - app works without it)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# Copy Trade contract address on Base Sepolia (optional)
NEXT_PUBLIC_COPY_TRADE_ADDRESS=0x...
```

**Note:** The app is configured to work on **Base Sepolia** network. Make sure your wallet is connected to Base Sepolia for on-chain interactions.

### Running Locally

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Smart Contract

### Contract Overview

The `ForecastFollow` contract manages on-chain social relationships:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ForecastFollow {
    function follow(address forecaster) external;
    function unfollow(address forecaster) external;
    function getFollowing(address user) external view returns (address[] memory);
    function getFollowers(address forecaster) external view returns (address[] memory);
    function isFollowing(address user, address forecaster) external view returns (bool);
}
```

**Key Features:**
- Gas-efficient storage using swap-and-pop for removals
- Events for indexing (`Followed`, `Unfollowed`)
- Bilateral relationship tracking (followers & following)

### Deployment

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Compile contract
forge build

# Deploy to Base Sepolia
./contracts/deploy.sh YOUR_PRIVATE_KEY
```

**Deployed Contract:** [View on BaseScan](https://sepolia.basescan.org)

## Project Structure

```
forecast-feed/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Main feed page
│   ├── providers.tsx           # Web3 providers (wagmi, RainbowKit)
│   ├── globals.css             # Global styles
│   ├── leaderboard/
│   │   └── page.tsx            # Forecaster rankings
│   ├── profile/
│   │   └── [address]/
│   │       └── page.tsx        # Forecaster profile
│   └── api/
│       ├── feed/
│       │   └── route.ts        # Feed data endpoint
│       └── forecaster/
│           └── [address]/
│               └── route.ts    # Forecaster stats endpoint
├── components/
│   ├── ClientWrapper.tsx       # Client-side wrapper
│   ├── Feed.tsx                # Main activity feed
│   ├── FeedCard.tsx            # Individual trade card
│   ├── FollowButton.tsx        # Follow/unfollow button
│   ├── ForecasterCard.tsx      # Forecaster summary card
│   └── Header.tsx              # Navigation header
├── contracts/
│   ├── ForecastFollow.sol      # Social graph contract
│   └── deploy.sh               # Deployment script
├── lib/
│   ├── polymarket.ts           # Polymarket API integration
│   └── wagmi.ts                # Wagmi/RainbowKit config
├── foundry.toml                # Foundry configuration
└── next.config.ts              # Next.js configuration
```

## API Routes

### `GET /api/feed`

Returns recent trading activity from Polymarket.

**Response:**
```json
[
  {
    "id": "trade-123",
    "type": "trade",
    "trader": "0x1234...",
    "market": {
      "question": "Will Bitcoin reach $150k?",
      "outcomePrices": ["0.42", "0.58"]
    },
    "outcome": "Yes",
    "side": "BUY",
    "size": "500.00",
    "price": "0.42",
    "timestamp": "2024-12-05T10:30:00Z"
  }
]
```

### `GET /api/forecaster/[address]`

Returns stats and recent trades for a specific forecaster.

**Response:**
```json
{
  "address": "0x1234...",
  "totalTrades": 245,
  "totalVolume": 523000,
  "winRate": 0.68,
  "pnl": 42500,
  "recentTrades": [...]
}
```

## Why Base?

We chose **Base** as our L2 for several reasons:

1. **Low Fees**: Storing social relationships on-chain is affordable (typically < $0.01 per transaction)
2. **Fast Finality**: Follow/unfollow actions confirm quickly (~2 seconds)
3. **EVM Compatible**: Easy integration with existing Ethereum tooling (wagmi, viem, etc.)
4. **Coinbase Ecosystem**: Seamless wallet integration for mainstream users
5. **Growing Ecosystem**: Active developer community and resources
6. **Base Sepolia Testnet**: Free testnet ETH available for development and testing

Base's infrastructure allows us to store social data on-chain without prohibitive gas costs, making the follow system genuinely decentralized. All on-chain operations (follows, copy trades) are executed on Base Sepolia with minimal transaction fees.

### Base Network Features

- **Automatic Network Detection**: The app detects if you're on Base Sepolia
- **Network Switching**: One-click network switching to Base Sepolia
- **BaseScan Integration**: All transactions link to BaseScan explorer
- **Base Ecosystem Links**: Direct links to Base documentation and resources

## Hackathon Submission

**Track:** Base (Ethereum L2)  
**Bounty:** Polymarket (Prediction Markets)

### Requirements Met

✅ Deployed on Base Sepolia  
✅ Uses Polymarket APIs for market data  
✅ Public GitHub repository  
✅ Functional demo with UI  
✅ Professional README with setup instructions

### Problem Solved

Prediction markets generate valuable signal about future events, but finding and following skilled forecasters is difficult. Forecast Feed creates a social layer that:

- Surfaces top performing traders
- Makes their activity discoverable
- Enables users to build a network of trusted predictors
- Brings social dynamics to prediction markets

## Team

Built with ❤️ for UBC Hackathon 2025

---

## License

MIT License - see [LICENSE](LICENSE) for details.
