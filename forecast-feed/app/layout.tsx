import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientWrapper } from "@/components/ClientWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Forecast Feed | Social Prediction Tracker",
  description:
    "Follow top forecasters and see their prediction market activity in real-time. Built on Base with Polymarket data.",
  keywords: ["prediction markets", "polymarket", "forecasting", "crypto", "base"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
