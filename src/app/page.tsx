"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useStore } from "@/store/useStore";

import { Effects } from "@/components/Effects/Effects";
import { WorldEngine } from "@/components/Environment/WorldEngine";
import { CinematicCamera } from "@/components/Camera/CinematicCamera";

export default function Home() {
  const isMutated = useStore((state) => state.isDismantled);
  const scrollProgress = useStore((state) => state.scrollProgress);
  const setScrollProgress = useStore((state) => state.setScrollProgress);

  const lastScrollTime = useRef(0);

  // Interaction Language: The visitor learns by experimentation.
  // Scrolling no longer snaps UI. It pushes the camera physically forward through the Cathedral.
  const handleWheel = (e: React.WheelEvent) => {
    // Smooth infinite scrolling mapping to Z-axis progress
    const scrollDelta = e.deltaY * 0.05;
    setScrollProgress(scrollProgress + scrollDelta);
  };

  return (
    <main 
      onWheel={handleWheel}
      style={{ width: "100vw", height: "100vh", background: "#050505", overflow: "hidden", position: "relative" }}
    >
      {/* 3D Cinematic Canvas */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <CinematicCamera />
        
        {/* The Civilization Architecture */}
        <WorldEngine />

        {/* Cinematic Ecosystem Lighting */}
        <ambientLight intensity={0.4} />
        
        {/* Central Bioluminescence illuminating the Cathedral Nave */}
        <pointLight position={[0, 5, -10]} intensity={80} color="#f5f5dc" distance={40} decay={2} />
        
        {/* Heavy directional light raking across the pillars to reveal texture */}
        <directionalLight position={[20, 20, 10]} intensity={1.5} color="#d1c7b7" />
        <directionalLight position={[-20, 10, -20]} intensity={0.8} color="#1a1a1a" />
        
        <Effects />
      </Canvas>

      {/* Environmental Interface: Only exists to hint at scale or anomalies. */}
      <div style={{
        position: 'absolute',
        bottom: '8vh',
        width: '100%',
        textAlign: 'center',
        pointerEvents: 'none',
        color: isMutated ? 'rgba(139,0,0,0.5)' : 'rgba(245,245,220,0.4)', // Muted crimson or bone ivory
        transition: 'all 4s cubic-bezier(0.16, 1, 0.3, 1)', // Very slow ecosystem fade
        opacity: isMutated ? 0.4 : 0.8
      }}>
        <h1 style={{ 
          fontSize: '10px', 
          fontWeight: 300, 
          letterSpacing: '0.6em', 
          fontFamily: 'monospace',
          textTransform: 'uppercase'
        }}>
          {isMutated ? "LOCAL INFECTION DETECTED" : "SECTOR: BIOLOGICAL ARCHIVE"}
        </h1>
      </div>
    </main>
  );
}

