"use client"

import { Sparkles } from "@/components/ui/sparkles"
import { useTheme } from "next-themes"
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

const regions = [
  { name: "Demacia", color: "#4a90d9" },
  { name: "Noxus", color: "#c0392b" },
  { name: "Piltover", color: "#f0d080" },
  { name: "Zaun", color: "#2ecc71" },
  { name: "Freljord", color: "#89CFF0" },
  { name: "Ionia", color: "#e91e8c" },
  { name: "Shadow Isles", color: "#1abc9c" },
  { name: "Shurima", color: "#e67e22" },
  { name: "Targon", color: "#9b59b6" },
  { name: "Bilgewater", color: "#3498db" },
  { name: "Void", color: "#8e44ad" },
  { name: "Ixtal", color: "#27ae60" },
]

export function Demo() {
  const { theme } = useTheme()
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col justify-between">
      <div className="mx-auto mt-32 w-full max-w-5xl px-4">
        <div className="text-center">
          <span className="text-4xl md:text-5xl font-cinzel text-gold text-gold-glow uppercase tracking-wider">
            CHAMPIONS OF RUNETERRA
          </span>
          <br />
          <span className="font-rajdhani tracking-widest text-sm text-[#e8e0cc]/60 uppercase mt-4 block">
            All Realms Represented • Guess Champions Across Every Region
          </span>
        </div>

        <div className="relative mt-12 h-[120px] w-full flex items-center justify-center">
          <InfiniteSlider 
            className='flex h-full w-full items-center py-4' 
            duration={25}
            gap={24}
          >
            {regions.map((region) => (
              <div 
                key={region.name} 
                className="flex items-center gap-3 px-6 py-3.5 rounded-xl border border-[#c8a84b]/20 bg-background/80 backdrop-blur-md whitespace-nowrap transition-all duration-300 hover:border-[#c8a84b]/50 group cursor-default"
                style={{ 
                  boxShadow: `0 0 15px ${region.color}10`,
                }}
              >
                <span 
                  className="w-3 h-3 rounded-full transition-transform duration-300 group-hover:scale-125" 
                  style={{ 
                    backgroundColor: region.color, 
                    boxShadow: `0 0 8px ${region.color}, 0 0 15px ${region.color}` 
                  }} 
                />
                <span className="font-cinzel text-sm font-bold tracking-wider text-[#e8e0cc] group-hover:text-gold transition-colors duration-300 uppercase">
                  {region.name}
                </span>
              </div>
            ))}
          </InfiniteSlider>
          <ProgressiveBlur
            className='pointer-events-none absolute top-0 left-0 h-full w-[250px] z-20'
            direction='left'
            blurIntensity={1.5}
          />
          <ProgressiveBlur
            className='pointer-events-none absolute top-0 right-0 h-full w-[250px] z-20'
            direction='right'
            blurIntensity={1.5}
          />
        </div>
      </div>

      <div className="relative h-96 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]">
        <div className="absolute inset-0 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,#c8a84b,transparent_70%)] before:opacity-30" />
        <div className="absolute -left-1/2 top-1/2 aspect-[1/0.7] z-10 w-[200%] rounded-[100%] border-t border-[#c8a84b]/20 bg-[#0a0e1a]" />
        <Sparkles
          density={1400}
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
          color={theme === "dark" ? "#c8a84b" : "#8350e8"}
        />
      </div>
    </div>
  )
}
