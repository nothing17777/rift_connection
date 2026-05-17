'use client';
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  titles?: string[];
  subtitle?: string;
  badgeText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  primaryText?: string;
  secondaryText?: string;
  headingPrefix?: string;
}

export function AnimatedHero({
  titles = ["immersive", "tactical", "legendary", "competitive", "strategic"],
  subtitle = "Challenge your League of Legends lore and mechanics in an esports-themed daily board matching puzzle. Reconnect traits, items, and abilities.",
  badgeText = "V1.0.0 Now Live",
  onPrimaryClick,
  onSecondaryClick,
  primaryText = "Play Daily Rift",
  secondaryText = "How to Play",
  headingPrefix = "League puzzles made"
}: HeroProps) {
  const [titleNumber, setTitleNumber] = useState(0);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full relative z-25">
      <div className="container mx-auto">
        <div className="flex gap-8 py-16 lg:py-24 items-center justify-center flex-col">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="secondary" size="sm" className="gap-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 font-mono tracking-wider">
              {badgeText} <MoveRight className="w-4 h-4 text-blue-400 animate-pulse" />
            </Button>
          </motion.div>
          
          <div className="flex gap-4 flex-col items-center">
            <h1 className="text-4xl md:text-7xl max-w-4xl tracking-tighter text-center font-bold text-white font-cinzel leading-tight">
              <span>{headingPrefix}</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center h-[1.2em] md:pb-4 md:pt-1 text-blue-400 uppercase tracking-widest drop-shadow-[0_0_20px_rgba(77,159,255,0.4)]">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-bold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl leading-relaxed tracking-tight text-slate-400 max-w-2xl text-center font-light px-4"
            >
              {subtitle}
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-row gap-4"
          >
            <Button size="lg" className="gap-2 bg-blue-600 text-white hover:bg-blue-500 border border-blue-400/30 shadow-[0_0_15px_rgba(77,159,255,0.3)] transition-all font-semibold uppercase tracking-wider" onClick={onPrimaryClick}>
              {primaryText} <MoveRight className="w-4 h-4 text-white" />
            </Button>
            <Button size="lg" className="gap-2 bg-slate-900 text-blue-400 border border-blue-500/20 hover:bg-slate-800/80 font-semibold uppercase tracking-wider" onClick={onSecondaryClick}>
              {secondaryText}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
