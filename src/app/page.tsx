"use client";

import { AwwwardsUI } from "@/components/UI/AwwwardsUI";
import { LiquidCore } from "@/components/Artifacts/LiquidCore";
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

          {/* Studio Lighting Setup for light background */}
          <ambientLight intensity={0.8} />
          
          <directionalLight
            position={[5, 10, 5]}
            intensity={2}
            color="#ffffff"
          />
          
          <directionalLight
            position={[-5, 0, 5]}
            intensity={1}
            color="#6eb5ff"
          />

          <Environment preset="city" />

          {/* The Intertwined 3D Poster */}
          <LiquidCore />
          
          <Effects />
        </Canvas>
      </div>
    </main>
  );
}
