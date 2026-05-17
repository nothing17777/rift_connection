"use client";

import { useState, useEffect } from "react";
import championsData from "@/data/champions.json";
import runePagesData from "@/data/rune-pages.json";
import { GuessInput } from "@/components/GuessInput";
import { ResultShare } from "@/components/ResultShare";
import { HintReveal } from "@/components/HintReveal";
import { RulesModal } from "@/components/RulesModal";
import { useGameStore } from "@/store/gameStore";
import { getDailyKey } from "@/lib/seed";
import { buildShareString } from "@/lib/share";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Zap, Trophy, Sparkles } from "lucide-react";

const runeIcons: Record<string, string> = {
  "Precision": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7201_precision.png",
  "Domination": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7200_domination.png",
  "Sorcery": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7202_sorcery.png",
  "Resolve": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7204_resolve.png",
  "Inspiration": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/7203_whimsy.png",
};

const rules = [
  { step: 1, text: "A champion's rune page is shown — keystone, primary path, secondary path, and summoner spells." },
  { step: 2, text: "Type a champion's name in the guess box and press Enter or click to submit." },
  { step: 3, text: "After 3 wrong guesses, hints about the champion's role, region, and name initial unlock." },
  { step: 4, text: "You have 5 total guesses. Good luck!" },
];

export default function RuneGuessPage() {
  const GAME_ID = "rune-guess";
  const { addGuess, guessHistory, completeGame } = useGameStore();

  const [targetChampion, setTargetChampion] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const keys = Object.keys(runePagesData);
    if (keys.length > 0) setTargetChampion(getDailyKey(keys));
    setMounted(true);
  }, []);

  const history = guessHistory[GAME_ID] || [];
  const maxGuesses = 5;
  const isGameOver = history.includes(targetChampion) || history.length >= maxGuesses;
  const isWon = history.includes(targetChampion);

  const handleGuess = (guess: string) => {
    if (isGameOver || history.includes(guess)) return;
    addGuess(GAME_ID, guess);
    if (guess === targetChampion || history.length + 1 >= maxGuesses) {
      completeGame(GAME_ID);
    }
  };

  if (!mounted || !targetChampion) return null;

  const runeData = (runePagesData as Record<string, { keystone: string; primary: string; secondary: string; summonerSpells: string[]; difficulty: string }>)[targetChampion];
  const targetData = championsData.find(c => c.name === targetChampion);

  const hints = [
    { label: "Role", value: targetData?.roles?.[0] || "Unknown" },
    { label: "Region", value: targetData?.region || "Unknown" },
    { label: "First Letter", value: targetChampion[0] },
  ];

  const shareText = buildShareString(
    "RuneGuess", 42,
    history.map(g => ({ state: g === targetChampion ? "correct" as const : "wrong" as const })),
    maxGuesses
  );

  return (
    <div className="max-w-2xl mx-auto py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 flex flex-col items-center gap-2"
        >
          <h1 className="font-cinzel text-4xl font-bold text-gold flex items-center gap-3">
            <Zap className="text-gold" />
            RuneGuess
          </h1>
          <p className="text-muted">Identify the champion from their rune page</p>
          <button onClick={() => setShowRules(true)} className="flex items-center gap-1 text-sm text-muted hover:text-gold transition-colors mt-1">
            <HelpCircle size={14} /> How to play
          </button>
        </motion.div>

        {/* Rune page display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-2xl p-8 mb-8 border border-blue-accent/20 shadow-[0_0_30px_rgba(30,58,95,0.2)]"
        >
          {/* Keystone */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-2 mb-6"
          >
            <div className="w-24 h-24 rounded-full bg-background border-4 border-gold/60 flex items-center justify-center shadow-[0_0_20px_rgba(200,168,75,0.3)] text-4xl animate-pulse">
              ⚡
            </div>
            <span className="font-cinzel font-bold text-xl text-gold-light">{runeData.keystone}</span>
            <span className="text-xs text-muted uppercase tracking-wider">Keystone Rune</span>
          </motion.div>

          {/* Paths */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {["primary", "secondary"].map((type, idx) => {
              const pathName = type === "primary" ? runeData.primary : runeData.secondary;
              const imgSrc = runeIcons[pathName];
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.1 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-background border border-surface hover:border-gold/30 transition-colors"
                >
                  <span className="text-xs text-muted uppercase tracking-wider font-semibold">{type} path</span>
                  {imgSrc && (
                    <img src={imgSrc} alt={pathName} className="w-10 h-10 object-contain opacity-90"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                  <span className="font-bold text-text">{pathName}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Summoner spells */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-4"
          >
            {runeData.summonerSpells.map((spell, idx) => (
              <motion.div
                key={spell}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.35 + idx * 0.1 }}
                className="flex flex-col items-center gap-1"
              >
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/16.10.1/img/spell/Summoner${spell}.png`}
                  alt={spell}
                  className="w-10 h-10 rounded border border-gold/30 hover:scale-110 transition-transform"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="text-xs text-muted">{spell}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Guess input */}
        {!isGameOver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <GuessInput champions={championsData} onGuess={handleGuess} disabled={isGameOver} />
          </motion.div>
        )}

        {/* Hints */}
        {!isGameOver && (
          <HintReveal hints={hints} guessCount={history.length} revealAfter={3} />
        )}

        {/* Victory particles */}
        <AnimatePresence>
          {isGameOver && isWon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none overflow-hidden"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: "50%", 
                    y: "50%",
                    scale: 0,
                    rotate: 0
                  }}
                  animate={{
                    x: `${50 + (Math.random() - 0.5) * 100}%`,
                    y: `${50 + (Math.random() - 0.5) * 100}%`,
                    scale: [0, 1, 0],
                    rotate: 360,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.05,
                    ease: "easeOut"
                  }}
                  className="absolute w-2 h-2 text-gold"
                >
                  ✦
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game over state */}
        <AnimatePresence>
          {isGameOver && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center mb-8 mt-4 relative z-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <h2 className={`font-cinzel text-4xl font-bold mb-4 flex items-center justify-center gap-2 ${isWon ? "text-gold" : "text-red-400"}`}>
                  {isWon ? <><Trophy className="text-gold animate-bounce" /> Victory!</> : "💀 Defeat!"}
                </h2>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-3 mb-6"
              >
                <div className="relative">
                  <img
                    src={targetData?.icon}
                    alt={targetChampion}
                    className="w-24 h-24 rounded-full border-4 border-gold shadow-[0_0_30px_rgba(200,168,75,0.5)]"
                  />
                  {isWon && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="absolute -top-2 -right-2"
                    >
                      <Sparkles className="text-gold w-6 h-6" />
                    </motion.div>
                  )}
                </div>
                <div>
                  <span className="font-cinzel text-xl font-bold text-gold">{targetChampion}</span>
                  <p className="text-muted text-sm">{targetData?.title}</p>
                </div>
              </motion.div>
              <ResultShare shareText={shareText} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guess history */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col gap-2"
        >
          <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">Guesses</p>
          {Array.from({ length: maxGuesses }).map((_, i) => {
            const guess = history[i];
            const isCorrect = guess === targetChampion;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                  !guess
                    ? "border-surface/30 bg-surface/10 opacity-50"
                    : isCorrect
                    ? "border-green-500/40 bg-green-500/10 shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                    : "border-red-500/30 bg-red-500/5"
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  !guess ? "bg-surface text-muted" : isCorrect ? "bg-green-500/30 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>{i + 1}</span>
                <span className="font-semibold">{guess || "—"}</span>
                {isCorrect && (
                  <motion.span 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-auto text-green-400 text-sm font-bold"
                  >
                    Correct ✓
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} title="RuneGuess" rules={rules} />
    </div>
  );
}
