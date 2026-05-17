"use client";

import React, { useEffect, useState, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, Trash2, CheckCircle2, ChevronRight, Share2, Clipboard, ShieldAlert, Award, Swords, Zap, BookOpen, X } from "lucide-react";
import { useGameStore } from "@/store/game-store";
import { getPuzzleByDate, getLatestPuzzleDate, getUnlimitedPuzzle } from "@/lib/puzzle-data";
import rolesDB from "@/lib/roles-db.json";
import { generateShareText } from "@/lib/puzzle-engine";
import { TeemoScene } from "@/components/ui/teemo-scene";

function PlayArenaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawDate = searchParams.get("date");
  const rawMode = searchParams.get("mode");
  const latestDate = getLatestPuzzleDate();
  const isUnlimited = rawDate === "unlimited";
  const date = (!rawDate || isUnlimited) ? latestDate : rawDate;
  const [mode, setMode] = useState<'champions' | 'abilities'>(rawMode === 'abilities' ? 'abilities' : 'champions');

  const isFutureDate = !isUnlimited && date > latestDate;

  const [unlimitedSeeds, setUnlimitedSeeds] = useState({
    champions: Date.now(),
    abilities: Date.now() + 1
  });
  const [unlimitedStreaks, setUnlimitedStreaks] = useState({
    champions: { current: 0, highest: 0 },
    abilities: { current: 0, highest: 0 }
  });
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [cheatSheetSearch, setCheatSheetSearch] = useState("");

  const filteredRolesDB = useMemo(() => {
    if (!cheatSheetSearch.trim()) return rolesDB;
    const query = cheatSheetSearch.toLowerCase();
    return rolesDB.map(category => ({
      ...category,
      champions: category.champions.filter(
        c => c.name.toLowerCase().includes(query) || category.role.toLowerCase().includes(query)
      )
    })).filter(category => category.champions.length > 0);
  }, [cheatSheetSearch]);

  // Memoize puzzle so it only changes when the relevant inputs change
  const puzzle = useMemo(() => {
    if (isUnlimited) return getUnlimitedPuzzle(unlimitedSeeds[mode], mode);
    return getPuzzleByDate(date, mode);
  }, [isUnlimited, unlimitedSeeds, date, mode]);

  const {
    boardItems,
    selectedItems,
    solvedCategories,
    guessHistory,
    mistakesRemaining,
    gameStatus,
    currentStreak,
    initPuzzle,
    selectItem,
    clearSelection,
    shuffleBoard,
    submitGuess,
    revealNextCategory,
    _hasHydrated,
  } = useGameStore();

  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" | "info" }>>([]);
  const [copied, setCopied] = useState(false);
  const [teemoAnim, setTeemoAnim] = useState<"idle" | "stunned" | "death" | "dance" | "attack">("idle");
  const [wrongGuessItems, setWrongGuessItems] = useState<string[]>([]);
  const [countdown, setCountdown] = useState("");

  if (isFutureDate) {
    return (
      <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-rajdhani select-none overflow-hidden pb-12">
        <div className="p-8 rounded-md border border-red-950 bg-slate-900 text-center flex flex-col items-center max-w-md mx-6">
          <div className="w-12 h-12 rounded-full bg-red-950 border border-red-900 flex items-center justify-center mb-4 text-red-500">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h2 className="font-russo text-xl text-red-500 mb-3 uppercase tracking-wider">
            ARENA LOCK ACTIVE
          </h2>

          <p className="font-rajdhani text-slate-400 text-sm mb-8 max-w-xs leading-relaxed font-normal">
            You cannot access future daily puzzles. Accessing these dates is strictly forbidden by the summoner guidelines.
          </p>
          
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-md font-russo text-xs uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors border border-blue-500"
          >
            <ArrowLeft className="w-4 h-4 text-white stroke-[3px]" />
            Return to Command Center
          </Link>
        </div>
      </div>
    );
  }

  const addToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
  };

  // Initialize puzzle after hydration. For unlimited, re-init whenever seed changes.
  useEffect(() => {
    if (_hasHydrated && puzzle && !isFutureDate) {
      initPuzzle(puzzle);
    }
  }, [_hasHydrated, date, puzzle, initPuzzle, isFutureDate, unlimitedSeeds]);

  // Sync Teemo's animation with game state
  useEffect(() => {
    if (gameStatus === 'won') setTeemoAnim('dance');
    else if (gameStatus === 'lost') setTeemoAnim('death');
    else setTeemoAnim('idle');
  }, [gameStatus, puzzle]);

  const handlePlayAgain = () => {
    if (isUnlimited) {
      setUnlimitedSeeds(prev => ({ ...prev, [mode]: Date.now() }));
    }
    setWrongGuessItems([]);
  };

  // Countdown timer to midnight local time
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      const format = (num: number) => num.toString().padStart(2, "0");
      setCountdown(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-mono text-xs">
        Loading Puzzle...
      </div>
    );
  }

  const handleSelect = (item: string) => {
    if (gameStatus !== "playing") return;
    selectItem(item);
  };

  const handleSubmit = () => {
    if (selectedItems.length !== 4) {
      addToast("Select exactly 4 items to lock in guess!", "info");
      return;
    }

    const result = submitGuess(puzzle);

    if (result.alreadyGuessed) {
      addToast("Connection combination already guessed!", "info");
      return;
    }

    if (result.isCorrect) {
      addToast(`Solved: ${result.categoryTitle}!`, "success");
      setTeemoAnim("dance");
      // Track win when last category solved in unlimited
      if (isUnlimited && solvedCategories.length + 1 >= 4) {
        setUnlimitedStreaks(s => {
          const newCurrent = s[mode].current + 1;
          return {
            ...s,
            [mode]: { current: newCurrent, highest: Math.max(s[mode].highest, newCurrent) }
          };
        });
      }
    } else {
      setWrongGuessItems([...selectedItems]);
      setTimeout(() => setWrongGuessItems([]), 500);

      // If this was the last mistake, reset current streak
      if (isUnlimited && mistakesRemaining === 1) {
        setUnlimitedStreaks(s => ({
          ...s,
          [mode]: { ...s[mode], current: 0 }
        }));
      }

      if (result.oneAway) {
        addToast("Guess is one away from a solved connection!", "info");
      } else {
        addToast("Incorrect connection guess!", "error");
      }

      if (mistakesRemaining - 1 <= 0) {
        setTeemoAnim("death");
      } else {
        setTeemoAnim("stunned");
        // Stays stunned until a correct guess (which sets dance) or death
      }
    }
  };

  const handleShare = () => {
    try {
      const share = generateShareText(guessHistory, puzzle, gameStatus === "won");
      navigator.clipboard.writeText(share);
      setCopied(true);
      addToast("Social results copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      addToast("Failed to copy share layout.", "error");
    }
  };

  // Color mappings for connection banners (clean, solid background)
  const getBannerColor = (diff: "yellow" | "green" | "blue" | "purple") => {
    switch (diff) {
      case "yellow":
        return "border-yellow-600 bg-yellow-950/40 text-yellow-200";
      case "green":
        return "border-green-600 bg-green-950/40 text-green-200";
      case "blue":
        return "border-blue-600 bg-blue-950/40 text-blue-200";
      case "purple":
        return "border-purple-600 bg-purple-950/40 text-purple-200";
    }
  };

  const getDifficultyLabel = (diff: "yellow" | "green" | "blue" | "purple") => {
    switch (diff) {
      case "yellow": return "EASY";
      case "green": return "MEDIUM";
      case "blue": return "HARD";
      case "purple": return "TRICKY";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-start select-none overflow-x-hidden font-rajdhani pb-12">
      {/* Cyber HUD Header - Solid background with no excessive blurs */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-900 bg-slate-950">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors font-mono text-[10px] uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>PORTAL</span>
        </Link>

        <div className="flex flex-col items-center">
          <span className="font-chakra text-[9px] tracking-wider text-blue-500 uppercase">
            {isUnlimited ? "UNLIMITED MODE" : "PUZZLE DASHBOARD"}
          </span>
          <span className="font-russo text-base sm:text-lg tracking-wider text-slate-200 uppercase">
            {isUnlimited ? "∞ PLAY" : `DAY #${puzzle.puzzleNumber}`}
          </span>
        </div>

        {isUnlimited ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900 font-mono text-[10px]">
            <Award className="w-3.5 h-3.5 text-yellow-500" />
            <span>
              SCORE ({mode === 'champions' ? 'Champ Names' : 'Champion Abilities'}):{" "}
              <span className="text-yellow-500">STREAK {unlimitedStreaks[mode].current}</span>
              <span className="text-slate-600 mx-1">|</span>
              <span className="text-blue-400">HIGHEST {unlimitedStreaks[mode].highest}</span>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900 font-mono text-[10px]">
            <Award className="w-3.5 h-3.5 text-yellow-500" />
            <span>STREAK: <span className="text-yellow-500">{currentStreak}</span></span>
          </div>
        )}
      </header>

      {/* Mode Switcher Tabs */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="inline-flex rounded-md border border-slate-800 bg-slate-900 p-1 gap-1">
          <button
            onClick={() => setMode('champions')}
            className={`flex items-center gap-2 px-4 py-2 rounded font-russo text-xs uppercase tracking-wider transition-all ${
              mode === 'champions'
                ? 'bg-green-600 text-white border border-green-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            Champions
          </button>
          <button
            onClick={() => setMode('abilities')}
            className={`flex items-center gap-2 px-4 py-2 rounded font-russo text-xs uppercase tracking-wider transition-all ${
              mode === 'abilities'
                ? 'bg-purple-600 text-white border border-purple-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Abilities
          </button>
        </div>

        <button
          onClick={() => setShowCheatSheet(true)}
          className="flex items-center gap-2 px-4 py-2 rounded font-russo text-xs uppercase tracking-wider bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
        >
          <BookOpen className="w-4 h-4" />
          Classes Cheat Sheet
        </button>
      </div>

      {/* Main Dashboard Layout Grid */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-8 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand side: Puzzle Grid Column */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          {/* Connection Descriptions */}
          {gameStatus === "playing" && (
            <div className="p-4 rounded-md bg-slate-900 border border-slate-800">
              <p className="text-left font-rajdhani text-sm text-slate-400 leading-relaxed font-normal">
                Identify groups of four items that share a common League theme. Click to select, lock in your four, and submit for verification.
              </p>
              <p className="text-left font-rajdhani text-[11px] text-slate-500 leading-relaxed font-normal mt-2 border-t border-slate-800/60 pt-2">
                *Disclaimer: All puzzle data is pulled dynamically from Riot's official DataDragon API (v16.10.1). Please do not flame the developer if champion classes or abilities are categorized strangely by Riot.
              </p>
            </div>
          )}

          {/* Core Game Board Grid - Flat solid block layout */}
          <div className="relative p-6 rounded-md border border-slate-900 bg-slate-900 w-full">
            <div className="w-full flex flex-col gap-4 relative z-10">
              {/* 1. Solved Categories List */}
              <AnimatePresence>
                {solvedCategories.map(cat => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`w-full py-4 px-6 rounded-md border text-center flex flex-col justify-center gap-1 ${getBannerColor(cat.difficulty)}`}
                  >
                    <div className="font-chakra text-[9px] tracking-wider uppercase opacity-85">
                      {getDifficultyLabel(cat.difficulty)} CONNECTION
                    </div>
                    {/* Solved category names are strictly the only elements using Cinzel! */}
                    <h3 className="font-cinzel text-base tracking-wide uppercase">
                      {cat.title}
                    </h3>
                    <p className="font-mono text-[10px] uppercase opacity-75">
                      {cat.items.join(" • ")}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* 2. Remaining Active Items Grid */}
              {gameStatus === "playing" && (
                <motion.div 
                  layout 
                  className="grid grid-cols-4 gap-3 w-full"
                >
                  <AnimatePresence mode="popLayout">
                    {boardItems.map(item => {
                      const isSelected = selectedItems.includes(item);
                      const isWrong = wrongGuessItems.includes(item);
                      return (
                        <motion.button
                          layoutId={`item-${item}`}
                          key={item}
                          onClick={() => handleSelect(item)}
                          animate={isWrong ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`aspect-square w-full rounded-md flex flex-col items-center justify-center p-2 text-center border font-russo text-xs sm:text-sm tracking-wide transition-colors duration-150 relative overflow-hidden ${
                            isWrong
                              ? "border-red-500 bg-red-950/80 text-red-400"
                              : isSelected
                                ? "border-blue-500 bg-blue-950/60 text-blue-400"
                                : "border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:border-slate-700 hover:text-slate-100"
                          }`}
                        >
                          <span className="line-clamp-2 uppercase break-words px-1 max-w-full font-russo leading-tight">
                            {item === "LeeSin" ? "Lee Sin" : item === "MissFortune" ? "M. Fortune" : item === "JarvanIV" ? "Jarvan IV" : item}
                          </span>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>

          {/* Tactical Bottom Grid Controls - Clean and flat */}
          {gameStatus === "playing" && (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-md bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={shuffleBoard}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-md border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 transition-colors font-russo text-xs uppercase tracking-wider text-slate-300"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Shuffle
                </button>

                <button
                  onClick={clearSelection}
                  disabled={selectedItems.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-md border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 transition-colors font-russo text-xs uppercase tracking-wider text-slate-300 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={selectedItems.length !== 4}
                className="flex items-center gap-2 px-6 py-2.5 rounded-md font-russo text-xs uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors border border-blue-500 disabled:opacity-40 disabled:pointer-events-none"
              >
                Lock Connection
              </button>
            </div>
          )}
        </div>

        {/* Right Hand side: Tactical Puzzle Intel Dashboard */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 w-full">
          
          {/* Main Analyst Board Card */}
          <div className="relative p-6 rounded-md border border-slate-900 bg-slate-900 w-full flex flex-col gap-6">
            <div className="flex flex-col gap-5">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[9px] tracking-wider font-chakra font-extrabold text-blue-500 uppercase">SUMMONER INTEL</span>
                <h3 className="font-russo text-sm uppercase text-slate-200 mt-1">Puzzle Analytics</h3>
              </div>

              {/* Mistakes Charge indicator styled as futuristic panel */}
              {gameStatus === "playing" && (
                <div className="flex flex-col gap-2 p-4 rounded-md bg-slate-950 border border-slate-900">
                  <span className="text-[9px] tracking-wider font-chakra font-extrabold text-slate-500 uppercase">MISTAKE GUESSES REMAINING</span>
                  <div className="flex items-center gap-2 mt-1">
                    {[...Array(4)].map((_, idx) => {
                      const isActive = idx < mistakesRemaining;
                      return (
                        <div
                          key={idx}
                          className={`w-3 h-3 rounded-full transition-colors duration-150 ${
                            isActive ? "bg-blue-500" : "bg-slate-800"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* End State Card: Victory */}
              {gameStatus === "won" && (
                <div className="w-full p-6 rounded-md border border-green-900 bg-green-950/20 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-950 border border-green-900 flex items-center justify-center mb-3 text-green-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <h2 className="font-russo text-xl text-green-400 mb-1 uppercase tracking-wider">
                    VICTORY
                  </h2>

                  <p className="font-rajdhani text-slate-400 text-xs mb-5 max-w-xs leading-relaxed font-normal">
                    {isUnlimited
                      ? "Nailed it! Ready for another round?"
                      : `Puzzle Day #${puzzle.puzzleNumber} successfully cleared in ${guessHistory.length} attempts!`
                    }
                  </p>

                  {isUnlimited ? (
                    <button
                      onClick={handlePlayAgain}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-md font-russo text-xs uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors border border-blue-500 w-full justify-center mb-5"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Play Again
                    </button>
                  ) : (
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-md font-russo text-xs uppercase tracking-wider text-white bg-green-600 hover:bg-green-500 transition-colors border border-green-500 w-full justify-center mb-5"
                    >
                      <Share2 className="w-4 h-4" />
                      {copied ? "CONNECTION COPIED!" : "SHARE CONNECTION"}
                    </button>
                  )}

                  {!isUnlimited && (
                    <div className="border-t border-slate-850 pt-4 w-full flex items-center justify-between text-[9px] text-slate-500 font-mono">
                      <span>Next daily puzzle opens in:</span>
                      <span className="text-blue-400 font-bold tracking-wider">{countdown}</span>
                    </div>
                  )}
                </div>
              )}

              {/* End State Card: Defeat */}
              {gameStatus === "lost" && (
                <div className="w-full p-6 rounded-md border border-red-900 bg-red-950/20 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-red-950 border border-red-900 flex items-center justify-center mb-3 text-red-400">
                    <ShieldAlert className="w-6 h-6" />
                  </div>

                  <h2 className="font-russo text-xl text-red-400 mb-1 uppercase tracking-wider">
                    DEFEAT
                  </h2>

                  <p className="font-rajdhani text-slate-400 text-xs mb-5 max-w-xs leading-relaxed font-normal">
                    {isUnlimited
                      ? "Better luck next time! Want to try again?"
                      : `All mistake attempts expended on Puzzle #${puzzle.puzzleNumber}.`
                    }
                  </p>

                  {/* Reveal remaining solutions one by one */}
                  {solvedCategories.length < 4 ? (
                    <button
                      onClick={() => revealNextCategory(puzzle)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-md font-russo text-xs uppercase tracking-wider text-white bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors w-full justify-center mb-5"
                    >
                      Reveal Next Connection
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : isUnlimited ? (
                    <button
                      onClick={handlePlayAgain}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-md font-russo text-xs uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 transition-colors border border-blue-500 w-full justify-center mb-5"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Play Again
                    </button>
                  ) : (
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-md font-russo text-xs uppercase tracking-wider text-white bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors w-full justify-center mb-5"
                    >
                      <Clipboard className="w-4 h-4" />
                      Share Defeat Grid
                    </button>
                  )}

                  {!isUnlimited && (
                    <div className="border-t border-slate-850 pt-4 w-full flex items-center justify-between text-[9px] text-slate-500 font-mono">
                      <span>Next daily puzzle opens in:</span>
                      <span className="text-blue-400 font-bold tracking-wider">{countdown}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Interactive 3D Teemo Scene - Local GLB Model Loader */}
          <div className="relative h-64 rounded-md border border-slate-900 bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-4">
            <TeemoScene 
              className="absolute inset-0 w-full h-full opacity-90 z-0"
              animationState={teemoAnim}
            />
            <div className="relative z-10 text-center pointer-events-none w-full mt-auto bg-slate-950/80 py-2 border border-slate-900 rounded-md">
              <span className="text-[9px] tracking-wider font-chakra font-extrabold text-green-400 uppercase">BANDLE RECON SCOUT (TEEMO)</span>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed font-normal">
                Move your cursor to watch the locally loaded 3D Teemo scouting sensors track your mouse.
              </p>
            </div>
          </div>

        </div>

      </main>

      {/* Floating dynamic page Toasters overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm font-russo text-xs">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`py-3.5 px-5 rounded-md border text-slate-200 bg-slate-950 border-slate-800 tracking-wider flex items-center gap-2.5 shadow-md`}
            >
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    {/* Cheat Sheet Modal */}
      <AnimatePresence>
        {showCheatSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowCheatSheet(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between bg-slate-950 gap-4 shrink-0">
                <div className="flex flex-col gap-1">
                  <h2 className="font-russo text-xl text-slate-100 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    CHAMPION CLASSES ARCHIVE
                  </h2>
                  <p className="font-rajdhani text-sm text-slate-400">
                    Official classifications pulled directly from DataDragon v16.10.1
                  </p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <input
                      type="text"
                      placeholder="Search champion or class..."
                      value={cheatSheetSearch}
                      onChange={(e) => setCheatSheetSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded px-3 py-1.5 font-rajdhani text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors"
                    />
                    {cheatSheetSearch && (
                      <button
                        onClick={() => setCheatSheetSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 font-mono text-[10px]"
                      >
                        CLEAR
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowCheatSheet(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}>
                {filteredRolesDB.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500 font-rajdhani">
                    <p className="text-lg">No champions match your search.</p>
                    <p className="text-xs mt-1">Try another term or clear the filter.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRolesDB.map((category) => (
                      <div key={category.role} className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col h-full">
                        <div className="border-b border-slate-800 pb-3 mb-4 shrink-0">
                          <h3 className="font-russo text-lg text-blue-400 uppercase tracking-wider">
                            {category.role}
                          </h3>
                          <p className="font-mono text-[10px] text-slate-500 mt-1">
                            {category.champions.length} CHAMPIONS
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 content-start">
                          {category.champions.map((champ) => (
                            <div key={champ.id} className="group relative w-10 h-10 shrink-0">
                              <img
                                src={`https://ddragon.leagueoflegends.com/cdn/16.10.1/img/champion/${champ.id}.png`}
                                alt={champ.name}
                                className="w-full h-full object-cover rounded border border-slate-700 group-hover:border-blue-400 transition-colors"
                                onError={(e) => {
                                  // Fallback to a custom logo or Teemo if image is missing/Yunara
                                  e.currentTarget.src = "https://ddragon.leagueoflegends.com/cdn/16.10.1/img/champion/Teemo.png";
                                }}
                              />
                              {/* Tooltip */}
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white font-rajdhani text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-slate-700">
                                {champ.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PlayArena() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-mono text-xs">
          Loading Arena...
        </div>
      }
    >
      <PlayArenaContent />
    </Suspense>
  );
}
