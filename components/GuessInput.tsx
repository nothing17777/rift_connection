"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import clsx from "clsx";

interface Champion {
  name: string;
  icon: string;
}

interface GuessInputProps {
  champions: Champion[];
  onGuess: (championName: string) => void;
  disabled?: boolean;
}

export function GuessInput({ champions, onGuess, disabled }: GuessInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query === "" 
    ? champions
    : champions.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" && isOpen && filtered.length > 0) {
      e.preventDefault();
      submitGuess(filtered[selectedIndex].name);
    }
  };

  const submitGuess = (name: string) => {
    onGuess(name);
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(0);
  };

  // Allow parent to trigger shake via imperative handle if we wanted to, 
  // but for simplicity we can trigger shake here if the guess wasn't "accepted" 
  // For now, it's a controlled input so the parent handles shake, 
  // or we can pass a callback that returns true/false if valid guess.
  
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted">
          <Search size={20} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type a champion name..."
          className="w-full bg-surface border-2 border-surface focus:border-gold outline-none rounded-xl py-4 pl-12 pr-4 text-lg transition-colors placeholder:text-muted disabled:opacity-50"
        />
      </div>

      <AnimatePresence>
        {isOpen && filtered.length > 0 && !disabled && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 bg-surface border border-blue-accent/30 rounded-xl overflow-hidden shadow-2xl"
          >
            {filtered.map((champ, idx) => (
              <li
                key={champ.name}
                onClick={() => submitGuess(champ.name)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={clsx(
                  "px-4 py-3 flex items-center gap-4 cursor-pointer transition-colors",
                  idx === selectedIndex ? "bg-background text-gold" : "hover:bg-background/50"
                )}
              >
                <img src={champ.icon} alt={champ.name} className="w-8 h-8 rounded-full border border-surface" />
                <span className="font-semibold">{champ.name}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
