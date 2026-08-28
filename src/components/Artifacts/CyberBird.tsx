"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, Edges } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

const WING_SPAN = 60;
const SEGMENTS = 100;
const SCALE_COUNT = WING_SPAN * SEGMENTS;

function MantaPart({ isBlueprint, clippingPlanes }: { isBlueprint: boolean, clippingPlanes: THREE.Plane[] }) {
  const scroll = useScroll();
  const explosion = useStore((state) => state.explosion);
  
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const offset = scroll.offset; 
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Enter animation around offset 0.2 (Start of page 4-5)
      const localOffset = Math.max(0, (offset - 0.2) * 4);
      const scale = THREE.MathUtils.lerp(0.001, 1, Math.min(1, localOffset)); 
      groupRef.current.scale.set(scale, scale, scale);
      groupRef.current.visible = offset > 0.15 && offset < 0.55;
      
      // Gentle hovering of the entire creature
      groupRef.current.position.y = Math.sin(time * 0.5) * 1.5 - 1;
      groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
      groupRef.current.rotation.z = Math.cos(time * 0.2) * 0.05;
    }

    if (meshRef.current) {
      let i = 0;
      for (let x = 0; x < WING_SPAN; x++) {
        for (let z = 0; z < SEGMENTS; z++) {
          const nx = (x / WING_SPAN) * 2 - 1; // -1 to 1
          const nz = z / SEGMENTS; // 0 to 1
          
          // Manta Ray shape function
          const width = Math.exp(-4 * nz) * Math.sin(nz * Math.PI) * 15;
          const actualX = nx * width;
          
          // Flapping motion
          const flap = Math.sin(time * 2 - Math.abs(nx) * 5) * nx * 2;
          const wave = Math.cos(time * 3 - nz * 10) * 0.5;
          
          const y = flap + wave;

          // Explosion mechanics
          const scatterX = explosion > 0 ? (Math.random() - 0.5) * explosion * 50 : 0;
          const scatterY = explosion > 0 ? (Math.random() - 0.5) * explosion * 50 : 0;
          const scatterZ = explosion > 0 ? (Math.random() - 0.5) * explosion * 50 : 0;
          
          dummy.position.set(actualX + scatterX, y + scatterY, -nz * 20 + scatterZ);
          
          // Scale based on position (edges are smaller)
          const s = Math.max(0.1, 1 - Math.abs(nx)) * (1 + explosion * 2);
          dummy.scale.set(s, s * 0.2, s);
          
          // Rotation aligns with the wave
          dummy.rotation.z = Math.sin(time * 2 - Math.abs(nx) * 5) * 0.5;
          dummy.rotation.x = Math.cos(time * 3 - nz * 10) * 0.2 + (explosion * Math.random() * 10);
          
          dummy.updateMatrix();
          meshRef.current.setMatrixAt(i++, dummy.matrix);
        }
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (coreRef.current) {
      coreRef.current.rotation.z = time * 2;
      coreRef.current.rotation.x = time;
      const pulse = 1 + Math.sin(time * 10) * 0.1 + (explosion * 5);
      coreRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const solidMat = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: '#00ccff', 
    metalness: 0.9, 
    roughness: 0.1,
    clearcoat: 1,
    clippingPlanes 
  }), [clippingPlanes]);
  
  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#ff00aa', 
    wireframe: true, 
    transparent: true, 
    opacity: 0.3,
    clippingPlanes 
  }), [clippingPlanes]);

  const coreMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: '#00ccff',
    emissiveIntensity: 5,
    clippingPlanes
  }), [clippingPlanes]);

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, SCALE_COUNT]}>
        <boxGeometry args={[0.4, 0.1, 0.8]} />
        <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
      </instancedMesh>
      
      {/* Power Core */}
      <mesh ref={coreRef} position={[0, 0, -2]}>
        <octahedronGeometry args={[1.5, 0]} />
        <primitive object={coreMat} attach="material" />
        {isBlueprint && <Edges scale={1.1} color="#ffffff" />}
      </mesh>
    </group>
  );
}

export function CyberBird() {
  const { viewport } = useThree();
  const planeBlueprint = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);
  const planeMachine = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  
  useFrame((state) => {
    const mouseX = (state.pointer.x * viewport.width) / 2;
    planeBlueprint.constant = mouseX;
    planeMachine.constant = -mouseX;
  });

  return (
    <group position={[0, 2, -10]}>
      <MantaPart isBlueprint={true} clippingPlanes={[planeBlueprint]} />
      <MantaPart isBlueprint={false} clippingPlanes={[planeMachine]} />
    </group>
  );
}
