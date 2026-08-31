"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import { useStore } from "@/store/useStore";

import { Effects } from "@/components/Effects/Effects";
import { SymbioteCore } from "@/components/Artifacts/SymbioteCore";
import { CinematicCamera } from "@/components/Camera/CinematicCamera";

export default function Home() {
  const isMutated = useStore((state) => state.isDismantled);

  return (
    <main 
      style={{ width: "100vw", height: "100vh", background: "#020202", overflow: "hidden", position: "relative" }}
    >
      {/* 3D Cinematic Canvas */}
      <Canvas
        camera={{ position: [0, 2, 12], fov: 45 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <CinematicCamera />
        
        {/* The Hero Object: Liquid Metal Symbiote */}
        <group position={[0, 2, 0]}>
          <SymbioteCore />
        </group>

        {/* The Neural Floor: Infinite Dark Mirror */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
          <planeGeometry args={[100, 100]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={80}
            roughness={1}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#050505"
            metalness={0.5}
            mirror={1}
          />
        </mesh>

        {/* High-End Cinematic Lighting */}
        <ambientLight intensity={0.2} />
        
        {/* Deep Cyan Rim Light */}
        <directionalLight position={[10, 10, -10]} intensity={3} color="#00ffff" />
        
        {/* Violet Core Light */}
        <pointLight position={[-5, 5, 5]} intensity={50} color="#ff00ff" distance={20} decay={2} />
        
        <Effects />
      </Canvas>

      {/* Environmental Typography */}
      <div style={{
        position: 'absolute',
        bottom: '8vh',
        width: '100%',
        textAlign: 'center',
        pointerEvents: 'none',
        color: 'rgba(255,255,255,0.2)', 
        opacity: 0.8
      }}>
        <h1 style={{ 
          fontSize: '10px', 
          fontWeight: 300, 
          letterSpacing: '0.8em', 
          fontFamily: 'monospace',
          textTransform: 'uppercase'
        }}>
          SYMBIOTE.SYS // EXPERIMENTAL BIOMECHANICS
        </h1>
      </div>
    </main>
  );
}

