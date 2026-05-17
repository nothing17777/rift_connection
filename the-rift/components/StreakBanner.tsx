"use client";

import { useGameStore } from "@/store/gameStore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function StreakBanner() {
  const { streak, completedToday } = useGameStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-surface text-center py-2 text-sm font-semibold border-b border-blue-accent/30 flex justify-center items-center gap-4">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <span className="text-xl">🔥</span>
        <span>
          You&apos;re on a <span className="text-gold">{streak}-day</span> streak!
        </span>
        <span className="text-muted mx-2">|</span>
        <span>Today: <span className="text-gold">{completedToday.length}/6</span> complete</span>
      </motion.div>
    </div>
  );
}
