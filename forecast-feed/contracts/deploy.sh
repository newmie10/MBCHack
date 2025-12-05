#!/bin/bash

# Deploy ForecastFollow contract to Base Sepolia
# Usage: ./deploy.sh <PRIVATE_KEY>

set -e

PRIVATE_KEY=$1

if [ -z "$PRIVATE_KEY" ]; then
    echo "Usage: ./deploy.sh <PRIVATE_KEY>"
    echo "Get Base Sepolia ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet"
    exit 1
fi

# Base Sepolia RPC
RPC_URL="https://sepolia.base.org"

echo "Deploying ForecastFollow to Base Sepolia..."

# Deploy using forge create
DEPLOYED=$(~/.foundry/bin/forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    contracts/ForecastFollow.sol:ForecastFollow \
    --json)

CONTRACT_ADDRESS=$(echo $DEPLOYED | jq -r '.deployedTo')

echo ""
echo "✅ Contract deployed successfully!"
echo "Contract Address: $CONTRACT_ADDRESS"
echo ""
echo "Add to your .env.local:"
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS"
echo ""
echo "View on BaseScan: https://sepolia.basescan.org/address/$CONTRACT_ADDRESS"
