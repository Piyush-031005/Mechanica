"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Flower() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  
  // Mathematical procedural generation of petals (Fibonacci spiral concept)
  const numPetals = 24;
  const petals = useMemo(() => {
    const arr = [];
    for (let i = 0; i < numPetals; i++) {
      const angle = (i / numPetals) * Math.PI * 2;
      const radius = 1.2;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      // Each petal is a custom shape but we'll use an elongated capsule/sphere for the MVP
      arr.push({ position: new THREE.Vector3(x, y, 0), rotation: angle });
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Slow mechanical rotation
      groupRef.current.rotation.z += delta * 0.1;
    }
    
    if (coreRef.current) {
      // Core pulsing engine effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      coreRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -10]}>
      
      {/* 
        The Core Engine (Heart of the flower)
        Wireframe sphere with a glowing inner solid
      */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.5, 2]} />
        <meshStandardMaterial color="#00ffff" wireframe transparent opacity={0.8} />
      </mesh>
      
      <mesh>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial color="#ffffff" emissive="#00ffff" emissiveIntensity={2} />
      </mesh>

      {/* The Mechanical Petals */}
      {petals.map((petal, i) => (
        <group key={i} position={petal.position} rotation={[0, 0, petal.rotation]}>
          {/* Main Petal Body */}
          <mesh>
            <capsuleGeometry args={[0.1, 1, 4, 8]} />
            <meshStandardMaterial 
              color="#021B30" 
              emissive="#005577"
              emissiveIntensity={0.2}
              wireframe 
            />
          </mesh>
          {/* Structural Blueprint Line */}
          <mesh position={[0, 0, 0.1]}>
            <capsuleGeometry args={[0.02, 1.1, 4, 4]} />
            <meshBasicMaterial color="#00ffff" />
          </mesh>
        </group>
      ))}

      {/* Sacred Geometry Overlays (Circles and Lines) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.01, 16, 64]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.01, 16, 64]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}
