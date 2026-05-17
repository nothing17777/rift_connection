"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  rules: { step: number; text: string }[];
}

export function RulesModal({ isOpen, onClose, title, rules }: RulesModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-surface border border-gold/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_40px_rgba(200,168,75,0.15)] pointer-events-auto">
              <div className="flex items-start justify-between mb-6">
                <h2 className="font-cinzel text-2xl font-bold text-gold">How to Play</h2>
                <button
                  onClick={onClose}
                  className="text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-background"
                >
                  <X size={20} />
                </button>
              </div>
              <h3 className="font-cinzel text-lg text-text mb-4">{title}</h3>
              <ol className="flex flex-col gap-3">
                {rules.map(rule => (
                  <li key={rule.step} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center border border-gold/30">
                      {rule.step}
                    </span>
                    <span className="text-text/80 text-sm leading-relaxed">{rule.text}</span>
                  </li>
                ))}
              </ol>
              <button
                onClick={onClose}
                className="mt-8 w-full py-3 bg-gold text-background font-bold font-cinzel rounded-xl hover:bg-gold-light transition-colors"
              >
                Let&apos;s Play!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
