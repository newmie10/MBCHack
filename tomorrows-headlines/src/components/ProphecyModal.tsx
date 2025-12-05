"use client";

import { useState, useMemo, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { ORACLE_PROPHECY_ABI, ORACLE_PROPHECY_ADDRESS } from "@/lib/contracts";
import { Headline } from "@/lib/headlines";

interface ProphecyModalProps {
  isOpen: boolean;
  onClose: () => void;
  headline: Headline | null;
}

// Calculate potential points based on odds-weighted scoring
function calculatePoints(predictedYes: boolean, probability: number): number {
  if (predictedYes) {
    return 100 - probability;
  } else {
    return probability;
  }
}

function getBadgeType(points: number): { type: string; emoji: string; color: string } {
  if (points >= 70) {
    return { type: "PROPHET", emoji: "🔮", color: "#ffd700" };
  } else if (points >= 40) {
    return { type: "CONTRARIAN", emoji: "⚡", color: "#8b5cf6" };
  } else {
    return { type: "ORACLE", emoji: "🏛️", color: "#0052ff" };
  }
}

function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function ProphecyModal({ isOpen, onClose, headline }: ProphecyModalProps) {
  const { isConnected, address } = useAccount();
  const [prediction, setPrediction] = useState<"yes" | "no" | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isContractDeployed = ORACLE_PROPHECY_ADDRESS !== "0x0000000000000000000000000000000000000000";

  // Check if user can make a prophecy today
  const { data: canProphesize, refetch: refetchCanProphesize } = useReadContract({
    address: ORACLE_PROPHECY_ADDRESS,
    abi: ORACLE_PROPHECY_ABI,
    functionName: "canProphesizeToday",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && isContractDeployed
    }
  });

  // Get time until next prophecy
  const { data: timeUntilNext } = useReadContract({
    address: ORACLE_PROPHECY_ADDRESS,
    abi: ORACLE_PROPHECY_ABI,
    functionName: "timeUntilNextProphecy",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && isContractDeployed && canProphesize === false
    }
  });

  // Countdown timer
  useEffect(() => {
    if (timeUntilNext && Number(timeUntilNext) > 0) {
      setTimeRemaining(Number(timeUntilNext));
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            refetchCanProphesize();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeUntilNext, refetchCanProphesize]);

  // Calculate points for each option
  const pointsInfo = useMemo(() => {
    if (!headline) return null;
    
    const yesPoints = calculatePoints(true, headline.probability);
    const noPoints = calculatePoints(false, headline.probability);
    
    return {
      yes: { points: yesPoints, badge: getBadgeType(yesPoints) },
      no: { points: noPoints, badge: getBadgeType(noPoints) },
    };
  }, [headline]);

  const selectedPoints = useMemo(() => {
    if (!prediction || !pointsInfo) return null;
    return prediction === "yes" ? pointsInfo.yes : pointsInfo.no;
  }, [prediction, pointsInfo]);

  if (!isOpen || !headline) return null;

  const handleSubmit = async () => {
    if (!prediction || !headline) return;
    
    writeContract({
      address: ORACLE_PROPHECY_ADDRESS,
      abi: ORACLE_PROPHECY_ABI,
      functionName: "commitProphecy",
      args: [
        headline.marketQuestion,
        prediction === "yes",
        BigInt(headline.probability)
      ],
    });
  };

  const canMakeProphecy = !isContractDeployed || canProphesize !== false;

  return (
    <div className="prophecy-modal-overlay" onClick={onClose}>
      <div className="prophecy-modal" onClick={(e) => e.stopPropagation()}>
        <button className="prophecy-modal-close" onClick={onClose}>×</button>
        
        <div className="prophecy-modal-header">
          <span className="prophecy-icon">🔮</span>
          <h2>Make Your Prophecy</h2>
          <p>Commit your prediction on-chain before the outcome</p>
        </div>

        {/* Daily Limit Banner */}
        <div className="daily-limit-banner">
          <span className="limit-icon">⏰</span>
          <span className="limit-text">1 prophecy per day — choose wisely!</span>
        </div>

        <div className="prophecy-market-info">
          <h3>{headline.title}</h3>
          <p className="prophecy-question">"{headline.marketQuestion}"</p>
          <div className="prophecy-current-odds">
            <span>Current Market Odds:</span>
            <strong>{headline.probability}%</strong>
          </div>
        </div>

        {/* Scoring Explanation */}
        <div className="scoring-explainer">
          <h4>📊 Odds-Weighted Scoring</h4>
          <p>Bolder predictions = more points if correct!</p>
        </div>

        {!isConnected ? (
          <div className="prophecy-connect-prompt">
            <p>Connect your wallet to make prophecies</p>
            <p className="prophecy-subtext">Your predictions will be stored on Base</p>
          </div>
        ) : !canMakeProphecy ? (
          <div className="prophecy-cooldown">
            <span className="cooldown-icon">⏳</span>
            <h3>Already Prophesized Today</h3>
            <p>You've used your daily prophecy.</p>
            <div className="cooldown-timer">
              <span className="timer-label">Next prophecy in:</span>
              <span className="timer-value">{formatTimeRemaining(timeRemaining)}</span>
            </div>
            <p className="prophecy-subtext">Come back tomorrow to make another prediction!</p>
          </div>
        ) : !isContractDeployed ? (
          <div className="prophecy-demo-mode">
            <div className="demo-badge">🎮 DEMO MODE</div>
            <p>Contract not yet deployed to Base Sepolia.</p>
            
            {pointsInfo && (
              <div className="prophecy-options demo">
                <button 
                  className={`prophecy-option yes ${prediction === "yes" ? "selected" : ""}`}
                  onClick={() => setPrediction("yes")}
                >
                  <span className="option-label">YES</span>
                  <span className="option-points" style={{ color: pointsInfo.yes.badge.color }}>
                    +{pointsInfo.yes.points} pts
                  </span>
                  <span className="option-badge">{pointsInfo.yes.badge.emoji} {pointsInfo.yes.badge.type}</span>
                </button>
                <button 
                  className={`prophecy-option no ${prediction === "no" ? "selected" : ""}`}
                  onClick={() => setPrediction("no")}
                >
                  <span className="option-label">NO</span>
                  <span className="option-points" style={{ color: pointsInfo.no.badge.color }}>
                    +{pointsInfo.no.points} pts
                  </span>
                  <span className="option-badge">{pointsInfo.no.badge.emoji} {pointsInfo.no.badge.type}</span>
                </button>
              </div>
            )}

            {selectedPoints && (
              <div className="prophecy-summary">
                <p>
                  If correct, you'll earn <strong style={{ color: selectedPoints.badge.color }}>+{selectedPoints.points} points</strong>
                </p>
                <p className="badge-preview">
                  {selectedPoints.badge.emoji} {selectedPoints.badge.type} Badge
                </p>
              </div>
            )}
          </div>
        ) : isSuccess ? (
          <div className="prophecy-success">
            <span className="success-icon">✨</span>
            <h3>Prophecy Committed!</h3>
            <p>Your prediction has been recorded on-chain.</p>
            {selectedPoints && (
              <p className="points-potential">
                Potential reward: <strong>+{selectedPoints.points} pts</strong> {selectedPoints.badge.emoji}
              </p>
            )}
            <p className="prophecy-subtext">Come back tomorrow for your next prophecy!</p>
            <a 
              href={`https://sepolia.basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="view-tx-btn"
            >
              View Transaction →
            </a>
          </div>
        ) : (
          <>
            {pointsInfo && (
              <div className="prophecy-options">
                <button 
                  className={`prophecy-option yes ${prediction === "yes" ? "selected" : ""}`}
                  onClick={() => setPrediction("yes")}
                  disabled={isPending || isConfirming}
                >
                  <span className="option-label">YES</span>
                  <span className="option-points" style={{ color: pointsInfo.yes.badge.color }}>
                    +{pointsInfo.yes.points} pts
                  </span>
                  <span className="option-badge">{pointsInfo.yes.badge.emoji} {pointsInfo.yes.badge.type}</span>
                </button>
                <button 
                  className={`prophecy-option no ${prediction === "no" ? "selected" : ""}`}
                  onClick={() => setPrediction("no")}
                  disabled={isPending || isConfirming}
                >
                  <span className="option-label">NO</span>
                  <span className="option-points" style={{ color: pointsInfo.no.badge.color }}>
                    +{pointsInfo.no.points} pts
                  </span>
                  <span className="option-badge">{pointsInfo.no.badge.emoji} {pointsInfo.no.badge.type}</span>
                </button>
              </div>
            )}

            {selectedPoints && (
              <div className="prophecy-summary">
                <p>
                  If correct, you'll earn <strong style={{ color: selectedPoints.badge.color }}>+{selectedPoints.points} points</strong>
                </p>
                <p className="badge-preview">
                  {selectedPoints.badge.emoji} {selectedPoints.badge.type} Badge
                </p>
              </div>
            )}

            <button 
              className="prophecy-submit"
              onClick={handleSubmit}
              disabled={!prediction || isPending || isConfirming}
            >
              {isPending ? "Confirm in Wallet..." : isConfirming ? "Committing..." : "🔮 Commit Prophecy"}
            </button>

            {error && (
              <p className="prophecy-error">
                Error: {error.message.slice(0, 100)}...
              </p>
            )}

            <p className="prophecy-disclaimer">
              Free to commit • 1 per day • Points based on boldness
            </p>
          </>
        )}

        <div className="prophecy-badges-preview">
          <h4>Badge Tiers (by points)</h4>
          <div className="badge-types">
            <div className="badge-type">
              <span className="badge-emoji">🏛️</span>
              <span className="badge-name">ORACLE</span>
              <span className="badge-desc">0-39 pts</span>
            </div>
            <div className="badge-type">
              <span className="badge-emoji">⚡</span>
              <span className="badge-name">CONTRARIAN</span>
              <span className="badge-desc">40-69 pts</span>
            </div>
            <div className="badge-type">
              <span className="badge-emoji">🔮</span>
              <span className="badge-name">PROPHET</span>
              <span className="badge-desc">70-100 pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
