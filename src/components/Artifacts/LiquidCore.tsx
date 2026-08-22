"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function LiquidCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create a stunning twisting geometry
  const geometry = useMemo(() => new THREE.TorusKnotGeometry(4, 1.2, 256, 64, 3, 4), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Base rotation
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.15;
      
      // React to scroll velocity to spin faster
      const velocity = useStore.getState().scrollVelocity;
      meshRef.current.rotation.z += velocity * 0.005;
      
      // Mouse magnetic reactivity
      const targetX = (state.pointer.x * Math.PI) / 4;
      const targetY = (state.pointer.y * Math.PI) / 4;
      
      // Smoothly interpolate current rotation towards mouse target (parallax)
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, meshRef.current.rotation.y + targetX, 0.05);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, meshRef.current.rotation.x - targetY, 0.05);

      // Pulse scale slightly based on time
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Sleek, premium metallic rings orbiting the core */}
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
        <meshStandardMaterial color="#6eb5ff" metalness={1} roughness={0.3} />
      </mesh>

      <Float speed={2} rotationIntensity={1} floatIntensity={2} floatingRange={[-0.5, 0.5]}>
        <mesh ref={meshRef} geometry={geometry}>
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
    </group>
  );
}
