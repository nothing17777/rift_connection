"use client";

import { useState, useEffect } from "react";
import patchNotesData from "@/data/patch-notes.json";
import championsData from "@/data/champions.json";
import { useGameStore } from "@/store/gameStore";
import { getDailyItem } from "@/lib/seed";
import { buildShareString } from "@/lib/share";
import { ResultShare } from "@/components/ResultShare";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ScrollText } from "lucide-react";

type PatchEntry = {
  champion: string;
  ability: string;
  change: string;
  real: boolean;
};

type Answer = "real" | "fake" | null;

export default function PatchSurvivorPage() {
  const GAME_ID = "patch-survivor";
  const { completeGame } = useGameStore();

  const [entries, setEntries] = useState<PatchEntry[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([null, null, null]);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const dailySet = getDailyItem(patchNotesData as PatchEntry[][]);
    setEntries(dailySet);
    setMounted(true);
  }, []);

  const handleAnswer = (index: number, answer: "real" | "fake") => {
    if (submitted) return;
    const newAnswers = [...answers] as Answer[];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (answers.some(a => a === null)) return;
    let correct = 0;
    answers.forEach((ans, i) => {
      if ((ans === "real") === entries[i].real) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    completeGame(GAME_ID);
  };

  const allAnswered = answers.every(a => a !== null);

  if (!mounted || entries.length === 0) return null;

  const guessStates = answers.map((ans, i) =>
    submitted
      ? ((ans === "real") === entries[i].real ? { state: "correct" as const } : { state: "wrong" as const })
      : { state: "wrong" as const }
  );

  const shareText = submitted
    ? buildShareString("Patch Survivor", 42, guessStates, 3)
    : "";

  return (
    <div className="max-w-4xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-cinzel text-4xl font-bold text-gold mb-2 flex items-center justify-center gap-3">
            <ScrollText className="text-gold" />
            Patch Survivor
          </h1>
          <p className="text-muted">Is each patch note entry <span className="text-green-400 font-semibold">Real</span> or <span className="text-red-400 font-semibold">Fake</span>?</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {entries.map((entry, idx) => {
            const userAnswer = answers[idx];
            const isCorrect = submitted && (userAnswer === "real") === entry.real;
            const isWrong = submitted && (userAnswer === "real") !== entry.real;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-surface rounded-xl p-6 border transition-all duration-300 flex flex-col gap-4 ${
                  isCorrect ? "border-green-500/50 shadow-[0_0_15px_rgba(74,222,128,0.1)]" :
                  isWrong ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]" :
                  "border-blue-accent/20 hover:border-gold/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <img
                      src={championsData.find(c => c.name === entry.champion)?.icon || `https://ddragon.leagueoflegends.com/cdn/16.10.1/img/champion/${entry.champion}.png`}
                      alt={entry.champion}
                      className="w-12 h-12 rounded border border-gold/30"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-cinzel font-bold text-gold text-lg leading-tight">{entry.champion}</div>
                    <div className="text-xs text-blue-300 font-semibold mt-0.5">{entry.ability}</div>
                  </div>
                  {submitted && (
                    <div className="flex-shrink-0">
                      {isCorrect ? <CheckCircle2 className="text-green-400" size={22} /> : <XCircle className="text-red-400" size={22} />}
                    </div>
                  )}
                </div>

                <p className="text-sm text-text/90 italic leading-relaxed border-l-2 border-gold/30 pl-3">
                  &ldquo;{entry.change}&rdquo;
                </p>

                {submitted && (
                  <div className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full text-center ${
                    entry.real ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {entry.real ? "✓ Real" : "✗ Fabricated"}
                  </div>
                )}

                {!submitted && (
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleAnswer(idx, "real")}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all border ${
                        userAnswer === "real"
                          ? "bg-green-500/30 border-green-500 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]"
                          : "bg-surface border-surface/50 text-muted hover:border-green-500/50 hover:text-green-400"
                      }`}
                    >
                      Real
                    </button>
                    <button
                      onClick={() => handleAnswer(idx, "fake")}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all border ${
                        userAnswer === "fake"
                          ? "bg-red-500/30 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                          : "bg-surface border-surface/50 text-muted hover:border-red-500/50 hover:text-red-400"
                      }`}
                    >
                      Fake
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {!submitted && (
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="px-10 py-3 bg-gold text-background font-cinzel font-bold rounded-full hover:bg-gold-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Answers
            </button>
          </div>
        )}

        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mt-6"
            >
              <h2 className="font-cinzel text-3xl font-bold mb-2">
                {score === 3 ? "🏆 Perfect!" : score === 2 ? "✨ Great!" : score === 1 ? "📜 Not Bad" : "💀 Rough Round"}
              </h2>
              <p className="text-muted text-lg">
                You got <span className="text-gold font-bold">{score}/3</span> correct
              </p>
              <ResultShare shareText={shareText} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
