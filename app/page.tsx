"use client";
import { useScroll, useTransform, motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { FallingPattern } from "@/components/ui/falling-pattern";
import AnoAI from "@/components/ui/animated-shader-background";
import { Swords, Map, BookOpen, Zap, ScrollText, Package, Trophy, Flame, ChevronDown, Calendar } from "lucide-react";
import Link from "next/link";
import { Demo as SparklesDemo } from "@/components/ui/sparkles-demo";

export default function Home() {
  // Add useEffect to set body background
  useEffect(() => {
    document.body.style.background = '#0a0e1a';
    return () => { document.body.style.background = ''; };
  }, []);
  // Cycling index for title animation
  const [cyclingIndex, setCyclingIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCyclingIndex(prev => (prev + 1) % 6);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Games data
  const games = [
    { title: "RuneGuess", description: "Identify a champion from their rune page", icon: Swords, difficulty: "Competitive", href: "/rune-guess", color: "#c8a84b" },
    { title: "Splash Crop", description: "Guess the champion from a cropped splash art", icon: Map, difficulty: "Casual", href: "/splash-crop", color: "#c8a84b" },
    { title: "Ability Chain", description: "Identify from a sequence of ability effects", icon: Zap, difficulty: "Hardcore", href: "/ability-chain", color: "#c8a84b" },
    { title: "Who Built This?", description: "Guess the champion from their item build", icon: Package, difficulty: "Casual", href: "/who-built-this", color: "#c8a84b" },
    { title: "Patch Survivor", description: "Spot real vs fake patch note entries", icon: ScrollText, difficulty: "Competitive", href: "/patch-survivor", color: "#c8a84b" },
    { title: "LoreLink", description: "Connect two champions through lore nodes", icon: BookOpen, difficulty: "Hardcore", href: "/lore-link", color: "#c8a84b" },
  ];

  // Stats data
  const stats = [
    { number: "168+", label: "Champions" },
    { number: "6", label: "Daily Puzzles" },
    { number: "∞", label: "Combinations" },
    { number: "1", label: "Shot Per Day" },
  ];

  // Steps data
  const steps = [
    { icon: Calendar, title: "New Puzzle Daily", desc: "Six fresh challenges appear every day at midnight. Same puzzles for every player worldwide." },
    { icon: Trophy, title: "One Guess Per Game", desc: "You get limited attempts. Think carefully — there are no second chances once the day ends." },
    { icon: Flame, title: "Build Your Streak", desc: "Complete all 6 games daily to maintain your streak. Share results and challenge your friends." },
  ];

  // Title component for ContainerScroll Header
  const titleComponent = (
    <div className="mb-12">
      <div className="mb-6" style={{animation: 'fadeInDown 0.8s ease-out forwards'}}>
        <div className="inline-flex items-center gap-2 px-6 py-3 backdrop-blur-md border border-[#c8a84b]/30 rounded-full text-sm bg-[#c8a84b]/10 mb-8">
          <Flame size={14} className="text-[#c8a84b]" />
          <span className="text-[#e8e0cc] font-rajdhani tracking-widest">6 NEW PUZZLES DROP DAILY AT MIDNIGHT</span>
        </div>
      </div>
      <h1 style={{fontFamily: 'Cinzel, serif', animation: 'fadeInUp 0.8s ease-out 0.2s forwards', opacity: 0}} className="text-6xl md:text-8xl lg:text-9xl font-bold text-[#c8a84b] mb-2 tracking-tight" >
        THE RIFT
      </h1>
      <div className="h-16 overflow-hidden relative" style={{animation: 'fadeInUp 0.8s ease-out 0.4s forwards', opacity: 0}}>
        {["RuneGuess", "Splash Crop", "LoreLink", "Ability Chain", "Patch Survivor", "Who Built This?"].map((title, index, arr) => (
          <motion.span
            key={title}
            style={{fontFamily: 'Cinzel, serif'}}
            className="absolute inset-0 flex items-center justify-center text-2xl md:text-3xl font-semibold text-[#f0d080]"
            initial={{ opacity: 0, y: 60 }}
            animate={cyclingIndex === index ? { opacity: 1, y: 0 } : { opacity: 0, y: cyclingIndex > index ? -60 : 60 }}
            transition={{ type: "spring", stiffness: 50 }}
          >
            {title}
          </motion.span>
        ))}
      </div>
      <p style={{fontFamily: 'Rajdhani, sans-serif', animation: 'fadeInUp 0.8s ease-out 0.6s forwards', opacity: 0}} className="text-lg md:text-xl text-[#e8e0cc]/70 mt-4 max-w-2xl mx-auto">
        Six League of Legends puzzles. One shot per day.
      </p>
      <div style={{animation: 'fadeInUp 0.8s ease-out 0.8s forwards', opacity: 0}} className="flex items-center justify-center gap-2 mt-6 text-[#c8a84b]/40">
        <ChevronDown size={20} className="animate-bounce" />
        <span className="font-rajdhani text-sm tracking-widest">SCROLL TO EXPLORE</span>
        <ChevronDown size={20} className="animate-bounce" />
      </div>
    </div>
  );

  return (
    <main className="relative overflow-x-hidden bg-[#0a0e1a]">
      {/* AnoAI shader background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AnoAI />
      </div>
      
      {/* Page content with AnimatePresence for page transitions */}
      <AnimatePresence initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="relative z-10">
          {/* Main ContainerScroll wrapper - this creates the scroll-driven 3D effect */}
          <ContainerScroll titleComponent={titleComponent}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {games.map((game, index) => (
                <motion.div
                  key={game.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(200,168,75,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-[#0a0e1a] border border-[#c8a84b]/20 rounded-xl p-6 flex flex-col h-full"
                >
                  <div className="flex items-center justify-center mb-4">
                    <game.icon size={40} className={game.color} />
                  </div>
                  <h3 className="mb-3 text-center font-cinzel text-[#c8a84b]">{game.title}</h3>
                  <p className="flex-1 text-center text-[#e8e0cc]/70 font-rajdhani">{game.description}</p>
                  <span className={`self-start mt-3 px-2 py-1 rounded text-xs font-rajdhani 
                    ${game.difficulty === "Casual" ? "text-green-400 border-green-400/40 bg-green-400/10" : 
                      game.difficulty === "Competitive" ? "text-yellow-400 border-yellow-400/40 bg-yellow-400/10" : 
                      "text-red-400 border-red-400/40 bg-red-400/10"}
                  `}>
                    {game.difficulty}
                  </span>
                  <Link href={game.href} className="mt-auto self-end text-[#c8a84b] font-rajdhani hover:underline">
                    Play Now &rarr;
                  </Link>
                </motion.div>
              ))}
            </div>
          </ContainerScroll>
          
          {/* Sections that appear after scrolling past the ContainerScroll */}
          {/* Stats Bar */}
          <div className="bg-[#111827] border-y border-[#c8a84b]/20 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto px-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-200px" }}
                  className="flex flex-col items-center text-center"
                >
                  <span className="font-cinzel text-4xl text-[#c8a84b]">
                    {stat.number}
                  </span>
                  <span className="font-rajdhani text-sm text-[#e8e0cc]/60 tracking-widest uppercase">
                    {stat.label}
                  </span>
                  {index !== stats.length - 1 && <div className="w-px h-6 bg-[#c8a84b]/20 self-stretch hidden md:block" />}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Feature Strip */}
          <div className="relative h-96">
            <FallingPattern 
              color="#c8a84b" 
              backgroundColor="#0a0e1a" 
              duration={100} 
              blurIntensity="1.5em"
              className="absolute inset-0"
            />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
              <h1 className="font-cinzel text-3xl md:text-5xl text-[#c8a84b] text-gold-glow">
                WHERE KNOWLEDGE MEETS THE GAME
              </h1>
              <p className="font-rajdhani tracking-widest text-sm text-[#c8a84b]/50 mt-2">
                THE RIFT
              </p>
            </div>
          </div>

          {/* How It Works */}
          <section className="bg-[#0a0e1a] py-24 max-w-7xl mx-auto px-4">
            <h2 className="font-cinzel text-4xl text-[#c8a84b] text-center mb-16">
              HOW IT WORKS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-[#111827] border border-[#c8a84b]/20 rounded-xl p-8 text-center"
                >
                  <div className="relative h-16 w-16 mx-auto mb-6">
                    <div className="absolute inset-0 font-cinzel text-6xl text-[#c8a84b]/20">
                      {index + 1}
                    </div>
                    <step.icon size={32} className="text-[#c8a84b] relative z-10" />
                  </div>
                  <h3 className="font-cinzel text-[#c8a84b] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#e8e0cc]/70 font-rajdhani">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          <SparklesDemo />

          {/* Footer */}
          <footer className="bg-[#0a0e1a] border-t border-[#c8a84b]/10 py-12">
            <div className="flex flex-col items-center text-center gap-4">
              <h2 className="font-cinzel text-2xl text-[#c8a84b]">
                THE RIFT
              </h2>
              <p className="font-rajdhani text-sm text-[#e8e0cc]/40">
                Daily League of Legends Puzzles
              </p>
              <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm">
                {games.map((game) => (
                  <Link
                    key={game.title}
                    href={game.href}
                    className={`text-[#c8a84b]/60 hover:text-[#c8a84b] transition-colors font-rajdhani`}
                  >
                    {game.title}
                  </Link>
                ))}
              </div>
              <p className="font-rajdhani text-xs text-[#e8e0cc]/20 mt-8">
                Not affiliated with Riot Games.
              </p>
            </div>
          </footer>
        </div>
      </AnimatePresence>
    </main>
  );
}