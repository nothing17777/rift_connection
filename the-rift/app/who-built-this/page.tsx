"use client";

import { useState, useEffect } from "react";
import championsData from "@/data/champions.json";
import buildsData from "@/data/builds.json";
import { GuessInput } from "@/components/GuessInput";
import { ResultShare } from "@/components/ResultShare";
import { useGameStore } from "@/store/gameStore";
import { getDailyItem } from "@/lib/seed";
import { buildShareString } from "@/lib/share";
import { motion } from "framer-motion";
import { Hammer, Trophy } from "lucide-react";

export default function WhoBuiltThisPage() {
  const GAME_ID = "who-built-this";
  const { addGuess, guessHistory, completeGame } = useGameStore();
  
  const [targetPuzzle, setTargetPuzzle] = useState<{ champion: string; items: number[]; lane: string; rank: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    if (buildsData.length > 0) {
      setTargetPuzzle(getDailyItem(buildsData));
    }
    setMounted(true);
  }, []);

  const history = guessHistory[GAME_ID] || [];
  const maxGuesses = 5;
  const isGameOver = !!(targetPuzzle && (history.includes(targetPuzzle.champion) || history.length >= maxGuesses));
  const isWon = !!(targetPuzzle && history.includes(targetPuzzle.champion));
  
  const handleGuess = (guess: string) => {
    if (isGameOver) return;
    addGuess(GAME_ID, guess);
    if (targetPuzzle && (guess === targetPuzzle.champion || history.length + 1 >= maxGuesses)) {
      completeGame(GAME_ID);
    }
  };

  if (!mounted || !targetPuzzle) return null;

  const shareText = buildShareString(
    "Who Built This?", 
    42, 
    history.map(g => ({ state: g === targetPuzzle.champion ? 'correct' : 'wrong' })), 
    maxGuesses
  );

  return (
    <div className="max-w-2xl mx-auto py-8">
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
          <h1 className="font-cinzel text-4xl font-bold text-gold mb-2 flex items-center justify-center gap-3">
            <Hammer className="text-gold" />
            Who Built This?
          </h1>
          <p className="text-muted">Identify the champion from their completed inventory</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-2xl p-8 border border-blue-accent/20 shadow-[0_0_30px_rgba(30,58,95,0.2)]"
        >
          <div className="grid grid-cols-3 gap-4 max-w-[240px] mx-auto mb-6">
            {targetPuzzle.items.map((itemId: number, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                className="w-16 h-16 rounded border-2 border-gold/50 bg-background overflow-hidden relative group hover:border-gold transition-colors"
              >
                <img 
                  src={`https://ddragon.leagueoflegends.com/cdn/16.10.1/img/item/${itemId}.png`} 
                  alt={`Item ${itemId}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-2"
          >
            <span className="px-3 py-1 bg-blue-accent/20 text-blue-accent border border-blue-accent/30 rounded-full text-xs font-bold uppercase">{targetPuzzle.lane}</span>
            <span className="px-3 py-1 bg-gold/20 text-gold border border-gold/30 rounded-full text-xs font-bold uppercase">{targetPuzzle.rank}</span>
          </motion.div>
        </motion.div>

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
