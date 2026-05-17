"use client";

import { useState, useEffect } from "react";
import championsData from "@/data/champions.json";
import splashCropsData from "@/data/splash-crops.json";
import { GuessInput } from "@/components/GuessInput";
import { ResultShare } from "@/components/ResultShare";
import { useGameStore } from "@/store/gameStore";
import { getDailyItem } from "@/lib/seed";
import { buildShareString } from "@/lib/share";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Trophy } from "lucide-react";

export default function SplashCropPage() {
  const GAME_ID = "splash-crop";
  const { addGuess, guessHistory, completeGame } = useGameStore();
  
  const [targetPuzzle, setTargetPuzzle] = useState<{ champion: string; skin: string; skinLine: string; cropFrames: string[] } | null>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    if (splashCropsData.length > 0) {
      setTargetPuzzle(getDailyItem(splashCropsData));
    }
    setMounted(true);
  }, []);

  const history = guessHistory[GAME_ID] || [];
  const maxGuesses = 5;
  const isGameOver = !!(targetPuzzle && (history.includes(targetPuzzle.champion) || history.length >= maxGuesses));
  const isWon = !!(targetPuzzle && history.includes(targetPuzzle.champion));
  
  const currentCropIndex = Math.min(history.length, maxGuesses - 1);
  const cropSize = [60, 120, 200, 300, 500][currentCropIndex];

  const handleGuess = (guess: string) => {
    if (isGameOver) return;
    addGuess(GAME_ID, guess);
    if (targetPuzzle && (guess === targetPuzzle.champion || history.length + 1 >= maxGuesses)) {
      completeGame(GAME_ID);
    }
  };

  if (!mounted || !targetPuzzle) return null;

  const shareText = buildShareString(
    "Splash Crop", 
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
            <ImageIcon className="text-gold" />
            Splash Crop
          </h1>
          <p className="text-muted">Guess the champion from the cropped image</p>
        </motion.div>

        <div className="flex justify-center min-h-[300px] items-center">
          <div className="relative overflow-hidden rounded-2xl border-2 border-gold shadow-[0_0_30px_rgba(200,168,75,0.2)] bg-surface flex items-center justify-center transition-all duration-700 ease-in-out" style={{ width: cropSize, height: cropSize }}>
            <AnimatePresence mode="popLayout">
              <motion.img
                key={currentCropIndex}
                initial={{ opacity: 0, scale: 1.15 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                src={targetPuzzle.cropFrames[currentCropIndex]}
                alt="Splash crop"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'center 30%' }}
              />
            </AnimatePresence>
            
            {/* Resize indicator */}
            {!isGameOver && (
              <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs text-gold font-semibold">
                {cropSize}px × {cropSize}px
              </div>
            )}
          </div>
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

        <AnimatePresence>
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
                  src={championsData.find(c => c.name === targetPuzzle.champion)?.icon || `https://ddragon.leagueoflegends.com/cdn/16.10.1/img/champion/${targetPuzzle.champion}.png`}
                  alt={targetPuzzle.champion}
                  className="w-24 h-24 rounded-full border-4 border-gold shadow-[0_0_20px_rgba(200,168,75,0.3)]"
                />
                <div>
                  <span className="font-cinzel text-xl font-bold text-gold">{targetPuzzle.champion}</span>
                  <p className="text-muted">{targetPuzzle.skin}</p>
                  <p className="text-muted text-sm">{targetPuzzle.skinLine}</p>
                </div>
              </div>
              <ResultShare shareText={shareText} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-2"
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
      </motion.div>
    </div>
  );
}
