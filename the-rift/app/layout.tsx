import type { Metadata } from "next";
import { Cinzel, Rajdhani } from "next/font/google";
import "./globals.css";
import { StreakBanner } from "@/components/StreakBanner";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";

const cinzel = Cinzel({ subsets: ["latin"], variable: '--font-cinzel' });
const rajdhani = Rajdhani({ subsets: ["latin"], weight: ['400', '500', '600', '700'], variable: '--font-rajdhani' });

export const metadata: Metadata = {
  title: "The Rift — Daily League of Legends Games",
  description: "6 daily mini-games for League of Legends players. Guess champions from runes, splash art, abilities, builds, and lore.",
  openGraph: { images: ["/og-image.png"] }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${cinzel.variable} ${rajdhani.variable} font-rajdhani bg-background text-text min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <StreakBanner />
          <header className="border-b border-surface p-4 flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <Link href="/" className="font-cinzel text-2xl font-bold text-gold hover:text-gold-light transition-colors">
              THE RIFT
            </Link>
            <nav className="flex gap-6 font-semibold">
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <Link href="#" className="hover:text-gold transition-colors">About</Link>
              <Link href="#" className="hover:text-gold transition-colors">Leaderboard</Link>
            </nav>
          </header>
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
