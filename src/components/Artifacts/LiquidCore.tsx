"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function LiquidCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create a stunning twisting geometry
  const geometry = useMemo(() => new THREE.TorusKnotGeometry(4, 1.2, 256, 64, 3, 4), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotate constantly
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.15;
      
      // React to scroll velocity to spin faster
      const velocity = useStore.getState().scrollVelocity;
      meshRef.current.rotation.z += velocity * 0.005;
      
      // Pulse scale slightly based on time
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2} floatingRange={[-0.5, 0.5]}>
      <mesh ref={meshRef} geometry={geometry}>
        {/* Awwwards-winning Glass/Liquid material */}
        <MeshTransmissionMaterial
          backside
          samples={16}
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
          clearcoatRoughness={0.1}
          roughness={0.05}
          transmission={1}
          ior={1.5}
        />
      </mesh>
    </Float>
  );
}
