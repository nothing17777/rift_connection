"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Share2 } from "lucide-react";

interface ResultShareProps {
  shareText: string;
}

export function ResultShare({ shareText }: ResultShareProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <div className="bg-surface p-4 rounded-xl text-center whitespace-pre-wrap font-mono text-sm border border-blue-accent/30 w-full max-w-sm">
        {shareText}
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 bg-gold text-background font-bold py-3 px-8 rounded-full hover:bg-gold-light transition-colors relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="copied"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Check size={20} /> Copied!
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Share2 size={20} /> Share Result
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
