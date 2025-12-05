# 📰 Tomorrow's Headlines

> *Read tomorrow's news today. AI-generated newspaper front pages powered by Polymarket prediction data, built on Base.*

![Tomorrow's Headlines](https://img.shields.io/badge/Built%20on-Base-blue)
![Powered by](https://img.shields.io/badge/Powered%20by-Polymarket-purple)
![MBC Hackathon](https://img.shields.io/badge/MBC-Hackathon%202025-gold)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Technical Architecture](#technical-architecture)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [Smart Contract](#smart-contract)
- [API Reference](#api-reference)
- [Team](#team)

---

## Overview

**Tomorrow's Headlines** transforms real-time prediction market data from Polymarket into a beautiful, vintage newspaper experience. See what the world thinks will happen tomorrow, presented as if it already did.

### The Problem

Prediction markets contain valuable signal about future events, but raw probability data is:
- Hard to parse and understand at a glance
- Lacks emotional resonance
- Not shareable or engaging

### Our Solution

We reimagine prediction market data as newspaper headlines:
- **Visual storytelling** - Probabilities become dramatic headlines
- **Familiar format** - Everyone understands a newspaper
- **Shareable** - Screenshot and share your favorite futures
- **On-chain collectibles** - Mint resolved headlines as NFTs on Base

---

## Features

🗞️ **Live Newspaper Generation**
- Real-time data from Polymarket API
- Headlines generated from market probabilities
- Beautiful vintage newspaper aesthetic

📊 **Prediction Market Integration**
- Top markets by volume and interest
- Categories: Politics, Crypto, Tech, Finance, Sports, Science
- Live probability updates

🎨 **Stunning UI**
- Authentic newspaper typography
- Responsive design
- Shareable format

⛓️ **On-Chain NFTs** (Base Sepolia)
- Mint headlines as ERC-721 NFTs
- Fully on-chain SVG metadata
- Capture moments in prediction history

---

## Demo

### Live Application
[View Demo Video](link-to-demo-video)

### Screenshots

```
┌─────────────────────────────────────────────────────────────┐
│              THE DAILY ORACLE                               │
│    "Tomorrow's News, Today's Probabilities"                 │
│═════════════════════════════════════════════════════════════│
│ ┌─────────┐                                                 │
│ │ 73%     │  BITCOIN EYES $150K MILESTONE                  │
│ │ LIKELY  │  Markets give 73% odds to historic price...    │
│ └─────────┘                                                 │
│─────────────────────────────────────────────────────────────│
│ 58% | FED RATE CUT LIKELY TO MATERIALIZE                   │
│ 45% | AI BREAKTHROUGH SET TO ARRIVE                        │
│ 34% | SPACEX LAUNCH MAY SUCCEED                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Newspaper Component   │   Share/Mint UI            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Routes (Next.js)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  /api/      │  │  /api/      │  │  Headline           │ │
│  │  markets    │  │  generate   │  │  Generator          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         │                  │                    
         ▼                  ▼                    
┌─────────────────┐  ┌─────────────────┐  ┌───────────────────┐
│   Polymarket    │  │    OpenAI       │  │   Base Sepolia    │
│   Gamma API     │  │    (optional)   │  │   HeadlineNFT     │
└─────────────────┘  └─────────────────┘  └───────────────────┘
```

### Data Flow

1. **Fetch**: Pull live market data from Polymarket Gamma API
2. **Transform**: Convert probabilities into newspaper headlines
3. **Display**: Render as vintage newspaper UI
4. **Mint** (optional): Save headline on-chain as NFT

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, TypeScript |
| **Styling** | Tailwind CSS, Custom CSS (newspaper theme) |
| **Data Source** | Polymarket Gamma API |
| **AI** (optional) | OpenAI GPT-4 |
| **Blockchain** | Base Sepolia (Ethereum L2) |
| **Smart Contracts** | Solidity, Foundry, OpenZeppelin |
| **Fonts** | Playfair Display, Libre Baskerville, UnifrakturMaguntia |

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Foundry (for contracts)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/tomorrows-headlines
cd tomorrows-headlines

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

Create a `.env.local` file:

```env
# Optional: For AI-enhanced headlines
OPENAI_API_KEY=your_key_here

# For contract deployment
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key
```

### Contract Deployment

```bash
# Navigate to contracts
cd contracts

# Build
forge build

# Deploy to Base Sepolia
forge create src/HeadlineNFT.sol:HeadlineNFT \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY

# Verify on BaseScan
forge verify-contract <CONTRACT_ADDRESS> HeadlineNFT \
  --chain-id 84532 \
  --etherscan-api-key $BASESCAN_API_KEY
```

---

## Smart Contract

### HeadlineNFT.sol

**Address (Base Sepolia):** `[TO BE DEPLOYED]`

The HeadlineNFT contract allows users to mint newspaper headlines as on-chain NFTs with:
- Fully on-chain SVG artwork
- Metadata including probability, category, timestamp
- Original market question preserved

#### Key Functions

```solidity
// Mint a headline
function mintHeadline(
    string memory title,
    string memory subtitle,
    uint256 probability,
    string memory marketQuestion,
    string memory category
) public returns (uint256)

// Get headline data
function getHeadline(uint256 tokenId) public view returns (Headline memory)

// Total minted
function totalSupply() public view returns (uint256)
```

---

## API Reference

### GET /api/markets

Fetches top prediction markets from Polymarket.

**Response:**
```json
{
  "markets": [
    {
      "id": "market-123",
      "question": "Will Bitcoin reach $100k by 2025?",
      "yesPrice": 73,
      "noPrice": 27,
      "volume": 15000000
    }
  ]
}
```

### POST /api/generate

Generates AI-enhanced headlines (requires OpenAI key).

**Request:**
```json
{
  "markets": [/* array of markets */]
}
```

**Response:**
```json
{
  "headlines": [
    {
      "marketId": "0",
      "title": "BITCOIN EYES HISTORIC MILESTONE",
      "subtitle": "Markets signal strong confidence..."
    }
  ]
}
```

---

## Why Base?

We chose Base for Tomorrow's Headlines because:

1. **Low Fees** - Mint NFTs without spending $50 in gas
2. **Fast Finality** - Headlines confirmed in seconds
3. **EVM Compatible** - Full Solidity support
4. **Growing Ecosystem** - Part of the Coinbase/Base community
5. **L2 Advantages** - All the benefits of Ethereum with better UX

---

## Why Polymarket?

Polymarket provides the prediction market data that powers our headlines:

1. **Real Money** - Probabilities backed by actual stakes
2. **Diverse Markets** - Politics, crypto, tech, sports, and more
3. **Public API** - Easy to integrate
4. **Reliable Data** - Large volume and liquidity

---

## Team

**Tomorrow's Headlines** - MBC Hackathon 2025

| Name | Role |
|------|------|
| [Your Name] | Full Stack Developer |

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [Polymarket](https://polymarket.com) for prediction market data
- [Base](https://base.org) for L2 infrastructure
- [OpenZeppelin](https://openzeppelin.com) for contract libraries
- MBC Hackathon organizers

---

*Built with ☕ and prediction market alpha for MBC Hackathon 2025*
