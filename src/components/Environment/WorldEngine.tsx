"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CyberMask } from "@/components/Artifacts/CyberMask";
import { ArchiveKeepers } from "@/components/Environment/ArchiveKeepers";

export function WorldEngine() {
  const numPillars = 80;
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate a massive structured Cathedral Nave
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < numPillars; i++) {
      // Two rows of massive pillars
      const side = i % 2 === 0 ? 1 : -1;
      const row = Math.floor(i / 2);
      
      const x = side * (12 + Math.random() * 4); // 12 units away from center
      const y = -15; // Grounded deep below
      const z = 10 - (row * 6); // Stretching deep into Z
      pos.push(new THREE.Vector3(x, y, z));
    }
    return pos;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (meshRef.current) {
      for (let i = 0; i < numPillars; i++) {
        const p = positions[i];
        dummy.position.copy(p);
        
        const side = i % 2 === 0 ? 1 : -1;
        
        // Bone-like breathing
        const breath = Math.sin(time * 0.5 + p.z * 0.1) * 0.5;
        
        // Massive rib-like structures stretching 40 units high
        dummy.scale.set(2 + breath*0.1, 40, 2 + breath*0.1);
        
        // Curve inwards at the top to form the cathedral arch
        dummy.rotation.z = side * 0.2; // Arching inwards
        
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        
        // Material Identity: Bone Ivory & Dark Graphite
        const color = new THREE.Color();
        color.set('#d1c7b7'); // Warmer aged ivory
        meshRef.current.setColorAt(i, color);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Immeasurable Scale Architecture */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, numPillars]}>
        <cylinderGeometry args={[1, 1.5, 1, 16]} />
        <meshPhysicalMaterial 
          roughness={0.7} 
          metalness={0.3} 
          clearcoat={0.2}
        />
      </instancedMesh>

      {/* Ambient Ecology */}
      <ArchiveKeepers />

      {/* The Hero Object placed in the center of the Cathedral Nave */}
      <group position={[0, 0, -10]}>
        <CyberMask />
      </group>
      
      {/* Heavy fog to hide the horizon and create infinite depth */}
      <fog attach="fog" args={['#050608', 5, 60]} />
    </group>
  );
}
