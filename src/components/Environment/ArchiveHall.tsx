"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";

export function ArchiveHall() {
  const pillarsRef = useRef<THREE.InstancedMesh>(null);
  
  const numPillars = 40;
  
  // Calculate pillar positions
  const tempObj = useMemo(() => new THREE.Object3D(), []);
  
  useFrame(() => {
    if (pillarsRef.current) {
      let index = 0;
      for (let i = 0; i < numPillars; i++) {
        // Form a circular vertical shaft
        const angle = (i / numPillars) * Math.PI * 2;
        const radius = 10 + Math.random() * 5; // Distance from center of shaft
        
        // Arrange pillars along the Y-axis going down
        const x = Math.cos(angle) * radius;
        const z = -45 + Math.sin(angle) * radius; // Center of shaft is at Z = -45
        const y = -i * 2; // Drop down 2 units per pillar
        
        tempObj.position.set(x, y, z);
        tempObj.rotation.set(0, angle, 0); // Face the center
        tempObj.updateMatrix();
        
        pillarsRef.current.setMatrixAt(index++, tempObj.matrix);
      }
      pillarsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Archway Rings going down */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[0, -i * 5, -45]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[12, 0.5, 16, 64]} />
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={0.1} 
            roughness={0.9} 
          />
          <Edges color="black" />
        </mesh>
      ))}

      {/* Massive Pillars using Instanced Mesh for performance */}
      <instancedMesh ref={pillarsRef} args={[undefined, undefined, numPillars]} castShadow receiveShadow>
        <boxGeometry args={[2, 30, 2]} />
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={0.1} 
          roughness={0.9} 
          wireframe={false} 
        />
        <Edges color="black" />
      </instancedMesh>
    </group>
  );
}
