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
import { CinematicCamera } from "@/components/Camera/CinematicCamera";

export default function Home() {
  const dialIndex = useStore((state) => state.dialIndex);
  const setDialIndex = useStore((state) => state.setDialIndex);
  const isMutated = useStore((state) => state.isDismantled);
  const toggleMutation = useStore((state) => state.toggleDismantle);

  const lastScrollTime = useRef(0);

  // Interaction Language: The visitor learns by experimentation.
  // Scrolling no longer snaps UI. It pushes the boundaries of the mutation.
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTime.current > 1500) { 
      if (e.deltaY > 50) {
        // Pushing forward transforms the environment organically
        toggleMutation();
        lastScrollTime.current = now;
      } else if (e.deltaY < -50) {
        // Pulling back rotates the dimensional space
        setDialIndex((dialIndex + 1) % 4);
        lastScrollTime.current = now;
      }
    }
  };

  return (
    <main 
      onWheel={handleWheel}
      style={{ width: "100vw", height: "100vh", background: "var(--background)", overflow: "hidden", position: "relative" }}
    >
      {/* 3D Cinematic Canvas */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <CinematicCamera />
        <OmniBlueprintGrid />

        <ambientLight intensity={0.2} />
        {/* Cinematic Rim Lights */}
        <spotLight position={[10, 10, 10]} intensity={150} color={isMutated ? "#ff0033" : "#39ff14"} penumbra={1} distance={50} />
        <spotLight position={[-10, -10, -10]} intensity={100} color="#ffffff" penumbra={1} distance={50} />
        
        <group position={[0, 0, 0]}>
          {dialIndex === 0 && <CyberMask />}
          {dialIndex === 1 && <CyberBird />}
          {dialIndex === 2 && <ArachnidCore />}
          {dialIndex === 3 && <TheCore />}
        </group>

        <Effects />
      </Canvas>

      {/* Environmental Interface: The UI exists only when needed, fading out when the world breathes. */}
      <div style={{
        position: 'absolute',
        bottom: '8vh',
        width: '100%',
        textAlign: 'center',
        pointerEvents: 'none',
        color: isMutated ? 'rgba(255,0,51,0.5)' : 'rgba(57,255,20,0.5)',
        transition: 'all 2s cubic-bezier(0.16, 1, 0.3, 1)', // Smooth organic fade
        opacity: isMutated ? 0.3 : 0.8
      }}>
        <h1 style={{ 
          fontSize: '12px', 
          fontWeight: 300, 
          letterSpacing: '0.4em', 
          fontFamily: 'monospace',
          textTransform: 'uppercase'
        }}>
          {isMutated ? "BIOLOGICAL MUTATION ACTIVE" : "STABLE ENVIRONMENT"}
        </h1>
      </div>
    </main>
  );
}
