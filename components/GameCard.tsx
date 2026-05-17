"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { useEffect, useState } from "react";

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: "Casual" | "Competitive" | "Hardcore";
  href: string;
}

const difficultyConfig = {
  Casual: {
    colors: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    glow: "shadow-[0_0_20px_rgba(110,231,183,0.15)]",
  },
  Competitive: {
    colors: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    glow: "shadow-[0_0_20px_rgba(251,191,36,0.15)]",
  },
  Hardcore: {
    colors: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    glow: "shadow-[0_0_20px_rgba(251,113,133,0.15)]",
  },
};

export function GameCard({ id, title, description, icon, difficulty, href }: GameCardProps) {
  const { completedToday } = useGameStore();
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setIsCompleted(completedToday.includes(id));
  }, [completedToday, id]);

  const config = difficultyConfig[difficulty];

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ 
          y: -8, 
          boxShadow: "0 0 30px #c8a84b88",
          transition: { type: "spring", stiffness: 400, damping: 25 }
        }}
        whileTap={{ scale: 0.98 }}
        className="bg-surface/80 backdrop-blur-sm border border-blue-accent/20 rounded-xl p-6 h-full flex flex-col relative overflow-hidden group transition-all duration-300 hover:bg-surface"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-blue-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="flex justify-between items-start mb-4 relative z-10">
          <motion.div 
            className="p-3 bg-background rounded-lg text-gold group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
            whileHover={{ rotate: [0, -5, 5, -3, 3, 0] }}
          >
            {icon}
          </motion.div>
          <div className={`text-xs px-3 py-1 rounded-full border font-bold uppercase tracking-wider ${config.colors} ${config.glow}`}>
            {difficulty}
          </div>
        </div>
        
        <h3 className="font-cinzel text-xl font-bold mb-2 text-gold relative z-10">{title}</h3>
        <p className="text-muted text-sm flex-1 relative z-10">{description}</p>
        
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-blue-accent/20 relative z-10">
          {isCompleted ? (
            <span className="flex items-center text-emerald-400 text-sm font-semibold gap-1.5">
              <CheckCircle2 size={16} className="animate-pulse" /> Played
            </span>
          ) : (
            <span className="flex items-center text-gold text-sm font-semibold gap-1 group-hover:translate-x-1 transition-transform duration-300">
              Play <ArrowRight size={16} />
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
