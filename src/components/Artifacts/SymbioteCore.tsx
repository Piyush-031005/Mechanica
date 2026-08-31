"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, MeshTransmissionMaterial, Sparkles, Float } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function SymbioteCore() {
  const infectionLevel = useStore((state) => state.infectionLevel);
  const coreRef = useRef<THREE.Mesh>(null);
  const fluidRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const mouse = useRef(new THREE.Vector2(0, 0));

  // Handle mouse movement for interactive fluid physics
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Smooth mouse tracking
    mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, (state.pointer.x * Math.PI) / 4, 0.1);
    mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, (state.pointer.y * Math.PI) / 4, 0.1);

    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.2 + mouse.current.x;
      coreRef.current.rotation.x = mouse.current.y;
    }
    
    if (fluidRef.current) {
      fluidRef.current.rotation.y = -time * 0.15;
      fluidRef.current.rotation.z = time * 0.1;
    }

    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 0.5) * 0.2 + mouse.current.y;
      ringRef.current.rotation.y = time * 0.1 + mouse.current.x;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      
      {/* 1. The Liquid Metal Outer Shell (Symbiote) */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={fluidRef} scale={2.5}>
          <icosahedronGeometry args={[1, 128]} />
          {/* Extremely premium distorted liquid metal */}
          <MeshDistortMaterial 
            color="#111111" 
            envMapIntensity={2} 
            clearcoat={1} 
            clearcoatRoughness={0.1} 
            metalness={1} 
            roughness={0.1}
            distort={0.4 + infectionLevel * 0.3} // Distorts more on infection
            speed={3} 
          />
        </mesh>
      </Float>

      {/* 2. The Translucent Inner Crystal (Biological Core) */}
      <Float speed={3} rotationIntensity={1} floatIntensity={1.5}>
        <mesh ref={coreRef} scale={1.8}>
          <octahedronGeometry args={[1, 0]} />
          {/* Glass-like transmission material refracting the inner light */}
          <MeshTransmissionMaterial 
            backside
            samples={16}
            thickness={2}
            chromaticAberration={1}
            anisotropy={0.5}
            distortion={0.5}
            distortionScale={0.5}
            temporalDistortion={0.1}
            color="#00ffff"
            envMapIntensity={2}
          />
        </mesh>
      </Float>

      {/* 3. The Containment Ring (Engineered Tech) */}
      <mesh ref={ringRef} scale={3.5}>
        <torusGeometry args={[1, 0.02, 16, 100]} />
        <meshPhysicalMaterial color="#ffffff" emissive="#00ffff" emissiveIntensity={2} />
      </mesh>

      {/* 4. Ambient Energy Spores (The Infection particles) */}
      <Sparkles 
        count={500} 
        scale={10} 
        size={2} 
        speed={0.4} 
        opacity={0.3} 
        color="#00ffff" 
      />

    </group>
  );
}
