"use client";

import { Canvas } from "@react-three/fiber";
import { CameraController } from "@/components/Camera/CameraController";
import { GridSystem } from "@/components/Environment/GridSystem";
import { BlueprintBackground } from "@/components/Environment/BlueprintBackground";
import { Effects } from "@/components/Effects/Effects";
import { Flower } from "@/components/Artifacts/Flower";
import { Dragonfly } from "@/components/Artifacts/Dragonfly";
import { TheEye } from "@/components/Artifacts/TheEye";
import { ArchiveLogs } from "@/components/Artifacts/ArchiveLogs";
import { SecretManager } from "@/components/Mechanics/SecretManager";
import { AudioSystem } from "@/components/Mechanics/AudioSystem";

export default function Home() {
  return (
    <main style={{ height: "1000vh", width: "100vw" }}>
      <AudioSystem />
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#020914" }}>
        <Canvas
          gl={{ antialias: true, alpha: false }}
        >
          {/* Custom procedural background behind everything */}
          <BlueprintBackground />
          
          <SecretManager />
          <CameraController />
          <ambientLight intensity={0.5} />
          
          <GridSystem />
          <Effects />
          
          <ArchiveLogs />
          
          {/* The primary interactive artifacts */}
          <Flower />
          <Dragonfly />
          
          {/* The final ending sequence */}
          <TheEye />
          
        </Canvas>
      </div>
    </main>
  );
}
