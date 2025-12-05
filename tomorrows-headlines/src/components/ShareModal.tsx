"use client";

import { useState } from "react";
import { downloadNewspaper, shareNewspaper, copyShareLink } from "@/lib/share";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  headline?: string;
  subtitle?: string;
}

export function ShareModal({ isOpen, onClose, headline, subtitle }: ShareModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    await downloadNewspaper();
    setIsGenerating(false);
  };

  const handleShare = async () => {
    setIsGenerating(true);
    await shareNewspaper('newspaper-capture', headline, subtitle);
    setIsGenerating(false);
  };

  const handleCopyLink = () => {
    copyShareLink(headline);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `📰 Tomorrow's Headlines from The Daily Oracle\n\n${headline ? `"${headline}"\n\n` : ''}Read tomorrow's news today, powered by @Polymarket prediction data\n\nBuilt on @base 🔵`
  )}`;

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <button className="share-modal-close" onClick={onClose}>×</button>
        
        <h2 className="share-modal-title">Share This Edition</h2>
        <p className="share-modal-subtitle">
          Spread the word about tomorrow's predictions
        </p>

        <div className="share-options">
          <button 
            className="share-option-btn download"
            onClick={handleDownload}
            disabled={isGenerating}
          >
            <span className="share-icon">📥</span>
            <span className="share-label">
              {isGenerating ? "Generating..." : "Download Image"}
            </span>
          </button>

          <button 
            className="share-option-btn native"
            onClick={handleShare}
            disabled={isGenerating}
          >
            <span className="share-icon">📤</span>
            <span className="share-label">
              {isGenerating ? "Generating..." : "Share Image"}
            </span>
          </button>

          <a 
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="share-option-btn twitter"
          >
            <span className="share-icon">𝕏</span>
            <span className="share-label">Share on X</span>
          </a>

          <button 
            className="share-option-btn copy"
            onClick={handleCopyLink}
          >
            <span className="share-icon">{copied ? "✓" : "📋"}</span>
            <span className="share-label">
              {copied ? "Copied!" : "Copy Text"}
            </span>
          </button>
        </div>

        <div className="share-preview">
          <p className="share-preview-label">Preview text:</p>
          <div className="share-preview-text">
            📰 Tomorrow's Headlines from The Daily Oracle
            {headline && (
              <>
                <br />
                <br />
                "{headline}"
              </>
            )}
            <br />
            <br />
            Powered by Polymarket • Built on Base
          </div>
        </div>
      </div>
    </div>
  );
}

