import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rift Connections — Daily League of Legends puzzle game",
  description: "Test your League of Legends lore and mechanics IQ. Solve the daily 4x4 connections grid by grouping champions based on secret thematic relationships. Made for analysts and Challenger minds.",
  keywords: "League of Legends, LoL Lore, Connections puzzle, NYT Connections, League of legends puzzle game, Rift Connections",
  openGraph: {
    title: "Rift Connections — Daily League of Legends Puzzle Game",
    description: "Decipher champion resources, regions, and combat details in a gorgeous daily 4x4 esports puzzle arena.",
    type: "website",
    url: "https://riftconnections.lol",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
