"use client";

import { Canvas } from "@react-three/fiber";
import { CameraController } from "@/components/Camera/CameraController";
import { GridSystem } from "@/components/Environment/GridSystem";
import { BlueprintBackground } from "@/components/Environment/BlueprintBackground";
import { ArchiveHall } from "@/components/Environment/ArchiveHall";
import { Effects } from "@/components/Effects/Effects";
import { Flower } from "@/components/Artifacts/Flower";
import { Dragonfly } from "@/components/Artifacts/Dragonfly";
import { Owl } from "@/components/Artifacts/Owl";
import { TheEye } from "@/components/Artifacts/TheEye";
import { ArchiveLogs } from "@/components/Artifacts/ArchiveLogs";
import { SecretManager } from "@/components/Mechanics/SecretManager";
import { AudioSystem } from "@/components/Mechanics/AudioSystem";
import { BlueprintHUD } from "@/components/UI/BlueprintHUD";

export default function Home() {
  return (
    <main style={{ height: "1000vh", width: "100vw" }}>
      <AudioSystem />
      <BlueprintHUD />
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#ffffff" }}>
        <Canvas
          shadows
          gl={{ antialias: true, alpha: false }}
        >
          {/* Custom procedural background behind everything */}
          <BlueprintBackground />
          
          <SecretManager />
          <CameraController />
          
          <ambientLight intensity={0.2} />
          {/* Cinematic Spotlight for harsh vintage shadows */}
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={2} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-10, 10, -30]} intensity={1.5} color="#D4AF37" />
          
          <ArchiveHall />
          <GridSystem />
          <Effects />
          
          <ArchiveLogs />
          
          {/* The primary interactive artifacts */}
          <Flower />
          <Dragonfly />
          <Owl />
          
          {/* The final ending sequence */}
          <TheEye />
          
        </Canvas>
      </div>
    </main>
  );
}
