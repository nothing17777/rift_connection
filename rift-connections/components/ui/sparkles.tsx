"use client"

import { useEffect, useId, useState } from "react"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"

export function Sparkles({
  className = "",
  size = 1.5,
  minSize = null as number | null,
  density = 120,
  speed = 1.2,
  minSpeed = null as number | null,
  opacity = 0.8,
  opacitySpeed = 2,
  minOpacity = null as number | null,
  color = "#4d9fff",
  background = "transparent",
  options = {},
}) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setIsReady(true)
    })
  }, [])

  const id = useId()

  const defaultOptions = {
    background: {
      color: {
        value: background,
      },
    },
    fullScreen: {
      enable: false,
      zIndex: 1,
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: color,
      },
      move: {
        enable: true,
        direction: "none" as const,
        speed: {
          min: minSpeed || speed / 8,
          max: speed,
        },
        straight: false,
      },
      number: {
        value: density,
      },
      opacity: {
        value: {
          min: minOpacity || opacity / 8,
          max: opacity,
        },
        animation: {
          enable: true,
          sync: false,
          speed: opacitySpeed,
        },
      },
      size: {
        value: {
          min: minSize || size / 2.5,
          max: size,
        },
      },
    },
    detectRetina: true,
  }

  if (!isReady) return null

  return (
    <Particles 
      id={id} 
      options={{ ...defaultOptions, ...options }} 
      className={className} 
    />
  )
}
