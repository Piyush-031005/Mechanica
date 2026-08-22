"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function TheEngine() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create engine parts
  const coreGeo = useMemo(() => new THREE.CylinderGeometry(2, 2, 8, 32), []);
  const ringGeo = useMemo(() => new THREE.TorusGeometry(3.5, 0.4, 16, 64), []);
  
  // Premium materials
  const darkMetal = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#111111", 
    metalness: 0.9, 
    roughness: 0.2 
  }), []);
  
  const neonCore = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: "#ff5500" 
  }), []);

  const rings = Array.from({ length: 5 }).map((_, i) => ({
    y: (i - 2) * 1.5,
    speed: (i % 2 === 0 ? 1 : -1) * (0.5 + Math.random()),
    ref: useRef<THREE.Mesh>(null)
  }));

  useFrame((state, delta) => {
    const depth = useStore.getState().scrollDepth;
    
    if (groupRef.current) {
      // The Engine is active between 25% and 50% scroll
      // It fades in from 25% to 35%
      let targetScale = 0;
      let targetZ = 50; // Starts far back
      
      if (depth > 0.25 && depth < 0.55) {
        // Entrance animation
        const enterProgress = Math.min(1, Math.max(0, (depth - 0.25) * 10)); // 0 to 1 between 25% and 35%
        
        // Exit animation
        const exitProgress = Math.max(0, Math.min(1, (depth - 0.45) * 10)); // 0 to 1 between 45% and 55%
        
        const activeScale = 1 - exitProgress;
        targetScale = enterProgress * activeScale;
        
        // Exploded view logic: as you scroll deeper, the engine pulls apart
        const explodeFactor = Math.max(0, (depth - 0.35) * 5); // 0 to 1 between 35% and 55%
        
        // Orbit rotation
        groupRef.current.rotation.y += delta * 0.1;
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

        rings.forEach((ring, i) => {
          if (ring.ref.current) {
            ring.ref.current.rotation.x += delta * ring.speed;
            ring.ref.current.position.y = THREE.MathUtils.lerp(
              ring.y,
              ring.y * (1 + explodeFactor * 2),
              0.1
            );
          }
        });
        
        targetZ = THREE.MathUtils.lerp(-50, 0, enterProgress) - (exitProgress * 50);
      }
      
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 50]} scale={0}>
      {/* Central glowing core */}
      <mesh geometry={coreGeo} material={neonCore} />
      
      {/* Dark metal outer casing */}
      <mesh geometry={coreGeo} material={darkMetal}>
        <meshStandardMaterial attach="material" color="#111111" metalness={0.9} roughness={0.2} wireframe />
      </mesh>

      {/* Rotating mechanical rings */}
      {rings.map((ring, i) => (
        <mesh key={i} ref={ring.ref} position={[0, ring.y, 0]} geometry={ringGeo} material={darkMetal} />
      ))}
    </group>
  );
}
