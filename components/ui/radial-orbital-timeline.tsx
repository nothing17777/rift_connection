"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState: Record<number, boolean> = {};
      Object.keys(prev).forEach((key) => { newState[parseInt(key)] = false; });
      newState[id] = !prev[id];
      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);
        const relatedItems = timelineData.find((item) => item.id === id)?.relatedIds || [];
        const newPulse: Record<number, boolean> = {};
        relatedItems.forEach((relId) => { newPulse[relId] = true; });
        setPulseEffect(newPulse);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }
      return newState;
    });
  };

  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => {
      setRotationAngle((prev) => Number(((prev + 0.3) % 360).toFixed(3)));
    }, 50);
    return () => clearInterval(timer);
  }, [autoRotate]);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 200;
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
    return { x, y, angle, zIndex, opacity };
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    return (timelineData.find((item) => item.id === activeNodeId)?.relatedIds || []).includes(itemId);
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed": return "border-[#c8a84b] bg-[#c8a84b]/20 text-[#c8a84b]";
      case "in-progress": return "border-[#c8a84b]/60 bg-[#c8a84b]/10 text-[#f0d080]";
      case "pending": return "border-white/30 bg-white/5 text-white/50";
      default: return "border-white/30 bg-white/5 text-white/50";
    }
  };

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#0a0e1a' }}
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{ perspective: "1000px" }}
        >
          {/* Central pulsing node */}
          <div className="absolute w-16 h-16 rounded-full flex items-center justify-center z-10" style={{ background: 'radial-gradient(circle, #c8a84b, #f0d080, #c8a84b)', boxShadow: '0 0 30px rgba(200,168,75,0.6)' }}>
            <div className="absolute w-20 h-20 rounded-full border border-[#c8a84b]/30 animate-ping opacity-70" />
            <div className="absolute w-24 h-24 rounded-full border border-[#c8a84b]/20 animate-ping opacity-50" style={{ animationDelay: '0.5s' }} />
            <div className="w-8 h-8 rounded-full" style={{ background: '#0a0e1a' }} />
          </div>

          {/* Orbit ring */}
          <div className="absolute w-96 h-96 rounded-full border" style={{ borderColor: 'rgba(200,168,75,0.15)' }} />

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                ref={(el) => { nodeRefs.current[item.id] = el; }}
                className="absolute transition-all duration-700 cursor-pointer"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  zIndex: isExpanded ? 200 : position.zIndex,
                  opacity: isExpanded ? 1 : position.opacity,
                }}
                onClick={(e) => { e.stopPropagation(); toggleItem(item.id); }}
              >
                {/* Energy aura */}
                <div
                  className={`absolute rounded-full ${isPulsing ? 'animate-pulse' : ''}`}
                  style={{
                    background: `radial-gradient(circle, rgba(200,168,75,0.25) 0%, transparent 70%)`,
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}
                />

                {/* Node circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'scale-150' : ''}`}
                  style={{
                    background: isExpanded ? '#c8a84b' : isRelated ? 'rgba(200,168,75,0.4)' : '#111827',
                    color: isExpanded ? '#0a0e1a' : '#c8a84b',
                    border: `2px solid ${isExpanded ? '#f0d080' : isRelated ? '#c8a84b' : 'rgba(200,168,75,0.4)'}`,
                    boxShadow: isExpanded ? '0 0 20px rgba(200,168,75,0.5)' : isRelated ? '0 0 12px rgba(200,168,75,0.3)' : 'none',
                  }}
                >
                  <Icon size={16} />
                </div>

                {/* Label */}
                <div className={`absolute top-12 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300 ${isExpanded ? 'scale-125' : ''}`} style={{ color: isExpanded ? '#c8a84b' : 'rgba(232,224,204,0.7)', fontFamily: 'var(--font-cinzel)' }}>
                  {item.title}
                </div>

                {/* Expanded card */}
                {isExpanded && (
                  <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-64 overflow-visible" style={{ background: 'rgba(10,14,26,0.95)', borderColor: 'rgba(200,168,75,0.3)', boxShadow: '0 0 30px rgba(200,168,75,0.2)' }}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3" style={{ background: 'rgba(200,168,75,0.5)' }} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge className={`px-2 text-xs border ${getStatusStyles(item.status)}`} style={{ background: 'transparent' }}>
                          {item.status === "completed" ? "COMPLETE" : item.status === "in-progress" ? "IN PROGRESS" : "PENDING"}
                        </Badge>
                        <span className="text-xs font-mono" style={{ color: 'rgba(200,168,75,0.6)' }}>{item.date}</span>
                      </div>
                      <CardTitle className="text-sm mt-2 font-cinzel" style={{ color: '#c8a84b' }}>{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs" style={{ color: 'rgba(232,224,204,0.8)' }}>
                      <p>{item.content}</p>
                      <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(200,168,75,0.15)' }}>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="flex items-center gap-1" style={{ color: 'rgba(200,168,75,0.7)' }}><Zap size={10} />Energy</span>
                          <span className="font-mono" style={{ color: '#c8a84b' }}>{item.energy}%</span>
                        </div>
                        <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <div className="h-full rounded-full" style={{ width: `${item.energy}%`, background: 'linear-gradient(90deg, #c8a84b, #f0d080)' }} />
                        </div>
                      </div>
                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(200,168,75,0.15)' }}>
                          <div className="flex items-center mb-2">
                            <Link size={10} className="mr-1" style={{ color: 'rgba(200,168,75,0.7)' }} />
                            <h4 className="text-xs uppercase tracking-wider font-medium" style={{ color: 'rgba(200,168,75,0.7)' }}>Connected Nodes</h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const rel = timelineData.find((i) => i.id === relatedId);
                              return (
                                <Button key={relatedId} variant="outline" size="sm"
                                  className="flex items-center h-6 px-2 py-0 text-xs rounded cursor-pointer"
                                  onClick={(e) => { e.stopPropagation(); toggleItem(relatedId); }}>
                                  {rel?.title}<ArrowRight size={8} className="ml-1" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
