/**
 * Base Sepolia network configuration
 * Used for adding Base Sepolia to wallets that don't have it
 */
export const BASE_SEPOLIA_NETWORK = {
  chainId: "0x14A34", // 84532 in hex
  chainName: "Base Sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia.base.org"],
  blockExplorerUrls: ["https://sepolia.basescan.org"],
};

/**
 * Add Base Sepolia network to wallet if not already added
 * @param provider - The wallet provider (window.ethereum)
 */
export async function addBaseSepoliaNetwork(provider: any) {
  if (!provider) {
    throw new Error("No wallet provider found");
  }

  try {
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [BASE_SEPOLIA_NETWORK],
    });
  } catch (error: any) {
    // If network already exists, try to switch to it
    if (error.code === 4902) {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_SEPOLIA_NETWORK.chainId }],
      });
    } else {
      throw error;
    }
  }
}
