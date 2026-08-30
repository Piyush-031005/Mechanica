"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

const WING_SPAN = 60;
const SEGMENTS = 100;
const SCALE_COUNT = WING_SPAN * SEGMENTS;

export function CyberBird() {
  const isMutated = useStore((state) => state.isDismantled);
  const explosion = useStore((state) => state.explosion);
  const mutateProgress = useRef(0);
  
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const coreMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    mutateProgress.current = THREE.MathUtils.lerp(mutateProgress.current, isMutated ? 1 : 0, 0.1);
    const m = mutateProgress.current;

    if (groupRef.current) {
      // Gentle hovering of the entire creature, becomes erratic when mutated
      groupRef.current.position.y = Math.sin(time * 0.5) * 1.5 + (m * Math.sin(time * 10) * 0.2);
      groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
      groupRef.current.rotation.z = Math.cos(time * 0.2) * 0.05 + (m * Math.sin(time * 5) * 0.1);
      
      const s = THREE.MathUtils.lerp(1, 1.2, m);
      groupRef.current.scale.set(s, s, s);
    }

    if (meshRef.current) {
      let i = 0;
      for (let x = 0; x < WING_SPAN; x++) {
        for (let z = 0; z < SEGMENTS; z++) {
          const nx = (x / WING_SPAN) * 2 - 1; 
          const nz = z / SEGMENTS;
          
          // Manta Ray shape function, distorts when mutated
          const width = Math.exp(-4 * nz) * Math.sin(nz * Math.PI) * 15 * (1 + m * 0.5);
          const actualX = nx * width;
          
          // Flapping motion becomes violent when mutated
          const flapSpeed = 2 + m * 5;
          const flap = Math.sin(time * flapSpeed - Math.abs(nx) * 5) * nx * (2 + m * 2);
          const wave = Math.cos(time * 3 - nz * 10) * 0.5;
          
          const y = flap + wave;

          const scatterX = explosion > 0 ? (Math.random() - 0.5) * explosion * 50 : 0;
          const scatterY = explosion > 0 ? (Math.random() - 0.5) * explosion * 50 : 0;
          const scatterZ = explosion > 0 ? (Math.random() - 0.5) * explosion * 50 : 0;
          
          dummy.position.set(actualX + scatterX, y + scatterY, -nz * 20 + scatterZ);
          
          const sScale = Math.max(0.1, 1 - Math.abs(nx)) * (1 + explosion * 2);
          // Scales stretch out into sharp needles when mutated
          dummy.scale.set(sScale, sScale * (0.2 + m * 0.8), sScale * (1 + m * 2));
          
          dummy.rotation.z = Math.sin(time * flapSpeed - Math.abs(nx) * 5) * 0.5;
          dummy.rotation.x = Math.cos(time * 3 - nz * 10) * 0.2 + (explosion * Math.random() * 10);
          
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i++, dummy.matrix);
        }
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (coreRef.current) {
      coreRef.current.rotation.z = time * (2 + m * 5);
      coreRef.current.rotation.x = time * (1 + m * 2);
      const pulse = 1 + Math.sin(time * 10) * 0.1 + (explosion * 5) + (m * Math.sin(time * 20) * 0.2);
      coreRef.current.scale.set(pulse, pulse, pulse);
    }

    if (matRef.current) {
      matRef.current.color.lerpColors(
        new THREE.Color('#39ff14'), 
        new THREE.Color('#ff0033'), 
        mutateProgress.current
      );
    }
    if (coreMatRef.current) {
      coreMatRef.current.color.lerpColors(
        new THREE.Color('#ffffff'), 
        new THREE.Color('#000000'), 
        mutateProgress.current
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, SCALE_COUNT]}>
        <boxGeometry args={[0.4, 0.1, 0.8]} />
        <meshBasicMaterial ref={matRef} color="#39ff14" />
      </instancedMesh>
      
      {/* Power Core */}
      <mesh ref={coreRef} position={[0, 0, -2]}>
        <octahedronGeometry args={[1.5, 0]} />
        <meshBasicMaterial ref={coreMatRef} color="#ffffff" wireframe={true} />
      </mesh>
    </group>
  );
}
