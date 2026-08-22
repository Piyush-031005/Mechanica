"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { CameraController } from "@/components/Camera/CameraController";
import { Effects } from "@/components/Effects/Effects";
import { AwwwardsUI } from "@/components/UI/AwwwardsUI";
import { LiquidCore } from "@/components/Artifacts/LiquidCore";
import { TheEngine } from "@/components/Artifacts/TheEngine";

export default function Home() {
  return (
    // 500vh - fast, dense scroll experience
    <main style={{ height: "500vh", width: "100vw", background: "#050505" }}>
      <AwwwardsUI />
      
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#050505" }}>
        <Canvas
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        >
          {/* Very dark grey background */}
          <color attach="background" args={["#050505"]} />
          
          <CameraController />
          
          {/* Studio Lighting Setup */}
          <ambientLight intensity={0.2} />
          
          {/* Key light - cool white */}
          <directionalLight
            position={[5, 10, 5]}
            intensity={2}
            color="#ffffff"
          />
          
          {/* Fill light - subtle blue */}
          <directionalLight
            position={[-5, 0, 5]}
            intensity={0.5}
            color="#6eb5ff"
          />
          
          {/* Rim light - dramatic red/orange from behind */}
          <pointLight
            position={[0, -5, -5]}
            intensity={4}
            color="#ff5500"
            distance={20}
          />

          {/* Environment map is required for MeshTransmissionMaterial to reflect something */}
          <Environment preset="city" />

          {/* Section 1: The Hero Object */}
          <LiquidCore />
          
          {/* Section 2: The Vault */}
          <TheEngine />
          
          <Effects />
        </Canvas>
      </div>
    </main>
  );
}
