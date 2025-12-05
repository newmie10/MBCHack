"use client";

import Link from "next/link";
import { useChainId } from "wagmi";
import { BASE_SEPOLIA_CHAIN_ID } from "@/lib/wagmi";

export function Footer() {
  const chainId = useChainId();
  const isBaseNetwork = chainId === BASE_SEPOLIA_CHAIN_ID;

  return (
    <footer className="mt-16 pt-8 pb-6 border-t border-neutral-200">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">
              Forecast Feed
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-3">
              A social layer for prediction markets. Follow top forecasters and track their trades on Polymarket.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Powered by</span>
              <a
                href="https://base.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded hover:bg-blue-100 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 0L11.196 3V9L6 12L0.804 9V3L6 0Z" fill="currentColor"/>
                </svg>
                Base
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://docs.base.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  Base Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://sepolia.basescan.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  BaseScan Explorer
                </a>
              </li>
              <li>
                <a
                  href="https://docs.polymarket.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  Polymarket API Docs
                </a>
              </li>
              <li>
                <a
                  href="https://www.coinbase.com/faucets/base-ethereum-goerli-faucet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  Base Sepolia Faucet
                </a>
              </li>
            </ul>
          </div>

          {/* Network Status */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 mb-3">
              Network Status
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isBaseNetwork ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                <span className="text-xs text-neutral-600">
                  {isBaseNetwork ? 'Connected to Base Sepolia' : 'Not on Base Network'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                All on-chain operations use Base Sepolia for low-cost transactions.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-400">
            Built for UBC Hackathon 2025 • Base Track
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              base.org
            </a>
            <span className="text-xs text-neutral-300">•</span>
            <a
              href="https://polymarket.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              polymarket.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
