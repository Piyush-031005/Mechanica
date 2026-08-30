"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CyberMask } from "@/components/Artifacts/CyberMask";
import { ArchiveKeepers } from "@/components/Environment/ArchiveKeepers";

export function WorldEngine() {
  const numPillars = 150;
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate a sprawling "Biological Archive" Cathedral architecture
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < numPillars; i++) {
      // Create a massive hallway / cavern
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 100 - 20; // Stretching deep into Z
      pos.push(new THREE.Vector3(x, y, z));
    }
    return pos;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // The Cathedral Breathes (Biological Architecture)
    if (meshRef.current) {
      for (let i = 0; i < numPillars; i++) {
        const p = positions[i];
        dummy.position.copy(p);
        
        // Bone-like stretching and breathing
        const breath = Math.sin(time * 0.5 + p.z * 0.1) * 0.5;
        dummy.position.y += breath * 0.05;
        
        // Elongated rib-like structures
        dummy.scale.set(1 + breath*0.2, 10 + Math.sin(p.x)*5, 1 + breath*0.2);
        
        // They curve inwards slightly to form a cathedral arch
        dummy.rotation.z = p.x * -0.02;
        
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        
        // Material Identity: Bone Ivory & Dark Graphite
        const color = new THREE.Color();
        if (Math.abs(p.x) < 10) {
           color.set('#f5f5dc'); // Bone ivory near center
        } else {
           color.set('#1a1a1a'); // Dark graphite walls
        }
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
        <cylinderGeometry args={[0.5, 0.8, 1, 16]} />
        <meshPhysicalMaterial 
          roughness={0.9} 
          metalness={0.1} 
          clearcoat={0.1}
        />
      </instancedMesh>

      {/* Ambient Ecology */}
      <ArchiveKeepers />

      {/* The Hero Object is now part of the world, not floating in a void */}
      {/* We place the DNA Helix deep inside the cathedral */}
      <group position={[0, 0, -15]}>
        <CyberMask />
      </group>
      
      {/* Fog creates immeasurable scale */}
      <fog attach="fog" args={['#050505', 10, 80]} />
    </group>
  );
}
