"use client";

import { AwwwardsUI } from "@/components/UI/AwwwardsUI";
import { CyberOrigami } from "@/components/Artifacts/CyberOrigami";
import { PosterBackground } from "@/components/Environment/PosterBackground";
import { Canvas } from "@react-three/fiber";
import { CameraController } from "@/components/Camera/CameraController";
import { Effects } from "@/components/Effects/Effects";
import { Environment } from "@react-three/drei";

export default function Home() {
  return (
    // Single 100vh screen for the Graphic Poster
    <main style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <PosterBackground />
      <AwwwardsUI />
      
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "transparent" }}>
        <Canvas
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <CameraController />

          {/* Luminous Lighting Setup */}
          <ambientLight intensity={1.5} color="#ffffff" />
          
          <directionalLight
            position={[10, 10, 5]}
            intensity={3}
            color="#ffffff"
          />
          
          {/* Subtle Crimson rim light */}
          <directionalLight
            position={[-5, -5, -5]}
            intensity={2}
            color="#ff003c"
          />
          
          <directionalLight
            position={[0, 0, 10]}
            intensity={1.5}
            color="#00f0ff"
          />

          <Environment preset="city" blur={0.5} />

          {/* The new central piece */}
          <CyberOrigami />
          
          <Effects />
        </Canvas>
      </div>
    </main>
  );
}
