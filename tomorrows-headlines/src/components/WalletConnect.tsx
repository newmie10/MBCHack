"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState } from "react";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showOptions, setShowOptions] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <span className="wallet-indicator"></span>
          <span className="wallet-address">{formatAddress(address)}</span>
        </div>
        <button 
          onClick={() => disconnect()} 
          className="wallet-disconnect"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connect-container">
      {!showOptions ? (
        <button 
          onClick={() => setShowOptions(true)}
          className="wallet-connect-btn"
          disabled={isPending}
        >
          {isPending ? "Connecting..." : "🔗 Connect Wallet"}
        </button>
      ) : (
        <div className="wallet-options">
          <button 
            onClick={() => setShowOptions(false)}
            className="wallet-options-close"
          >
            ×
          </button>
          <p className="wallet-options-title">Connect your wallet</p>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => {
                connect({ connector });
                setShowOptions(false);
              }}
              className="wallet-option-btn"
              disabled={isPending}
            >
              {connector.name === "Coinbase Wallet" ? "🔵 " : "💳 "}
              {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function useWallet() {
  const { address, isConnected, chain } = useAccount();
  return { address, isConnected, chain };
}

