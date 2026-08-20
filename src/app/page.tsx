"use client";

import { Canvas } from "@react-three/fiber";
import { CameraController } from "@/components/Camera/CameraController";

export default function Home() {
  return (
    <main style={{ height: "1000vh", width: "100vw" }}>
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}>
        <Canvas
          gl={{ antialias: true, alpha: false }}
        >
          <CameraController />
          <color attach="background" args={["#020914"]} />
          <ambientLight intensity={0.5} />
          
          {/* A tunnel of blueprint cubes to fly through to test the camera */}
          {Array.from({ length: 50 }).map((_, i) => (
            <mesh key={i} position={[(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, -i * 2]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#00ffff" wireframe />
            </mesh>
          ))}
        </Canvas>
      </div>
    </main>
  );
}
