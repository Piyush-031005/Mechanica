"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
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
  const spineRef = useRef<THREE.Group>(null);
  
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const spineMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    mutateProgress.current = THREE.MathUtils.lerp(mutateProgress.current, isMutated ? 1 : 0, 0.1);
    const m = mutateProgress.current;

    if (groupRef.current) {
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
          
          const width = Math.exp(-4 * nz) * Math.sin(nz * Math.PI) * 15 * (1 + m * 0.5);
          const actualX = nx * width;
          
          const flapSpeed = 2 + m * 5;
          const flap = Math.sin(time * flapSpeed - Math.abs(nx) * 5) * nx * (2 + m * 2);
          const wave = Math.cos(time * 3 - nz * 10) * 0.5;
          
          const y = flap + wave;

          const scatterX = explosion > 0 ? (Math.random() - 0.5) * explosion * 50 : 0;
          const scatterY = explosion > 0 ? (Math.random() - 0.5) * explosion * 50 : 0;
          const scatterZ = explosion > 0 ? (Math.random() - 0.5) * explosion * 50 : 0;
          
          dummy.position.set(actualX + scatterX, y + scatterY, -nz * 20 + scatterZ);
          
          const sScale = Math.max(0.1, 1 - Math.abs(nx)) * (1 + explosion * 2);
          dummy.scale.set(sScale, sScale * (0.2 + m * 0.8), sScale * (1 + m * 2));
          
          dummy.rotation.z = Math.sin(time * flapSpeed - Math.abs(nx) * 5) * 0.5;
          dummy.rotation.x = Math.cos(time * 3 - nz * 10) * 0.2 + (explosion * Math.random() * 10);
          
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i++, dummy.matrix);
        }
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (spineRef.current) {
      // Spine ripples organically
      spineRef.current.children.forEach((vertebra, idx) => {
        const offset = idx * 0.2;
        vertebra.position.y = Math.sin(time * (5 + m * 10) - offset) * (0.2 + m * 0.5);
        vertebra.scale.setScalar(1 + Math.sin(time * 10 - offset) * 0.2);
      });
    }

    if (matRef.current) {
      matRef.current.color.lerpColors(
        new THREE.Color('#39ff14'), 
        new THREE.Color('#ff0033'), 
        mutateProgress.current
      );
      matRef.current.opacity = THREE.MathUtils.lerp(0.2, 0.5, m); // Ghostly to Solid
    }
    if (spineMatRef.current) {
      spineMatRef.current.color.lerpColors(
        new THREE.Color('#ffffff'), 
        new THREE.Color('#050505'), 
        mutateProgress.current
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      {/* Ghostfreak Secondary Skin / Symbiote Wings */}
      <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, SCALE_COUNT]}>
        <boxGeometry args={[0.4, 0.1, 0.8]} />
        <meshBasicMaterial ref={matRef} color="#39ff14" transparent depthWrite={false} />
      </instancedMesh>
      
      {/* Central Spine Anatomy */}
      <group ref={spineRef}>
        {[...Array(15)].map((_, i) => (
          <mesh key={i} position={[0, 0, -i * 1.2]}>
            <octahedronGeometry args={[0.8 - i * 0.04, 0]} />
            <meshBasicMaterial ref={spineMatRef} color="#ffffff" wireframe />
          </mesh>
        ))}
      </group>

      {/* Floating Blueprint Annotations */}
      <Html position={[0, 2, -5]} center style={{ pointerEvents: 'none' }}>
        <div style={{ color: isMutated ? '#ff0033' : '#39ff14', fontFamily: 'monospace', fontSize: '10px', width: '200px', borderBottom: '1px solid currentColor', paddingBottom: '4px', textAlign: 'center' }}>
          {isMutated ? 'CORRUPTED SPINAL COLUMN' : 'AERO-DYNAMIC VERTEBRAE'}
        </div>
      </Html>
      <Html position={[-8, 0, -10]} center style={{ pointerEvents: 'none' }}>
        <div style={{ color: isMutated ? '#ff0033' : '#39ff14', fontFamily: 'monospace', fontSize: '10px', width: '150px', borderLeft: '1px solid currentColor', paddingLeft: '8px' }}>
          {isMutated ? 'SYMBIOTE WING MEMBRANE' : 'ECTOPLASMIC SECONDARY SKIN'}
        </div>
      </Html>
    </group>
  );
}
