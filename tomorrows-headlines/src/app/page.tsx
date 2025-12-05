"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Newspaper } from "@/components/Newspaper";
import { TabNavigation, TabType } from "@/components/TabNavigation";
import { ShareModal } from "@/components/ShareModal";
import { ProphecyModal } from "@/components/ProphecyModal";
import { MintModal } from "@/components/MintModal";
import { WalletConnect } from "@/components/WalletConnect";
import { StatsPanel, Leaderboard } from "@/components/StatsPanel";
import { FormattedMarket } from "@/lib/polymarket";
import { generateHeadlinesFromMarkets, selectLeadStory, Headline, HeadlineCategory } from "@/lib/headlines";

export default function Home() {
  const [allHeadlines, setAllHeadlines] = useState<Headline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  
  // Modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProphecyModalOpen, setIsProphecyModalOpen] = useState(false);
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [selectedHeadline, setSelectedHeadline] = useState<Headline | null>(null);

  const fetchAndGenerateHeadlines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/markets?t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch markets");
      }
      
      const data = await response.json();
      const markets: FormattedMarket[] = data.markets;
      
      if (!markets || markets.length === 0) {
        throw new Error("No market data available");
      }
      
      const generatedHeadlines = generateHeadlinesFromMarkets(markets);
      setAllHeadlines(generatedHeadlines);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndGenerateHeadlines();
  }, [fetchAndGenerateHeadlines]);

  // Filter headlines based on active tab
  const filteredHeadlines = useMemo(() => {
    if (activeTab === "all") {
      return allHeadlines;
    }
    return allHeadlines.filter(h => h.category === activeTab);
  }, [allHeadlines, activeTab]);

  // Select lead story from filtered headlines
  const leadStory = useMemo(() => {
    if (filteredHeadlines.length === 0) return null;
    return selectLeadStory(filteredHeadlines);
  }, [filteredHeadlines]);

  // Count headlines by category for tabs
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allHeadlines.forEach(h => {
      counts[h.category] = (counts[h.category] || 0) + 1;
    });
    return counts;
  }, [allHeadlines]);

  const handleCategoryClick = (category: HeadlineCategory) => {
    setActiveTab(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handlePredict = (headline: Headline) => {
    setSelectedHeadline(headline);
    setIsProphecyModalOpen(true);
  };

  const handleMint = (headline: Headline) => {
    setSelectedHeadline(headline);
    setIsMintModalOpen(true);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="error-state">
          <h2>📰 Printing Press Malfunction</h2>
          <p>{error}</p>
          <button onClick={fetchAndGenerateHeadlines} className="refresh-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Web3 Header */}
      <div className="web3-header">
        <div className="chain-badge">
          <span className="chain-icon">🔵</span>
          <span className="chain-name">Base Sepolia</span>
        </div>
        <WalletConnect />
      </div>

      <div className="page-header">
        <h1 className="page-title">TOMORROW&apos;S HEADLINES</h1>
        <p className="page-subtitle">Prediction markets meet print journalism • Built on Base</p>
      </div>

      {/* Category Tabs */}
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        categoryCounts={categoryCounts}
      />

      <div className="main-layout">
        <div className="content-area">
          {leadStory && filteredHeadlines.length > 0 ? (
            <Newspaper
              headlines={filteredHeadlines}
              leadStory={leadStory}
              isLoading={isLoading}
              onShare={handleShare}
              onCategoryClick={handleCategoryClick}
              onPredict={handlePredict}
              onMint={handleMint}
              currentCategory={activeTab}
            />
          ) : !isLoading ? (
            <div className="newspaper-wrapper">
              <div className="newspaper" style={{ padding: '3rem', textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-headline)', marginBottom: '1rem' }}>
                  No headlines in this category
                </h2>
                <p style={{ color: 'var(--ink-faded)' }}>
                  Try refreshing or check another category
                </p>
                <button 
                  onClick={() => setActiveTab("all")} 
                  className="refresh-button"
                  style={{ marginTop: '1rem', background: 'var(--paper-aged)' }}
                >
                  ← Back to All Headlines
                </button>
              </div>
            </div>
          ) : null}

          {isLoading && !leadStory && (
            <div className="newspaper-wrapper">
              <div className="newspaper" style={{ minHeight: '600px' }}>
                <div className="masthead">
                  <div className="masthead-rule"></div>
                  <h1 className="newspaper-title" style={{ opacity: 0.3 }}>THE DAILY ORACLE</h1>
                  <div className="masthead-rule"></div>
                </div>
                <div className="animate-pulse" style={{ padding: '2rem' }}>
                  <div style={{ height: '2rem', background: '#d4cfc2', marginBottom: '1rem', borderRadius: '2px' }}></div>
                  <div style={{ height: '4rem', background: '#ddd8cb', marginBottom: '1rem', borderRadius: '2px' }}></div>
                  <div style={{ height: '8rem', background: '#e5e0d4', marginBottom: '1rem', borderRadius: '2px' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar with Stats */}
        <div className="sidebar-area">
          <StatsPanel />
          <Leaderboard />
        </div>
      </div>

      <div className="page-header" style={{ marginTop: '2rem' }}>
        <button 
          onClick={fetchAndGenerateHeadlines} 
          className="refresh-button"
          disabled={isLoading}
          style={{ 
            opacity: isLoading ? 0.5 : 1,
            cursor: isLoading ? 'wait' : 'pointer'
          }}
        >
          {isLoading ? "⏳ Printing..." : "🔄 Refresh Headlines"}
        </button>
        {lastUpdated && !isLoading && (
          <p className="page-subtitle" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Modals */}
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        headline={leadStory?.title}
        subtitle={leadStory?.subtitle}
      />
      
      <ProphecyModal
        isOpen={isProphecyModalOpen}
        onClose={() => {
          setIsProphecyModalOpen(false);
          setSelectedHeadline(null);
        }}
        headline={selectedHeadline}
      />
      
      <MintModal
        isOpen={isMintModalOpen}
        onClose={() => {
          setIsMintModalOpen(false);
          setSelectedHeadline(null);
        }}
        headline={selectedHeadline}
      />
    </div>
  );
}
