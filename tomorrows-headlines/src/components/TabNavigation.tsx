"use client";

import { HeadlineCategory } from "@/lib/headlines";

export type TabType = "all" | HeadlineCategory;

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  categoryCounts: Record<string, number>;
}

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: "all", label: "ALL", icon: "📰" },
  { id: "politics", label: "POLITICS", icon: "🏛️" },
  { id: "crypto", label: "CRYPTO", icon: "₿" },
  { id: "tech", label: "TECH", icon: "🚀" },
  { id: "finance", label: "FINANCE", icon: "📈" },
  { id: "sports", label: "SPORTS", icon: "🏆" },
  { id: "science", label: "SCIENCE", icon: "🔬" },
  { id: "world", label: "WORLD", icon: "🌍" },
];

export function TabNavigation({ activeTab, onTabChange, categoryCounts }: TabNavigationProps) {
  return (
    <nav className="tab-navigation">
      <div className="tab-container">
        {tabs.map((tab) => {
          const count = tab.id === "all" 
            ? Object.values(categoryCounts).reduce((a, b) => a + b, 0)
            : categoryCounts[tab.id] || 0;
          
          // Only show tabs that have content (except "all" which always shows)
          if (tab.id !== "all" && count === 0) return null;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {count > 0 && <span className="tab-count">{count}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

