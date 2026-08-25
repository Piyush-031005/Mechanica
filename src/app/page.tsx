"use client";

import { BlueprintHUD } from "@/components/UI/BlueprintHUD";
import { PointCloudCore } from "@/components/Artifacts/PointCloudCore";
import { PosterBackground } from "@/components/Environment/PosterBackground";
import { Canvas } from "@react-three/fiber";
import { CameraController } from "@/components/Camera/CameraController";
import { Effects } from "@/components/Effects/Effects";

export default function Home() {
  return (
    <main style={{ height: "100vh", width: "100vw", position: "relative", cursor: "none" }}>
      <PosterBackground />
      <BlueprintHUD />
      
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "transparent", pointerEvents: "none" }}>
        <Canvas
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0, 15], fov: 45 }}
        >
          <CameraController />

          {/* Point Cloud Lighting */}
          <ambientLight intensity={1.5} color="#ffffff" />
          <directionalLight position={[10, 10, 5]} intensity={3} color="#ffffff" />
          
          <PointCloudCore />
          
          <Effects />
        </Canvas>
      </div>
    </main>
  );
}
