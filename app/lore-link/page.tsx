"use client";

import { useState, useEffect } from "react";
import { Zap, Shield } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import loreLinksData from "@/data/lore-links.json";
import championsData from "@/data/champions.json";
import { useGameStore } from "@/store/gameStore";
import { findPath, getParSteps, type LoreGraph } from "@/lib/loreGraph";
import { ResultShare } from "@/components/ResultShare";
import { LoreNodeInput } from "@/components/LoreNodeInput";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

const graph = loreLinksData as LoreGraph;

const CHAMPION_NODES = championsData.filter((c) => graph[c.name]);
const CHAMPION_NAMES = CHAMPION_NODES.map((c) => c.name);
const CHAMPIONS_IN_GRAPH = new Set(championsData.map((c) => c.name));
const allNodes = Object.keys(graph).map((name) => ({
  name,
  type: (CHAMPIONS_IN_GRAPH.has(name) ? "champion" : "region") as "champion" | "region" | "faction" | "event" | "other",
}));

// Orbital data for the lore visualization panel
const loreOrbitalData = [
  { id: 1, title: "Lux", date: "Demacia", content: "Demacian mage hiding light-bending powers from her own kingdom.", category: "Champion", icon: Zap, relatedIds: [2, 3], status: "completed" as const, energy: 90 },
  { id: 2, title: "Sylas", date: "Demacia", content: "Mage rebel who broke free and stole magical power.", category: "Champion", icon: Zap, relatedIds: [1, 3], status: "completed" as const, energy: 85 },
  { id: 3, title: "Demacia", date: "Region", content: "Anti-magic kingdom built on petricite stone.", category: "Region", icon: Shield, relatedIds: [1, 2, 4], status: "completed" as const, energy: 100 },
  { id: 4, title: "Garen", date: "Demacia", content: "Demacian warrior and Lux's brother, devoted to his kingdom.", category: "Champion", icon: Shield, relatedIds: [3, 1], status: "completed" as const, energy: 80 },
  { id: 5, title: "Katarina", date: "Noxus", content: "Noxian assassin with a complicated history with Garen.", category: "Champion", icon: Zap, relatedIds: [4, 6], status: "in-progress" as const, energy: 75 },
  { id: 6, title: "Noxus", date: "Region", content: "Empire that values strength above all else.", category: "Region", icon: Shield, relatedIds: [5, 7], status: "in-progress" as const, energy: 70 },
  { id: 7, title: "Darius", date: "Noxus", content: "Hand of Noxus, the most feared general in the empire.", category: "Champion", icon: Shield, relatedIds: [6, 5], status: "pending" as const, energy: 60 },
];

interface DailyPair { start: string; end: string; }

function getDailyPair(): DailyPair {
  const seed = new Date().toDateString();
  let hash = 0;
  for (const c of seed) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  const startIdx = Math.abs(hash) % CHAMPION_NAMES.length;
  const endIdx = Math.abs(hash * 17 + 31) % CHAMPION_NAMES.length;
  const start = CHAMPION_NAMES[startIdx];
  const end = CHAMPION_NAMES[endIdx === startIdx ? (endIdx + 1) % CHAMPION_NAMES.length : endIdx];
  return { start, end };
}

export default function LoreLinkPage() {
  const GAME_ID = "lore-link";
  const { completeGame } = useGameStore();
  const [activeTab, setActiveTab] = useState<"puzzle" | "atlas">("puzzle");

  const [puzzle, setPuzzle] = useState<DailyPair | null>(null);
  const [userPath, setUserPath] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [parSteps, setParSteps] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [invalidNode, setInvalidNode] = useState<string | null>(null);

  useEffect(() => {
    const p = getDailyPair();
    setPuzzle(p);
    setUserPath([p.start]);
    setParSteps(getParSteps(p.start, p.end, graph));
    setMounted(true);
  }, []);

  const handleNodeSelect = (nodeName: string) => {
    if (!puzzle || isGameOver) return;
    const currentNode = userPath[userPath.length - 1];
    const neighbors = graph[currentNode] || [];
    if (!neighbors.includes(nodeName)) {
      setInvalidNode(nodeName);
      setTimeout(() => setInvalidNode(null), 1500);
      return;
    }
    const newPath = [...userPath, nodeName];
    setUserPath(newPath);
    if (nodeName === puzzle.end) {
      setIsWon(true);
      setIsGameOver(true);
      completeGame(GAME_ID);
    }
  };

  const handleGiveUp = () => { setIsGameOver(true); setIsWon(false); };
  const getChampIcon = (name: string) => championsData.find((c) => c.name === name)?.icon;

  if (!mounted || !puzzle) return null;

  const totalSteps = userPath.length - 1;
  const isOnPar = totalSteps <= parSteps;
  const shareText = isWon
    ? `The Rift — LoreLink #42\n${userPath.join(" → ")}\n${totalSteps} steps (par ${parSteps})\ntherift.gg`
    : `The Rift — LoreLink #42\nGave up at ${totalSteps} steps (par ${parSteps})\ntherift.gg`;

  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-cinzel text-4xl font-bold text-gold mb-2">LoreLink</h1>
        <p className="text-muted">Connect the two champions through shared lore nodes</p>
      </div>

      {/* Tab switcher */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab("puzzle")}
          className="px-5 py-2 rounded font-rajdhani font-semibold text-sm uppercase tracking-widest cursor-pointer transition-all duration-200"
          style={{
            background: activeTab === "puzzle" ? 'linear-gradient(135deg,#c8a84b,#f0d080)' : 'rgba(200,168,75,0.07)',
            color: activeTab === "puzzle" ? '#0a0e1a' : '#c8a84b',
            border: '1px solid rgba(200,168,75,0.3)',
          }}
        >
          Daily Puzzle
        </button>
        <button
          onClick={() => setActiveTab("atlas")}
          className="px-5 py-2 rounded font-rajdhani font-semibold text-sm uppercase tracking-widest cursor-pointer transition-all duration-200"
          style={{
            background: activeTab === "atlas" ? 'linear-gradient(135deg,#c8a84b,#f0d080)' : 'rgba(200,168,75,0.07)',
            color: activeTab === "atlas" ? '#0a0e1a' : '#c8a84b',
            border: '1px solid rgba(200,168,75,0.3)',
          }}
        >
          Lore Atlas
        </button>
      </div>

      {activeTab === "atlas" ? (
        <div className="relative rounded-xl overflow-hidden" style={{ height: '70vh', border: '1px solid rgba(200,168,75,0.2)', background: '#0a0e1a' }}>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 text-xs uppercase tracking-widest font-semibold" style={{ color: 'rgba(200,168,75,0.6)' }}>
            Click a node to explore lore connections
          </div>
          <RadialOrbitalTimeline timelineData={loreOrbitalData} />
        </div>
      ) : (
        <>
          {/* Endpoints */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full border-2 border-gold shadow-[0_0_15px_rgba(200,168,75,0.3)] overflow-hidden bg-background">
                {getChampIcon(puzzle.start) && <img src={getChampIcon(puzzle.start)} alt={puzzle.start} className="w-full h-full object-cover" />}
              </div>
              <span className="font-cinzel font-bold text-gold text-sm">{puzzle.start}</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-muted text-xs font-semibold uppercase tracking-wider mb-1">
                Par: <span className="text-gold ml-1">{parSteps} links</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-gold/30 via-muted/20 to-gold/30 w-full" />
              <ArrowRight className="text-gold/50" size={20} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full border-2 border-blue-accent shadow-[0_0_15px_rgba(30,58,95,0.5)] overflow-hidden bg-background">
                {getChampIcon(puzzle.end) && <img src={getChampIcon(puzzle.end)} alt={puzzle.end} className="w-full h-full object-cover" />}
              </div>
              <span className="font-cinzel font-bold text-blue-300 text-sm">{puzzle.end}</span>
            </div>
          </div>

          {/* Step counter */}
          <div className="text-center mb-6">
            <span className="text-sm text-muted">Steps: </span>
            <span className={`font-bold text-lg ${isOnPar ? "text-green-400" : "text-orange-400"}`}>{totalSteps}</span>
          </div>

          {/* Current path */}
          <div className="bg-surface rounded-xl p-4 mb-6 border border-blue-accent/20">
            <div className="flex flex-wrap items-center gap-2">
              {userPath.map((node, idx) => {
                const isChamp = CHAMPIONS_IN_GRAPH.has(node);
                const isStart = idx === 0;
                const isEnd = node === puzzle.end;
                return (
                  <span key={idx} className="flex items-center gap-1.5">
                    {idx > 0 && <ChevronRight size={14} className="text-muted flex-shrink-0" />}
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${isEnd ? "bg-green-500/20 text-green-400 border-green-500/30" : isStart ? "bg-gold/20 text-gold border-gold/30" : isChamp ? "bg-surface text-text border-blue-accent/40" : "bg-purple-500/10 text-purple-300 border-purple-500/20"}`}>
                      {node}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Invalid node feedback */}
          <AnimatePresence>
            {invalidNode && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center text-red-400 text-sm font-semibold flex items-center justify-center gap-2">
                <XCircle size={16} />
                <span><strong>{invalidNode}</strong> is not connected to <strong>{userPath[userPath.length - 1]}</strong></span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input or result */}
          {!isGameOver ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted">Select a node connected to <span className="text-gold font-semibold">{userPath[userPath.length - 1]}</span></p>
              <LoreNodeInput nodes={allNodes} onSelect={handleNodeSelect} disabled={isGameOver} placeholder="Type a champion, region, or faction..." />
              <div className="mt-2 flex flex-wrap justify-center gap-2 max-w-lg">
                {(graph[userPath[userPath.length - 1]] || []).map((neighbor) => (
                  <button key={neighbor} onClick={() => handleNodeSelect(neighbor)} className="px-3 py-1 bg-background hover:bg-surface text-sm rounded-full border border-surface hover:border-gold/40 transition-all text-muted hover:text-text cursor-pointer">
                    {neighbor}
                  </button>
                ))}
              </div>
              <button onClick={handleGiveUp} className="mt-4 text-sm text-muted hover:text-red-400 transition-colors underline underline-offset-2 cursor-pointer">
                Give up & reveal answer
              </button>
            </div>
          ) : (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              {isWon ? (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle2 size={48} className="text-green-400" />
                  <h2 className="font-cinzel text-3xl font-bold text-green-400">Connected!</h2>
                  <p className="text-muted">
                    You linked <span className="text-gold">{puzzle.start}</span> → <span className="text-blue-300">{puzzle.end}</span> in{" "}
                    <span className={`font-bold ${isOnPar ? "text-green-400" : "text-orange-400"}`}>{totalSteps} steps</span>{" "}(par {parSteps})
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <XCircle size={48} className="text-red-400" />
                  <h2 className="font-cinzel text-3xl font-bold text-red-400">Gave Up</h2>
                  {(() => { const optPath = findPath(puzzle.start, puzzle.end, graph); return optPath && <div className="text-sm text-muted">Shortest path: {optPath.join(" → ")}</div>; })()}
                </div>
              )}
              <ResultShare shareText={shareText} />
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
