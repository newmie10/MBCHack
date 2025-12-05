"use client";

import { useAccount, useReadContract } from "wagmi";
import { ORACLE_PROPHECY_ABI, ORACLE_PROPHECY_ADDRESS } from "@/lib/contracts";

interface ProphetStats {
  totalProphecies: bigint;
  correctProphecies: bigint;
  totalPoints: bigint;
  streak: bigint;
  maxStreak: bigint;
  boldestWin: bigint;
}

export function StatsPanel() {
  const { address, isConnected } = useAccount();
  
  const { data: stats } = useReadContract({
    address: ORACLE_PROPHECY_ADDRESS,
    abi: ORACLE_PROPHECY_ABI,
    functionName: "getStats",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && ORACLE_PROPHECY_ADDRESS !== "0x0000000000000000000000000000000000000000"
    }
  });

  const { data: canProphesize } = useReadContract({
    address: ORACLE_PROPHECY_ADDRESS,
    abi: ORACLE_PROPHECY_ABI,
    functionName: "canProphesizeToday",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && ORACLE_PROPHECY_ADDRESS !== "0x0000000000000000000000000000000000000000"
    }
  });

  const { data: totalProphecies } = useReadContract({
    address: ORACLE_PROPHECY_ADDRESS,
    abi: ORACLE_PROPHECY_ABI,
    functionName: "totalProphecies",
    query: {
      enabled: ORACLE_PROPHECY_ADDRESS !== "0x0000000000000000000000000000000000000000"
    }
  });

  const { data: totalBadges } = useReadContract({
    address: ORACLE_PROPHECY_ADDRESS,
    abi: ORACLE_PROPHECY_ABI,
    functionName: "totalBadges",
    query: {
      enabled: ORACLE_PROPHECY_ADDRESS !== "0x0000000000000000000000000000000000000000"
    }
  });

  const prophetStats = stats as ProphetStats | undefined;
  const isContractDeployed = ORACLE_PROPHECY_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const getAccuracy = () => {
    if (!prophetStats || prophetStats.totalProphecies === 0n) return 0;
    return Number((prophetStats.correctProphecies * 100n) / prophetStats.totalProphecies);
  };

  return (
    <div className="stats-panel">
      <h3 className="stats-title">📊 Oracle Stats</h3>
      
      <div className="global-stats">
        <div className="stat-card">
          <span className="stat-value">{isContractDeployed && totalProphecies ? totalProphecies.toString() : "—"}</span>
          <span className="stat-label">Total Prophecies</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{isContractDeployed && totalBadges ? totalBadges.toString() : "—"}</span>
          <span className="stat-label">Badges Earned</span>
        </div>
      </div>

      {isConnected && (
        <>
          {/* Daily Status */}
          <div className="daily-status">
            {canProphesize ? (
              <div className="status-available">
                <span className="status-icon">✅</span>
                <span>Daily prophecy available!</span>
              </div>
            ) : (
              <div className="status-used">
                <span className="status-icon">⏳</span>
                <span>Used today — come back tomorrow</span>
              </div>
            )}
          </div>

          <h4 className="your-stats-title">Your Prophet Stats</h4>
          <div className="your-stats">
            <div className="stat-row highlight-row">
              <span>Total Points</span>
              <span className="stat-highlight points">{prophetStats ? prophetStats.totalPoints.toString() : "0"} pts</span>
            </div>
            <div className="stat-row">
              <span>Prophecies Made</span>
              <span className="stat-highlight">{prophetStats ? prophetStats.totalProphecies.toString() : "0"}</span>
            </div>
            <div className="stat-row">
              <span>Correct</span>
              <span className="stat-highlight success">{prophetStats ? prophetStats.correctProphecies.toString() : "0"}</span>
            </div>
            <div className="stat-row">
              <span>Accuracy</span>
              <span className="stat-highlight">{getAccuracy()}%</span>
            </div>
            <div className="stat-row">
              <span>Current Streak</span>
              <span className="stat-highlight fire">{prophetStats ? prophetStats.streak.toString() : "0"} 🔥</span>
            </div>
            <div className="stat-row">
              <span>Best Streak</span>
              <span className="stat-highlight">{prophetStats ? prophetStats.maxStreak.toString() : "0"}</span>
            </div>
            <div className="stat-row">
              <span>Boldest Win</span>
              <span className="stat-highlight special">{prophetStats ? prophetStats.boldestWin.toString() : "0"} pts ⚡</span>
            </div>
          </div>
        </>
      )}

      {!isConnected && (
        <div className="connect-prompt-stats">
          <p>Connect wallet to track your prophecies</p>
        </div>
      )}
    </div>
  );
}

export function Leaderboard() {
  const { data: leaderboardData } = useReadContract({
    address: ORACLE_PROPHECY_ADDRESS,
    abi: ORACLE_PROPHECY_ABI,
    functionName: "getLeaderboard",
    query: {
      enabled: ORACLE_PROPHECY_ADDRESS !== "0x0000000000000000000000000000000000000000"
    }
  });

  const isContractDeployed = ORACLE_PROPHECY_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Demo data when contract isn't deployed
  const demoLeaderboard = [
    { address: "0x1234...5678", points: 340, correct: 8, streak: 5 },
    { address: "0xabcd...efgh", points: 285, correct: 10, streak: 3 },
    { address: "0x9876...5432", points: 220, correct: 6, streak: 4 },
  ];

  return (
    <div className="leaderboard">
      <h3 className="leaderboard-title">🏆 Top Prophets</h3>
      <p className="leaderboard-subtitle">Ranked by total points</p>
      
      {!isContractDeployed ? (
        <div className="leaderboard-demo">
          <div className="demo-badge small">DEMO</div>
          {demoLeaderboard.map((prophet, index) => (
            <div key={index} className={`leaderboard-row ${index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : ""}`}>
              <span className="rank">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}</span>
              <span className="prophet-address">{prophet.address}</span>
              <span className="prophet-points">{prophet.points} pts</span>
              <span className="prophet-streak">🔥{prophet.streak}</span>
            </div>
          ))}
        </div>
      ) : leaderboardData ? (
        <div className="leaderboard-live">
          {(leaderboardData as [string[], ProphetStats[]])?.[0]?.map((addr, index) => {
            const stats = (leaderboardData as [string[], ProphetStats[]])[1][index];
            return (
              <div key={addr} className={`leaderboard-row ${index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : ""}`}>
                <span className="rank">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}</span>
                <span className="prophet-address">{formatAddress(addr)}</span>
                <span className="prophet-points">{stats.totalPoints.toString()} pts</span>
                <span className="prophet-streak">🔥{stats.streak.toString()}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="leaderboard-empty">
          <p>No prophecies yet. Be the first!</p>
        </div>
      )}
    </div>
  );
}
