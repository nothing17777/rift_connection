"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Calendar, Trophy, Award, Sparkles, Shield, ChevronRight, CheckCircle2, XCircle, Terminal, HelpCircle } from "lucide-react";
import { useGameStore } from "@/store/game-store";
import { getPuzzleDateList, getLatestPuzzleDate, getPuzzleByDate } from "@/lib/puzzle-data";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { Typewriter } from "@/components/ui/typewriter";
import { TeemoScene } from "@/components/ui/teemo-scene";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";

export default function Home() {
  const { solvedHistory, currentStreak, _hasHydrated } = useGameStore();
  const latestDate = getLatestPuzzleDate();

  const formatPuzzleDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-");
      const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusBadge = (date: string) => {
    if (!_hasHydrated) {
      return (
        <span className="text-[10px] font-mono tracking-widest text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
          SYNCING
        </span>
      );
    }

    const outcome = solvedHistory[date];
    if (outcome === "won") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono tracking-widest text-green-400 bg-green-500/10 border border-green-500/30 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.2)] font-semibold">
          <CheckCircle2 size={10} className="stroke-[2.5px]" />
          VICTORY
        </span>
      );
    }
    if (outcome === "lost") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono tracking-widest text-red-400 bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.2)] font-semibold">
          <XCircle size={10} className="stroke-[2.5px]" />
          DEFEAT
        </span>
      );
    }
    if (date === latestDate) {
      return (
        <span className="text-[10px] font-mono tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/40 px-2.5 py-0.5 rounded-full animate-pulse font-semibold shadow-[0_0_10px_rgba(59,130,246,0.3)]">
          ACTIVE
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono tracking-widest text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full">
        ARCHIVED
      </span>
    );
  };

  const testimonials = [
    { text: "Finally, a daily connections puzzle that matches my level of brain-teasing chaos. Let's go!", image: "https://ddragon.leagueoflegends.com/cdn/16.10.1/img/champion/Jinx.png", name: "Jinx", role: "Zaun Outlaw" },
    { text: "I cannot see the champion puzzle board, yet I feel the underlying connection of all magic in the Rift.", image: "https://ddragon.leagueoflegends.com/cdn/16.10.1/img/champion/LeeSin.png", name: "Lee Sin", role: "Ionian Monk" },
    { text: "Never underestimate the power of the scout's daily puzzle! Tricky shrooms and nodes aligned.", image: "https://ddragon.leagueoflegends.com/cdn/16.10.1/img/champion/Teemo.png", name: "Teemo", role: "Bandle Scout" },
    { text: "This daily minigame shines so bright. A Challenger-level brain teaser for every master analyst and coach.", image: "https://ddragon.leagueoflegends.com/cdn/16.10.1/img/champion/Lux.png", name: "Lux", role: "Demacian Mage" },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden font-rajdhani select-none">
      {/* 1. Standalone Fixed Shader Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <ShaderAnimation />
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none bg-radial-vignette" />

      {/* 2. Cyber HUD Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-900/60 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-russo text-lg tracking-wider text-slate-200">
            RIFT <span className="text-blue-500">CONNECTIONS</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900/60 border border-slate-800/80 font-mono text-[10px] tracking-widest text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>COMMAND ONLINE</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-slate-800 bg-slate-900 font-mono text-[10px] tracking-wider text-slate-200">
            <Award className="w-3.5 h-3.5 text-yellow-500" />
            <span>STREAK: <span className="text-yellow-500 font-semibold">{currentStreak}</span></span>
          </div>
        </div>
      </header>

      {/* 3. Hero Region */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-80px)]">
        
        {/* Left Column: Title & Action terminals */}
        <div className="lg:col-span-7 flex flex-col justify-center items-start text-left gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/15 border border-blue-500/30 rounded text-xs font-mono tracking-widest text-blue-300">
            <Terminal size={12} className="text-blue-400 animate-pulse" />
            <span>DAILY 4X4 CONNECTION PUZZLE</span>
          </div>

          <div className="flex flex-col gap-2 font-cinzel">
            <h1 className="text-5xl sm:text-7xl xl:text-8xl font-black tracking-tight text-glow-blue text-transparent bg-gradient-to-r from-blue-300 via-indigo-400 to-blue-100 bg-clip-text">
              RIFT
            </h1>
            <h1 className="text-5xl sm:text-7xl xl:text-8xl font-black tracking-tight text-glow-purple text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-300 bg-clip-text">
              CONNECTIONS
            </h1>
          </div>

          {/* Terminal Typewriter Terminal Subtitle */}
          <div className="w-full max-w-2xl p-5 rounded-lg border border-slate-800 bg-slate-950/90 shadow-[0_0_30px_rgba(59,130,246,0.1)] font-mono text-sm leading-relaxed text-slate-300 select-text">
            <div className="flex items-center gap-1.5 text-[9px] text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 font-semibold">Command Console // init_intelligence</span>
            </div>
            
            <Typewriter 
              text={[
                "> SECURE GUESS: Connect 16 champions in 4 groups of 4 based on their shared mechanics, regions, items, or lore attributes.",
                "> SYNERGY LOCKED: Identify hidden alignments like Energy users, Freljord native clans, and cosmic Shadow Isles wraiths.",
                "> CHALLENGER STATS: One daily puzzle resets every night. Protect your win streak, challenge friends, and dominate the leaderboard."
              ]}
              speed={40}
              waitTime={3000}
              deleteSpeed={15}
              className="text-slate-300 leading-6"
              cursorClassName="text-blue-400"
            />
          </div>

          {/* Interactive CTAs */}
          <div className="flex flex-wrap gap-4 mt-4 w-full">
            <Link 
              href={`/play?date=${latestDate}`}
              className="px-8 py-4 rounded bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-russo text-sm tracking-wider uppercase border border-blue-400/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] flex items-center gap-3"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              Play Connections Puzzle
            </Link>

            <Link
              href="/play?date=unlimited"
              className="px-8 py-4 rounded-md font-russo uppercase tracking-wider text-sm transition-all duration-300 border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 shadow-lg relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-slate-800/50 w-full h-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 z-0"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Play Unlimited Mode
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>

        {/* Right Column: 3D Mascot in Cyber Frame */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="relative w-full max-w-[420px] aspect-square rounded-2xl p-0.5 bg-gradient-to-tr from-blue-500/20 via-slate-800 to-purple-500/20 shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden group">
            {/* Ambient cyber grid scan lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10 opacity-40" />
            
            {/* Golden corner HUD bracket details */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-yellow-500/60 pointer-events-none z-10" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-yellow-500/60 pointer-events-none z-10" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-yellow-500/60 pointer-events-none z-10" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-yellow-500/60 pointer-events-none z-10" />

            <div className="w-full h-full rounded-2xl bg-slate-950 overflow-hidden relative">
              <Suspense fallback={
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin" />
                  <span className="font-mono text-[9px] text-slate-500 tracking-wider">PREPARING PUZZLE...</span>
                </div>
              }>
                <TeemoScene className="w-full h-full" />
              </Suspense>
              
              {/* Mascot Status Badge Overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-950/80 border border-slate-800 backdrop-blur-md rounded-full py-1.5 px-4 z-10 flex items-center gap-2 font-mono text-[9px] text-slate-400 tracking-wider shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>3D SCENE: TEEMO MASCOT ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Archive: Horizontal Scroll of Past Puzzles */}
      <section id="archives" className="relative z-10 bg-slate-900/40 border-t border-slate-900 py-16 scroll-mt-6">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="font-mono text-[10px] tracking-widest text-yellow-500 uppercase flex items-center gap-2 mb-2">
                <Calendar size={11} /> Match History
              </span>
              <h2 className="font-cinzel text-2xl md:text-3xl text-slate-200 uppercase tracking-wide">
                Puzzle Archives
              </h2>
            </div>
            <Link
              href="/play?date=unlimited"
              className="hidden md:flex items-center gap-2 font-mono text-[10px] tracking-widest text-blue-400 hover:text-blue-300 transition-colors uppercase"
            >
              Play Unlimited <ChevronRight size={12} />
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}>
            {getPuzzleDateList().map((d) => {
              const isLatest = d === latestDate;

              return (
                <React.Fragment key={d}>
                  {/* Each day gets two cards: one per mode */}
                  {(['champions', 'abilities'] as const).map(cardMode => {
                    const cardPuzz = getPuzzleByDate(d, cardMode);
                    if (!cardPuzz) return null;
                    const storeKey = `${d}:${cardMode}`;
                    const outcome = solvedHistory[storeKey];
                    const isAbility = cardMode === 'abilities';

                    return (
                      <Link
                        href={isLatest ? `/play?mode=${cardMode}` : `/play?date=${d}&mode=${cardMode}`}
                        key={`${d}-${cardMode}`}
                        className={`min-w-[200px] snap-center shrink-0 group rounded-md p-5 border transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[160px] ${
                          outcome === 'won'
                            ? 'border-green-800/50 bg-green-950/10 hover:border-green-700'
                            : outcome === 'lost'
                            ? 'border-red-900/50 bg-red-950/10 hover:border-red-800'
                            : isLatest
                            ? 'border-blue-500/40 bg-blue-950/20 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                            : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-3">
                          <span className={`font-mono text-[9px] tracking-widest uppercase ${isLatest ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
                            {isLatest ? 'TODAY' : `#${cardPuzz.puzzleNumber}`}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {outcome === 'won' && <span className="flex items-center gap-1 font-mono text-[8px] text-green-400 border border-green-900 bg-green-950/40 px-1.5 py-0.5 rounded uppercase"><CheckCircle2 size={8} />Won</span>}
                            {outcome === 'lost' && <span className="flex items-center gap-1 font-mono text-[8px] text-red-400 border border-red-900 bg-red-950/40 px-1.5 py-0.5 rounded uppercase"><XCircle size={8} />Lost</span>}
                          </div>
                        </div>

                        <div className="flex-1">
                          <p className="font-russo text-sm text-slate-200 group-hover:text-white transition-colors uppercase">
                            {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="font-mono text-[9px] text-slate-500 mt-1 uppercase tracking-wider line-clamp-1">
                            {cardPuzz.categories[0]?.title ?? '—'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60 font-mono text-[9px] tracking-wider text-slate-500 group-hover:text-blue-400 transition-colors">
                          <span>{outcome ? 'Review' : isLatest ? 'Play Now' : 'Replay'}</span>
                          <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Scrolling Praise / Feedback column */}
      <section className="relative z-10 py-24 border-t border-slate-900 bg-slate-950">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Header details */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-xs font-mono tracking-widest text-purple-400">
                <Sparkles size={12} />
                <span>CHAMPIONS FEEDBACK</span>
              </div>

              <h2 className="font-cinzel text-3xl md:text-5xl text-slate-200 tracking-wide uppercase">
                THE COMMENDATION
              </h2>
              
              <p className="text-slate-400 font-rajdhani text-base md:text-lg leading-relaxed">
                See what active legends, outlaws, and master tacticians across Runeterra are saying about their connections puzzles. 
              </p>

              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-start gap-4">
                <HelpCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-russo text-xs text-yellow-500 tracking-wide uppercase">DID YOU KNOW?</h4>
                  <p className="text-slate-400 text-xs leading-relaxed font-normal">
                    Puzzles are procedurally generated from a set of 40 disjoint champion relationship pools, ensuring a unique puzzle board every day.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side: Auto-scrolling vertical Testimonial marquee columns */}
            <div className="lg:col-span-7 h-[420px] overflow-hidden relative rounded-xl border border-slate-900/60 bg-slate-900/20">
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-slate-950 to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 h-full items-start overflow-hidden">
                <TestimonialsColumn 
                  testimonials={testimonials.slice(0, 2)} 
                  duration={12}
                  className="h-full bg-transparent overflow-hidden" 
                />
                <TestimonialsColumn 
                  testimonials={testimonials.slice(2, 4)} 
                  duration={16}
                  className="h-full bg-transparent overflow-hidden hidden md:block" 
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="relative z-10 bg-slate-950 border-t border-slate-900/60 py-12">
        <div className="w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center gap-6">
          <h3 className="font-russo text-base tracking-widest text-slate-400">
            RIFT <span className="text-blue-500">CONNECTIONS</span>
          </h3>
          
          <div className="flex flex-wrap justify-center gap-6 text-xs font-mono tracking-wider text-slate-500 uppercase">
            <Link href="/" className="hover:text-blue-400 transition-colors">Portal</Link>
            <Link href={`/play?date=${latestDate}`} className="hover:text-blue-400 transition-colors">Daily Puzzle</Link>
            <Link href="/play?date=unlimited" className="hover:text-blue-400 transition-colors">Unlimited Mode</Link>
          </div>

          <p className="max-w-2xl text-[10px] font-mono leading-relaxed text-slate-600 mt-4">
            Rift Connections isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.
          </p>

          <p className="text-[9px] font-mono text-slate-700">
            © {new Date().getFullYear()} RIFT CONNECTIONS. All battle coordinates secured.
          </p>
        </div>
      </footer>
    </div>
  );
}