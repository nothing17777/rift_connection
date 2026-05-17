"use client";

import { useState, useEffect } from "react";
import championsData from "@/data/champions.json";
import abilityChainData from "@/data/ability-chain.json";
import { GuessInput } from "@/components/GuessInput";
import { ResultShare } from "@/components/ResultShare";
import { useGameStore } from "@/store/gameStore";
import { getDailyItem } from "@/lib/seed";
import { buildShareString } from "@/lib/share";
import { motion } from "framer-motion";
import { Zap, ArrowUp, Snail, Shield, EyeOff, Crosshair, CircleAlert, HelpCircle, Trophy } from "lucide-react";
import { FallingPattern } from "@/components/ui/falling-pattern";


const getIconForTag = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes('dash')) return <Zap size={20} />;
  if (t.includes('knockup') || t.includes('knockback')) return <ArrowUp size={20} />;
  if (t.includes('slow')) return <Snail size={20} />;
  if (t.includes('shield')) return <Shield size={20} />;
  if (t.includes('stealth')) return <EyeOff size={20} />;
  if (t.includes('beam')) return <Crosshair size={20} />;
  if (t.includes('stun') || t.includes('root')) return <CircleAlert size={20} />;
  return <HelpCircle size={20} />;
};

export default function AbilityChainPage() {
  const GAME_ID = "ability-chain";
  const { addGuess, guessHistory, completeGame } = useGameStore();
  
  const [targetPuzzle, setTargetPuzzle] = useState<{ champion: string; chain: string[] } | null>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    if (abilityChainData.length > 0) {
      setTargetPuzzle(getDailyItem(abilityChainData));
    }
    setMounted(true);
  }, []);

  const history = guessHistory[GAME_ID] || [];
  const maxGuesses = 5;
  const isGameOver = !!(targetPuzzle && (history.includes(targetPuzzle.champion) || history.length >= maxGuesses));
  const isWon = !!(targetPuzzle && history.includes(targetPuzzle.champion));
  
  const revealedCount = Math.min(history.length + 1, targetPuzzle?.chain.length || 0);

  const handleGuess = (guess: string) => {
    if (isGameOver) return;
    addGuess(GAME_ID, guess);
    if (targetPuzzle && (guess === targetPuzzle.champion || history.length + 1 >= maxGuesses)) {
      completeGame(GAME_ID);
    }
  };

  if (!mounted || !targetPuzzle) return null;

  const shareText = buildShareString(
    "Ability Chain", 
    42, 
    history.map(g => ({ state: g === targetPuzzle.champion ? 'correct' : 'wrong' })), 
    maxGuesses
  );

  return (
    <div className="relative max-w-2xl mx-auto py-8">
      {/* Falling gold particles background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <FallingPattern color="#c8a84b" backgroundColor="#0a0e1a" duration={120} blurIntensity="2em" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-cinzel text-4xl font-bold text-gold mb-2">Ability Chain</h1>
          <p className="text-muted">Identify the champion from a sequence of ability effects</p>
        </motion.div>

        <div className="flex flex-col items-center gap-4 mb-12">
          {targetPuzzle.chain.map((tag: string, index: number) => {
            const isRevealed = index < revealedCount || isGameOver;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl border w-full max-w-sm transition-all duration-500 ${
                  isRevealed ? "border-gold/50 bg-surface shadow-[0_0_15px_rgba(200,168,75,0.1)]" : "border-surface bg-surface/30 opacity-50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-gold">
                  {isRevealed ? getIconForTag(tag) : <HelpCircle size={20} />}
                </div>
                <span className={`font-semibold text-lg ${isRevealed ? "text-text" : "text-muted"}`}>
                  {isRevealed ? tag : "???"}
                </span>
              </motion.div>
            );
          })}
        </div>

        {!isGameOver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GuessInput 
              champions={championsData} 
              onGuess={handleGuess}
              disabled={isGameOver}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col gap-2"
        >
          {Array.from({ length: maxGuesses }).map((_, i) => {
            const guess = history[i];
            const isCorrect = guess === targetPuzzle.champion;
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-300 ${
                  !guess ? "border-surface/50 bg-surface/20" :
                  isCorrect ? "border-green-500/50 bg-green-500/10 shadow-[0_0_15px_rgba(74,222,128,0.2)]" : 
                  "border-red-500/50 bg-red-500/10"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center font-bold text-muted">
                  {i + 1}
                </div>
                <span className="font-semibold">{guess || "..."}</span>
              </motion.div>
            );
          })}
        </motion.div>

        {isGameOver && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <h2 className={`font-cinzel text-3xl font-bold mb-4 flex items-center justify-center gap-2 ${isWon ? "text-gold" : "text-red-400"}`}>
                {isWon ? <><Trophy className="text-gold" /> Victory!</> : "Defeat!"}
              </h2>
            </motion.div>
            
            <div className="flex flex-col items-center gap-3">
              <img 
                src={championsData.find(c => c.name === targetPuzzle.champion)?.icon} 
                alt={targetPuzzle.champion}
                className="w-20 h-20 rounded-full border-4 border-gold shadow-[0_0_30px_rgba(200,168,75,0.3)]"
              />
              <span className="font-cinzel text-xl font-bold text-gold">{targetPuzzle.champion}</span>
            </div>
            <ResultShare shareText={shareText} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
