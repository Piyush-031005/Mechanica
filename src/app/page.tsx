"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useStore } from "@/store/useStore";

import { CyberMask } from "@/components/Artifacts/CyberMask";
import { CyberBird } from "@/components/Artifacts/CyberBird";
import { ArachnidCore } from "@/components/Artifacts/ArachnidCore";
import { TheCore } from "@/components/Artifacts/TheCore";
import { Effects } from "@/components/Effects/Effects";
import { OmniBlueprintGrid } from "@/components/Environment/OmniBlueprintGrid";

const ORGANS = [
  { id: 0, title: "SYMBIOTE MASK", subtitle: "DNA SAMPLE 01" },
  { id: 1, title: "AERO GLIDER", subtitle: "DNA SAMPLE 02" },
  { id: 2, title: "RADIOACTIVE SPIDER", subtitle: "DNA SAMPLE 03" },
  { id: 3, title: "OMNI CORE", subtitle: "DNA SAMPLE 04" },
];

export default function Home() {
  const dialIndex = useStore((state) => state.dialIndex);
  const setDialIndex = useStore((state) => state.setDialIndex);
  const isMutated = useStore((state) => state.isDismantled);
  const toggleMutation = useStore((state) => state.toggleDismantle);
  const triggerExplosion = useStore((state) => state.triggerGlobalExplosion);

  const activeOrgan = ORGANS[dialIndex];
  const lastScrollTime = useRef(0);

  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTime.current > 800) { // 800ms cooldown for smooth stepping
      if (e.deltaY > 20) {
        setDialIndex((dialIndex + 1) % 4);
        triggerExplosion();
        lastScrollTime.current = now;
      } else if (e.deltaY < -20) {
        setDialIndex((dialIndex - 1 + 4) % 4);
        triggerExplosion();
        lastScrollTime.current = now;
      }
    }
  };

  return (
    <main 
      onWheel={handleWheel}
      style={{ width: "100vw", height: "100vh", background: "var(--background)", overflow: "hidden", position: "relative" }}
    >
      {/* Background radial glow & Blueprint Grid */}
      <OmniBlueprintGrid />
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw', height: '60vw',
        background: isMutated ? 'radial-gradient(circle, rgba(255,0,51,0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(57,255,20,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
        transition: 'background 0.5s ease',
      }} />

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} color={isMutated ? "#ff0033" : "#39ff14"} />
        
        {/* We rely on ambient and directional light to avoid network fetch errors from HDR environments */}

        <group position={[0, 0, 0]}>
          {dialIndex === 0 && <CyberMask />}
          {dialIndex === 1 && <CyberBird />}
          {dialIndex === 2 && <ArachnidCore />}
          {dialIndex === 3 && <TheCore />}
        </group>

        <Effects />
      </Canvas>

      {/* The Omni-Web Circular UI Overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        
        {/* Central Reticle */}
        <div style={{
          width: '80vh', height: '80vh',
          border: `2px solid ${isMutated ? 'var(--symbiote-red)' : 'var(--alien-green)'}`,
          borderRadius: '50%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          transition: 'all 0.3s ease',
          boxShadow: `0 0 50px ${isMutated ? 'rgba(255,0,51,0.2)' : 'rgba(57,255,20,0.2)'}`
        }}>
          {/* Dial Sectors */}
          {ORGANS.map((organ, index) => {
            const angle = (index * 90) * (Math.PI / 180);
            const x = Math.sin(angle) * 45;
            const y = -Math.cos(angle) * 45;
            const isActive = index === dialIndex;
            
            return (
              <div 
                key={organ.id}
                onClick={() => {
                  setDialIndex(index);
                  triggerExplosion();
                }}
                style={{
                  position: 'absolute',
                  top: `calc(50% + ${y}vh)`,
                  left: `calc(50% + ${x}vh)`,
                  transform: 'translate(-50%, -50%)',
                  width: isActive ? '30px' : '15px',
                  height: isActive ? '30px' : '15px',
                  backgroundColor: isMutated ? 'var(--symbiote-red)' : 'var(--alien-green)',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? `0 0 20px ${isMutated ? 'var(--symbiote-red)' : 'var(--alien-green)'}` : 'none'
                }}
              />
            );
          })}
        </div>

        {/* Info Text */}
        <div style={{
          position: 'absolute',
          bottom: '10vh',
          textAlign: 'center',
          color: isMutated ? 'var(--symbiote-red)' : 'var(--alien-green)',
          textShadow: `0 0 10px ${isMutated ? 'var(--symbiote-red)' : 'var(--alien-green)'}`,
          transition: 'all 0.3s ease'
        }}>
          <h2 style={{ fontSize: '14px', letterSpacing: '0.3em', opacity: 0.7 }}>{activeOrgan.subtitle}</h2>
          <h1 style={{ fontSize: '3vw', fontWeight: 900, letterSpacing: '0.1em', marginTop: '10px' }}>{activeOrgan.title}</h1>
        </div>

        {/* Scroll Hint */}
        <div style={{
          position: 'absolute',
          top: '5vh',
          color: isMutated ? 'var(--symbiote-red)' : 'var(--alien-green)',
          fontSize: '10px',
          letterSpacing: '0.2em',
          opacity: 0.5,
          fontFamily: 'monospace'
        }}>
          [ SCROLL MOUSE WHEEL TO CYCLE BLUEPRINTS ]
        </div>

        {/* MUTATE BUTTON */}
        <button
          onClick={() => {
            toggleMutation();
            triggerExplosion();
          }}
          style={{
            position: 'absolute',
            bottom: '4vh',
            padding: '15px 40px',
            backgroundColor: 'transparent',
            border: `1px solid ${isMutated ? 'var(--symbiote-red)' : 'var(--alien-green)'}`,
            color: isMutated ? 'var(--symbiote-red)' : 'var(--alien-green)',
            fontSize: '12px',
            letterSpacing: '0.4em',
            fontWeight: 800,
            cursor: 'pointer',
            pointerEvents: 'auto',
            transition: 'all 0.3s ease',
            textShadow: `0 0 10px ${isMutated ? 'var(--symbiote-red)' : 'var(--alien-green)'}`,
            boxShadow: `inset 0 0 20px ${isMutated ? 'rgba(255,0,51,0.2)' : 'rgba(57,255,20,0.2)'}`
          }}
        >
          {isMutated ? "REVERT SEQUENCE" : "INITIATE MUTATION"}
        </button>
      </div>
    </main>
  );
}
