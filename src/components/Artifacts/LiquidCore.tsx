"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function LiquidCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // The original "great work" geometry
  const geometry = useMemo(() => new THREE.TorusKnotGeometry(4, 1.2, 256, 64, 3, 4), []);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (meshRef.current && ringsRef.current) {
      // Base rotation
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.15;
      
      // Mouse magnetic reactivity
      const targetX = (state.pointer.x * Math.PI) / 4;
      const targetY = (state.pointer.y * Math.PI) / 4;
      
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, meshRef.current.rotation.y + targetX, 0.05);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, meshRef.current.rotation.x - targetY, 0.05);

      // Gentle pulse scale based on time
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group>
      {/* Restored: The Orbiting Metallic Rings */}
      <group ref={ringsRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[6, 0.02, 16, 100]} />
          <meshStandardMaterial color="#ffaa55" metalness={1} roughness={0.2} />
        </mesh>
        <mesh rotation={[0, Math.PI / 3, 0]}>
          <torusGeometry args={[7, 0.015, 16, 100]} />
          <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} />
        </mesh>
        <mesh rotation={[0, -Math.PI / 4, Math.PI / 6]}>
          <torusGeometry args={[8, 0.03, 16, 100]} />
          <meshStandardMaterial color="#00f0ff" metalness={1} roughness={0.3} />
        </mesh>
      </group>

      <Float speed={2} rotationIntensity={1} floatIntensity={2} floatingRange={[-0.5, 0.5]}>
        <mesh ref={meshRef} geometry={geometry}>
          <MeshTransmissionMaterial
            backside
            samples={4} // Optimized to prevent precision warnings
            resolution={128}
            thickness={2.5}
            chromaticAberration={0.8}
            anisotropy={0.3}
            distortion={0.5}
            distortionScale={0.5}
            temporalDistortion={0.2}
            color="#ffffff"
            attenuationDistance={10}
            attenuationColor="#ffffff"
            clearcoat={1}
            roughness={0.05}
            transmission={1}
            ior={1.5}
          />
        </mesh>
      </Float>
    </group>
  );
}
