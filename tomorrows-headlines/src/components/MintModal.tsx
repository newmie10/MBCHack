"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { HEADLINE_NFT_ABI, HEADLINE_NFT_ADDRESS } from "@/lib/contracts";
import { Headline } from "@/lib/headlines";

interface MintModalProps {
  isOpen: boolean;
  onClose: () => void;
  headline: Headline | null;
}

export function MintModal({ isOpen, onClose, headline }: MintModalProps) {
  const { isConnected } = useAccount();
  const [mintState, setMintState] = useState<"idle" | "preview" | "minting" | "success">("idle");
  
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  if (!isOpen || !headline) return null;

  const handleMint = async () => {
    if (!headline) return;
    
    setMintState("minting");
    
    writeContract({
      address: HEADLINE_NFT_ADDRESS,
      abi: HEADLINE_NFT_ABI,
      functionName: "mintHeadline",
      args: [
        headline.title,
        headline.subtitle,
        BigInt(headline.probability),
        headline.marketQuestion,
        headline.category
      ],
    });
  };

  // Update state when transaction succeeds
  if (isSuccess && mintState !== "success") {
    setMintState("success");
  }

  const isContractDeployed = HEADLINE_NFT_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const getProbabilityColor = (prob: number) => {
    if (prob >= 70) return "#22c55e";
    if (prob >= 40) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="mint-modal-overlay" onClick={onClose}>
      <div className="mint-modal" onClick={(e) => e.stopPropagation()}>
        <button className="mint-modal-close" onClick={onClose}>×</button>
        
        <div className="mint-modal-header">
          <span className="mint-icon">🖼️</span>
          <h2>Mint as NFT</h2>
          <p>Preserve this headline on-chain forever</p>
        </div>

        {/* NFT Preview */}
        <div className="nft-preview">
          <div className="nft-card" style={{ borderColor: getProbabilityColor(headline.probability) }}>
            <div className="nft-header">
              <span className="nft-title-small">THE DAILY ORACLE</span>
            </div>
            <div 
              className="nft-prob-badge"
              style={{ background: getProbabilityColor(headline.probability) }}
            >
              {headline.probability}%
            </div>
            <h3 className="nft-headline">{headline.title}</h3>
            <p className="nft-subtitle">{headline.subtitle}</p>
            <div className="nft-footer">
              <span className="nft-category">{headline.category.toUpperCase()}</span>
              <span className="nft-network">BASE</span>
            </div>
          </div>
        </div>

        {!isConnected ? (
          <div className="mint-connect-prompt">
            <p>Connect your wallet to mint NFTs</p>
            <p className="mint-subtext">Your NFT will be minted on Base</p>
          </div>
        ) : !isContractDeployed ? (
          <div className="mint-demo-mode">
            <div className="demo-badge">🎮 DEMO MODE</div>
            <p>Contract not yet deployed to Base Sepolia.</p>
            <p className="mint-subtext">
              Deploy the HeadlineNFT contract and update the address in <code>contracts.ts</code>
            </p>
            <div className="mint-details demo">
              <div className="detail-row">
                <span>Network</span>
                <span>Base Sepolia</span>
              </div>
              <div className="detail-row">
                <span>Standard</span>
                <span>ERC-721</span>
              </div>
              <div className="detail-row">
                <span>Metadata</span>
                <span>100% On-chain SVG</span>
              </div>
              <div className="detail-row">
                <span>Price</span>
                <span>FREE (gas only)</span>
              </div>
            </div>
          </div>
        ) : mintState === "success" ? (
          <div className="mint-success">
            <span className="success-icon">🎉</span>
            <h3>NFT Minted!</h3>
            <p>Your headline has been immortalized on Base.</p>
            <div className="success-links">
              <a 
                href={`https://sepolia.basescan.org/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="view-tx-btn"
              >
                View Transaction →
              </a>
              <a 
                href={`https://testnets.opensea.io/account`}
                target="_blank"
                rel="noopener noreferrer"
                className="view-opensea-btn"
              >
                View on OpenSea →
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="mint-details">
              <div className="detail-row">
                <span>Network</span>
                <span>Base Sepolia</span>
              </div>
              <div className="detail-row">
                <span>Standard</span>
                <span>ERC-721</span>
              </div>
              <div className="detail-row">
                <span>Metadata</span>
                <span>100% On-chain SVG</span>
              </div>
              <div className="detail-row">
                <span>Price</span>
                <span>FREE (gas only)</span>
              </div>
            </div>

            <button 
              className="mint-submit"
              onClick={handleMint}
              disabled={isPending || isConfirming}
            >
              {isPending ? "Confirm in Wallet..." : isConfirming ? "Minting..." : "🖼️ Mint NFT"}
            </button>

            {error && (
              <p className="mint-error">
                Error: {error.message.slice(0, 100)}...
              </p>
            )}

            <p className="mint-disclaimer">
              Free to mint • 100% on-chain • Forever on Base
            </p>
          </>
        )}
      </div>
    </div>
  );
}

