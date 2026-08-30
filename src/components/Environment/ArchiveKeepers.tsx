"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Ambient Ecology: Tiny, never explained, always alive.
export function ArchiveKeepers() {
  const count = 300;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 80;
      const speed = 0.5 + Math.random() * 2;
      const offset = Math.random() * Math.PI * 2;
      temp.push({ position: new THREE.Vector3(x, y, z), speed, offset });
    }
    return temp;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (meshRef.current) {
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        
        // Biological darting motion
        const dart = Math.sin(time * p.speed + p.offset);
        const yOffset = Math.cos(time * p.speed * 0.5 + p.offset) * 0.2;
        
        dummy.position.set(
          p.position.x + dart * 0.5,
          p.position.y + yOffset,
          p.position.z + dart * 0.2
        );
        
        // They face the direction they move
        dummy.rotation.x = time * p.speed;
        dummy.rotation.y = time * p.speed;
        
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Tiny sharp shards resembling organic insects or drones */}
      <tetrahedronGeometry args={[0.05, 0]} />
      <meshBasicMaterial color="#f5f5dc" opacity={0.4} transparent depthWrite={false} />
    </instancedMesh>
  );
}
