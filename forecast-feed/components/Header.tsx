"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { BASE_SEPOLIA_CHAIN_ID } from "@/lib/wagmi";

function CustomConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="px-5 py-2 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors"
                  >
                    Connect
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="px-5 py-2 bg-red-500 text-white text-sm font-medium rounded-full hover:bg-red-600 transition-colors"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <button
                  onClick={openAccountModal}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-900 text-sm font-medium rounded-full hover:bg-neutral-200 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs">
                    {account.displayName.slice(0, 2)}
                  </div>
                  {account.displayName}
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

export function Header() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isBaseNetwork = chainId === BASE_SEPOLIA_CHAIN_ID;

  return (
    <div className="sticky top-0 z-50 px-4 pt-4 pb-2">
      <header className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md border border-neutral-200 rounded-full px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-neutral-900 text-lg">◆</span>
              <span className="text-base font-bold tracking-tight text-neutral-900">
                Forecast<span className="text-neutral-400 font-medium">Feed</span>
              </span>
            </Link>
            {/* Base Badge */}
            <a
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1"
              title="Built on Base"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 0L11.196 3V9L6 12L0.804 9V3L6 0Z" fill="currentColor"/>
              </svg>
              Base
            </a>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Feed
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Leaderboard
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Base Network Indicator */}
            {isConnected && isBaseNetwork && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                Base Sepolia
              </div>
            )}
            <CustomConnectButton />
          </div>
        </div>
      </header>
    </div>
  );
}
