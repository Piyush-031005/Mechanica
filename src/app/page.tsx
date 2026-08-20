"use client";

import { Canvas } from "@react-three/fiber";

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#020914"]} />
        <ambientLight intensity={0.5} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#00ffff" wireframe />
        </mesh>
      </Canvas>
    </main>
  );
}
