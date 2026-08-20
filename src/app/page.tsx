"use client";

import { Canvas } from "@react-three/fiber";
import { CameraController } from "@/components/Camera/CameraController";
import { GridSystem } from "@/components/Environment/GridSystem";
import { Effects } from "@/components/Effects/Effects";
import { Flower } from "@/components/Artifacts/Flower";
import { TheEye } from "@/components/Artifacts/TheEye";
import { SecretManager } from "@/components/Mechanics/SecretManager";
import { AudioSystem } from "@/components/Mechanics/AudioSystem";

export default function Home() {
  return (
    <main style={{ height: "1000vh", width: "100vw" }}>
      <AudioSystem />
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}>
        <Canvas
          gl={{ antialias: true, alpha: false }}
        >
          <SecretManager />
          <CameraController />
          <color attach="background" args={["#020914"]} />
          <ambientLight intensity={0.5} />
          
          <GridSystem />
          <Effects />
          
          {/* The primary interactive artifact */}
          <Flower />
          
          {/* The final ending sequence */}
          <TheEye />
          
        </Canvas>
      </div>
    </main>
  );
}
