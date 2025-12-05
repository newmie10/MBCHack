"use client";

import { Headline, HeadlineCategory, formatDate, getTomorrowDate } from "@/lib/headlines";
import { useRef } from "react";

interface NewspaperProps {
  headlines: Headline[];
  leadStory: Headline;
  isLoading?: boolean;
  onShare?: () => void;
  onCategoryClick?: (category: HeadlineCategory) => void;
  onPredict?: (headline: Headline) => void;
  onMint?: (headline: Headline) => void;
  currentCategory?: string;
}

export function Newspaper({ 
  headlines, 
  leadStory, 
  isLoading, 
  onShare, 
  onCategoryClick,
  onPredict,
  onMint,
  currentCategory = "all"
}: NewspaperProps) {
  const newspaperRef = useRef<HTMLDivElement>(null);
  const tomorrowDate = formatDate(getTomorrowDate());
  
  const secondaryHeadlines = headlines.filter(h => h.id !== leadStory.id).slice(0, 5);
  const sidebarHeadlines = headlines.filter(h => h.id !== leadStory.id).slice(5, 8);

  const getCategoryTitle = () => {
    if (currentCategory === "all") return "THE DAILY ORACLE";
    return `THE DAILY ORACLE: ${currentCategory.toUpperCase()}`;
  };

  if (isLoading) {
    return (
      <div className="newspaper-container">
        <div className="animate-pulse">
          <div className="h-12 bg-stone-300 rounded mb-4"></div>
          <div className="h-64 bg-stone-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-stone-200 rounded"></div>
            <div className="h-32 bg-stone-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleCategoryClick = (category: HeadlineCategory) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  return (
    <div className="newspaper-wrapper">
      <div ref={newspaperRef} className="newspaper" id="newspaper-capture">
        {/* Masthead */}
        <header className="masthead">
          <div className="masthead-rule"></div>
          <div className="masthead-top">
            <span className="edition-info">PREDICTION MARKETS EDITION</span>
            <span className="edition-info">POWERED BY POLYMARKET</span>
          </div>
          <h1 className={`newspaper-title ${currentCategory !== "all" ? "with-category" : ""}`}>
            {getCategoryTitle()}
          </h1>
          <p className="newspaper-motto">"Tomorrow's News, Today's Probabilities"</p>
          <div className="masthead-meta">
            <span>{tomorrowDate}</span>
            <span className="divider">◆</span>
            <span>Vol. MMXXV No. 1</span>
            <span className="divider">◆</span>
            <span>Price: FREE (on Base)</span>
          </div>
          <div className="masthead-rule"></div>
        </header>

        {/* Main Content */}
        <main className="newspaper-content">
          {/* Lead Story */}
          <article className="lead-story">
            <div className="probability-badge lead-badge">
              {leadStory.probability}% LIKELY
            </div>
            <h2 className="lead-headline">{leadStory.title}</h2>
            <p className="lead-subtitle">{leadStory.subtitle}</p>
            <div className="lead-body">
              <p className="drop-cap">
                According to prediction market consensus, the question of "{leadStory.marketQuestion}" 
                has reached a {leadStory.probability}% probability of resolving in the affirmative. 
                This represents the collective wisdom of thousands of market participants putting 
                real money behind their forecasts.
              </p>
              <p>
                Market observers note that this probability has been {leadStory.probability >= 50 ? 'climbing' : 'declining'} 
                {' '}in recent trading sessions, suggesting {leadStory.probability >= 50 ? 'growing confidence' : 'increasing uncertainty'} 
                {' '}among forecasters. The volume of trades indicates significant interest in this outcome.
              </p>
            </div>
            <div className="lead-actions">
              <button 
                className="category-tag clickable"
                onClick={() => handleCategoryClick(leadStory.category)}
              >
                {leadStory.category.toUpperCase()}
              </button>
              <div className="headline-actions">
                {onPredict && (
                  <button 
                    className="action-btn predict"
                    onClick={() => onPredict(leadStory)}
                  >
                    🔮 Predict
                  </button>
                )}
                {onMint && (
                  <button 
                    className="action-btn mint"
                    onClick={() => onMint(leadStory)}
                  >
                    🖼️ Mint NFT
                  </button>
                )}
              </div>
            </div>
          </article>

          {/* Secondary Stories Grid */}
          <div className="secondary-stories">
            {secondaryHeadlines.map((headline, index) => (
              <article 
                key={headline.id} 
                className={`secondary-story ${index === 0 ? 'featured' : ''}`}
              >
                <div className="probability-badge">
                  {headline.probability}%
                </div>
                <h3 className="secondary-headline">{headline.title}</h3>
                <p className="secondary-market-question">"{headline.marketQuestion}"</p>
                <p className="secondary-subtitle">{headline.subtitle}</p>
                <div className="secondary-actions">
                  <button 
                    className="category-tag small clickable"
                    onClick={() => handleCategoryClick(headline.category)}
                  >
                    {headline.category}
                  </button>
                  <div className="headline-actions">
                    {onPredict && (
                      <button 
                        className="action-btn predict"
                        onClick={() => onPredict(headline)}
                      >
                        🔮
                      </button>
                    )}
                    {onMint && (
                      <button 
                        className="action-btn mint"
                        onClick={() => onMint(headline)}
                      >
                        🖼️
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            <h4 className="sidebar-header">MARKET WATCH</h4>
            {sidebarHeadlines.map((headline) => (
              <div 
                key={headline.id} 
                className="sidebar-item clickable-row"
                onClick={() => handleCategoryClick(headline.category)}
              >
                <span className="sidebar-prob">{headline.probability}%</span>
                <span className="sidebar-text">{headline.marketQuestion}</span>
              </div>
            ))}
            <div className="powered-by">
              <span>Data from</span>
              <strong>POLYMARKET</strong>
              <span>Built on</span>
              <strong>BASE</strong>
            </div>
          </aside>
        </main>

        {/* Footer */}
        <footer className="newspaper-footer">
          <div className="footer-rule"></div>
          <p>Tomorrow's Headlines is a hackathon project demonstrating prediction market data visualization.</p>
          <p>Probabilities reflect market consensus, not guaranteed outcomes. DYOR. NFA.</p>
        </footer>
      </div>

      {/* Share Button */}
      {onShare && (
        <button onClick={onShare} className="share-button">
          📸 Share This Edition
        </button>
      )}
    </div>
  );
}
