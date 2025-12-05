import type { Metadata } from "next";
import "./globals.css";
import "@coinbase/onchainkit/styles.css";
import { Web3Provider } from "@/components/Web3Provider";

export const metadata: Metadata = {
  title: "Tomorrow's Headlines | The Daily Oracle",
  description: "Read tomorrow's news today. AI-generated newspaper headlines powered by Polymarket prediction data, built on Base.",
  keywords: ["prediction markets", "polymarket", "base", "ethereum", "news", "AI"],
  openGraph: {
    title: "Tomorrow's Headlines",
    description: "Read tomorrow's news today. Powered by Polymarket.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=UnifrakturMaguntia&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
