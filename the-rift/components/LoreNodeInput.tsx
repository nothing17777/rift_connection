"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import clsx from "clsx";

interface NodeOption {
  name: string;
  type?: "champion" | "region" | "faction" | "event" | "other";
}

interface LoreNodeInputProps {
  nodes: NodeOption[];
  onSelect: (name: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function LoreNodeInput({ nodes, onSelect, disabled, placeholder }: LoreNodeInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = query.length < 1
    ? []
    : nodes.filter(n => n.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex(i => (i + 1) % Math.max(filtered.length, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex(i => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1)); }
    else if (e.key === "Enter" && isOpen && filtered.length > 0) { e.preventDefault(); submitNode(filtered[selectedIndex].name); }
  };

  const submitNode = (name: string) => {
    onSelect(name);
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(0);
  };

  const typeColors: Record<string, string> = {
    champion: "text-gold",
    region: "text-blue-400",
    faction: "text-purple-400",
    event: "text-orange-400",
    other: "text-muted",
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); setSelectedIndex(0); }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder || "Type a node name..."}
          className="w-full bg-surface border-2 border-surface focus:border-gold outline-none rounded-lg py-3 pl-10 pr-4 transition-colors placeholder:text-muted disabled:opacity-50"
        />
      </div>
      <AnimatePresence>
        {isOpen && filtered.length > 0 && !disabled && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute z-10 w-full mt-1 bg-surface border border-blue-accent/30 rounded-xl overflow-hidden shadow-2xl"
          >
            {filtered.map((node, idx) => (
              <li
                key={node.name}
                onClick={() => submitNode(node.name)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={clsx(
                  "px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors text-sm",
                  idx === selectedIndex ? "bg-background text-gold" : "hover:bg-background/50"
                )}
              >
                <span className="font-semibold">{node.name}</span>
                <span className={`text-xs uppercase ${typeColors[node.type || "other"]}`}>{node.type}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
