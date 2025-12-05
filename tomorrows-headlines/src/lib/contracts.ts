// Contract ABIs and addresses for Base Sepolia
export const ORACLE_PROPHECY_ADDRESS = "0x0000000000000000000000000000000000000000" as const; // Deploy and update
export const HEADLINE_NFT_ADDRESS = "0x0000000000000000000000000000000000000000" as const; // Deploy and update

export const ORACLE_PROPHECY_ABI = [
  {
    inputs: [
      { name: "marketQuestion", type: "string" },
      { name: "predictedYes", type: "bool" },
      { name: "currentProbability", type: "uint256" }
    ],
    name: "commitProphecy",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "prophet", type: "address" }],
    name: "canProphesizeToday",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "prophet", type: "address" }],
    name: "timeUntilNextProphecy",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "prophet", type: "address" }],
    name: "getProphecies",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "prophecyId", type: "uint256" }],
    name: "getProphecy",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "prophet", type: "address" },
          { name: "marketHash", type: "bytes32" },
          { name: "marketQuestion", type: "string" },
          { name: "predictedYes", type: "bool" },
          { name: "probabilityAtCommit", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "resolved", type: "bool" },
          { name: "wasCorrect", type: "bool" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "prophet", type: "address" }],
    name: "getStats",
    outputs: [
      {
        components: [
          { name: "totalProphecies", type: "uint256" },
          { name: "correctProphecies", type: "uint256" },
          { name: "totalPoints", type: "uint256" },
          { name: "streak", type: "uint256" },
          { name: "maxStreak", type: "uint256" },
          { name: "boldestWin", type: "uint256" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getLeaderboard",
    outputs: [
      { name: "", type: "address[]" },
      {
        components: [
          { name: "totalProphecies", type: "uint256" },
          { name: "correctProphecies", type: "uint256" },
          { name: "contrarian", type: "uint256" },
          { name: "streak", type: "uint256" },
          { name: "maxStreak", type: "uint256" }
        ],
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalProphecies",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalBadges",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "prophecyId", type: "uint256" },
      { indexed: true, name: "prophet", type: "address" },
      { indexed: false, name: "marketQuestion", type: "string" },
      { indexed: false, name: "predictedYes", type: "bool" },
      { indexed: false, name: "probabilityAtCommit", type: "uint256" },
      { indexed: false, name: "timestamp", type: "uint256" }
    ],
    name: "ProphecyCommitted",
    type: "event"
  }
] as const;

export const HEADLINE_NFT_ABI = [
  {
    inputs: [
      { name: "title", type: "string" },
      { name: "subtitle", type: "string" },
      { name: "probability", type: "uint256" },
      { name: "marketQuestion", type: "string" },
      { name: "category", type: "string" }
    ],
    name: "mintHeadline",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getHeadline",
    outputs: [
      {
        components: [
          { name: "title", type: "string" },
          { name: "subtitle", type: "string" },
          { name: "probability", type: "uint256" },
          { name: "marketQuestion", type: "string" },
          { name: "category", type: "string" },
          { name: "timestamp", type: "uint256" },
          { name: "minter", type: "address" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: true, name: "minter", type: "address" },
      { indexed: false, name: "title", type: "string" },
      { indexed: false, name: "probability", type: "uint256" },
      { indexed: false, name: "timestamp", type: "uint256" }
    ],
    name: "HeadlineMinted",
    type: "event"
  }
] as const;

