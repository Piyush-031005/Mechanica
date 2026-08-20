"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export function ArchiveHall() {
  const pillarsRef = useRef<THREE.InstancedMesh>(null);
  
  const numPillars = 40;
  
  // Calculate pillar positions
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  useFrame(() => {
    if (pillarsRef.current) {
      for (let i = 0; i < numPillars; i++) {
        // We want two rows of pillars (left and right)
        const isLeft = i % 2 === 0;
        const rowPairIndex = Math.floor(i / 2); // 0 to 19
        
        const x = isLeft ? -15 : 15;
        const z = -5 - (rowPairIndex * 6); // Space them out along Z axis
        const y = 0;
        
        dummy.position.set(x, y, z);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        
        pillarsRef.current.setMatrixAt(i, dummy.matrix);
      }
      pillarsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Archway Rings */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[0, 0, -10 - (i * 12)]} rotation={[0, 0, 0]}>
          <torusGeometry args={[18, 0.2, 16, 100, Math.PI]} />
          <meshStandardMaterial 
            color="#D4AF37" // Brass archways
            metalness={0.9} 
            roughness={0.4} 
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}

      {/* Massive Pillars using Instanced Mesh for performance */}
      <instancedMesh ref={pillarsRef} args={[undefined, undefined, numPillars]} castShadow receiveShadow>
        <boxGeometry args={[2, 30, 2]} />
        <meshStandardMaterial 
          color="#050b14" 
          metalness={0.8} 
          roughness={0.2} 
          wireframe={false} 
        />
      </instancedMesh>
      
      {/* Procedural Floor/Ceiling Cables */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[(i - 2) * 5, -5, -50]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 100, 8]} />
          <meshStandardMaterial color="#B87333" metalness={0.7} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
