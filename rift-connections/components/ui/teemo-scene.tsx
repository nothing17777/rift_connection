"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface TeemoSceneProps {
  className?: string;
  animationState?: "idle" | "stunned" | "death" | "dance" | "attack";
}

export function TeemoScene({ className, animationState = "idle" }: TeemoSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animationsRef = useRef<THREE.AnimationClip[]>([]);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);

  // Play animation helper
  const playAnimation = (state: string) => {
    if (!mixerRef.current || animationsRef.current.length === 0) return;
    
    let exactAnimName = "Idle1_Base";
    if (state === "stunned") exactAnimName = "Stunned";
    else if (state === "death") exactAnimName = "Death";
    else if (state === "attack") exactAnimName = "Attack1.ASU_Teemo.anm";
    else if (state === "dance") exactAnimName = "Dance1";

    const clip = animationsRef.current.find(a => a.name === exactAnimName) 
              || animationsRef.current.find(a => a.name.includes("Idle1_Base")) 
              || animationsRef.current[0];
    
    if (clip) {
      const action = mixerRef.current.clipAction(clip);
      
      if (currentActionRef.current && currentActionRef.current !== action) {
        // Stop previous animation instantly to prevent orientation/rotation blending issues
        currentActionRef.current.stop();
      }
      
      if (currentActionRef.current !== action) {
        if (state === "death" || state === "stunned") {
          action.clampWhenFinished = true;
          action.loop = THREE.LoopOnce;
        } else {
          action.clampWhenFinished = false;
          action.loop = THREE.LoopRepeat;
        }
        
        // Reset and play the new animation cleanly
        action.reset();
        action.setEffectiveTimeScale(1);
        action.setEffectiveWeight(1);
        action.play();
        
        currentActionRef.current = action;
      }
    }
  };

  useEffect(() => {
    playAnimation(animationState);
  }, [animationState]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    let width = containerRef.current.clientWidth || 300;
    let height = containerRef.current.clientHeight || 240;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // 3. Renderer Setup with Alpha (transparent background)
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    // 4. Cinematic esports studio lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const cyanRim = new THREE.DirectionalLight(0x00f0ff, 2.0);
    cyanRim.position.set(-6, 3, -4);
    scene.add(cyanRim);

    const magentaFill = new THREE.DirectionalLight(0xd946ef, 1.2);
    magentaFill.position.set(5, -2, 2);
    scene.add(magentaFill);

    // 5. GLTF Load
    const loader = new GLTFLoader();
    let model: THREE.Group | null = null;

    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const w = containerRef.current.clientWidth || 300;
      const h = containerRef.current.clientHeight || 240;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    loader.load(
      "/teemo.glb",
      (gltf) => {
        model = gltf.scene;
        
        try {
          // Scale standard bounds FIRST
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = (maxDim > 0 && isFinite(maxDim)) ? (3.6 / maxDim) : 1.0;
          model.scale.setScalar(scale);

          // Now compute the new scaled bounding box and center it
          const newBox = new THREE.Box3().setFromObject(model);
          const center = newBox.getCenter(new THREE.Vector3());
          model.position.sub(center); // perfectly center it
          model.position.y -= 0.2; // slight visual offset down
        } catch (e) {
          console.warn("Bounding box calculation error, using defaults:", e);
          model.position.set(0, -0.2, 0);
          model.scale.setScalar(1.0);
        }

        scene.add(model);
        
        // Load and play the built-in animations
        if (gltf.animations && gltf.animations.length > 0) {
          mixerRef.current = new THREE.AnimationMixer(model);
          animationsRef.current = gltf.animations;
          playAnimation(animationState);
        }

        setLoading(false);
        
        // Force size recomputation on successful model injection
        setTimeout(handleResize, 50);
      },
      undefined,
      (err) => {
        console.error("Failed to load teemo.glb:", err);
        setError("Could not render Teemo 3D mascot.");
        setLoading(false);
      }
    );

    // 6. Interactive mouse spring parameters
    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      targetMouse.x = (x / rect.width) * 2;
      targetMouse.y = -(y / rect.height) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 7. Render Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update the 3D animation timeline
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Interpolation logic for ultra-smooth easing
      mouse.x += (targetMouse.x - mouse.x) * 0.08;
      mouse.y += (targetMouse.y - mouse.y) * 0.08;

      if (model) {
        // Gentle breathing rotation + interactive mouse tracking response
        model.rotation.y = Math.sin(elapsed * 0.4) * 0.1 + mouse.x * 0.6;
        model.rotation.x = mouse.y * 0.3;
      }

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    // Initial trigger
    handleResize();

    // 9. Cleanup hooks
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950 ${className}`}
    >
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin" />
          <span className="font-mono text-[9px] text-slate-500 tracking-wider uppercase">LOADING MASCOT</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-10 p-4 text-center">
          <span className="font-mono text-xs text-slate-500 tracking-wider">{error}</span>
        </div>
      )}

      <canvas ref={canvasRef} className="w-full h-full block z-0" />
    </div>
  );
}

