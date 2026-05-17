"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";

interface Hint {
  label: string;
  value: string;
}

interface HintRevealProps {
  hints: Hint[];
  guessCount: number;
  revealAfter?: number; // number of wrong guesses before first hint
}

export function HintReveal({ hints, guessCount, revealAfter = 3 }: HintRevealProps) {
  const revealedCount = Math.max(0, guessCount - revealAfter + 1);

  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto mt-4">
      <p className="text-xs text-muted uppercase tracking-wider font-semibold mb-1">
        Hints {revealedCount > 0 ? `(${revealedCount}/${hints.length} unlocked)` : `— unlock after ${revealAfter} wrong guesses`}
      </p>
      {hints.map((hint, idx) => {
        const isRevealed = idx < revealedCount;
        return (
          <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-surface bg-surface/40">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background flex items-center justify-center">
              {isRevealed ? (
                <span className="text-gold text-lg">✦</span>
              ) : (
                <Lock size={14} className="text-muted" />
              )}
            </div>
            <div className="flex-1">
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">{hint.label}</span>
              <AnimatePresence mode="wait">
                {isRevealed ? (
                  <motion.div
                    key="revealed"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden"
                  >
                    {/* Gold shimmer animation */}
                    <motion.p
                      initial={{ backgroundPosition: "-200% center" }}
                      animate={{ backgroundPosition: "200% center" }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      style={{
                        background: "linear-gradient(90deg, #c8a84b 0%, #f0d080 40%, #c8a84b 60%, #e8e0cc 100%)",
                        backgroundSize: "200% auto",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                      className="font-bold text-base"
                    >
                      {hint.value}
                    </motion.p>
                  </motion.div>
                ) : (
                  <motion.p key="locked" className="text-muted text-sm">
                    {idx < revealAfter ? `Unlocks in ${revealAfter - guessCount + idx} wrong guesses` : "???"}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
