"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll, Edges } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

const HELIX_HEIGHT = 40;
const STRAND_COUNT = 300;
const RUNG_COUNT = 150;

function HelixPart({ isBlueprint, clippingPlanes }: { isBlueprint: boolean, clippingPlanes: THREE.Plane[] }) {
  const scroll = useScroll();
  const explosion = useStore((state) => state.explosion);
  
  const groupRef = useRef<THREE.Group>(null);
  const strand1Ref = useRef<THREE.InstancedMesh>(null);
  const strand2Ref = useRef<THREE.InstancedMesh>(null);
  const rungsRef = useRef<THREE.InstancedMesh>(null);
  const plasmaRef = useRef<THREE.Mesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const offset = scroll.offset; 
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Enter animation around offset 0.45 (Pages 8-9)
      const localOffset = Math.max(0, (offset - 0.45) * 4);
      const scale = THREE.MathUtils.lerp(0.001, 1, Math.min(1, localOffset)); 
      groupRef.current.scale.set(scale, scale, scale);
      groupRef.current.visible = offset > 0.4 && offset < 0.8;
      
      // Infinite vertical scrolling effect
      groupRef.current.position.y = (time * 2) % (HELIX_HEIGHT / 4) - 5;
      groupRef.current.rotation.y = time * 0.2;
    }

    const radius = 3;
    const frequency = 0.5;

    // Strand 1
    if (strand1Ref.current) {
      for (let i = 0; i < STRAND_COUNT; i++) {
        const y = (i / STRAND_COUNT) * HELIX_HEIGHT - (HELIX_HEIGHT / 2);
        const angle = y * frequency + time;
        
        const scatterX = explosion > 0 ? (Math.random() - 0.5) * explosion * 20 : 0;
        const scatterY = explosion > 0 ? (Math.random() - 0.5) * explosion * 20 : 0;
        const scatterZ = explosion > 0 ? (Math.random() - 0.5) * explosion * 20 : 0;
        
        dummy.position.set(
          Math.cos(angle) * radius + scatterX,
          y + scatterY,
          Math.sin(angle) * radius + scatterZ
        );
        
        dummy.rotation.set(
          explosion * Math.random() * 10,
          -angle + (explosion * Math.random() * 10),
          explosion * Math.random() * 10
        );
        
        const s = 1 + explosion * 2;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        strand1Ref.current.setMatrixAt(i, dummy.matrix);
      }
      strand1Ref.current.instanceMatrix.needsUpdate = true;
    }

    // Strand 2
    if (strand2Ref.current) {
      for (let i = 0; i < STRAND_COUNT; i++) {
        const y = (i / STRAND_COUNT) * HELIX_HEIGHT - (HELIX_HEIGHT / 2);
        const angle = y * frequency + Math.PI + time;
        
        const scatterX = explosion > 0 ? (Math.random() - 0.5) * explosion * 20 : 0;
        const scatterY = explosion > 0 ? (Math.random() - 0.5) * explosion * 20 : 0;
        const scatterZ = explosion > 0 ? (Math.random() - 0.5) * explosion * 20 : 0;

        dummy.position.set(
          Math.cos(angle) * radius + scatterX,
          y + scatterY,
          Math.sin(angle) * radius + scatterZ
        );
        
        dummy.rotation.set(
          explosion * Math.random() * 10,
          -angle + (explosion * Math.random() * 10),
          explosion * Math.random() * 10
        );

        const s = 1 + explosion * 2;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        strand2Ref.current.setMatrixAt(i, dummy.matrix);
      }
      strand2Ref.current.instanceMatrix.needsUpdate = true;
    }

    // Rungs (Connecting bridges)
    if (rungsRef.current) {
      for (let i = 0; i < RUNG_COUNT; i++) {
        const y = (i / RUNG_COUNT) * HELIX_HEIGHT - (HELIX_HEIGHT / 2);
        const angle = y * frequency + time;
        
        const scatterX = explosion > 0 ? (Math.random() - 0.5) * explosion * 30 : 0;
        const scatterY = explosion > 0 ? (Math.random() - 0.5) * explosion * 30 : 0;
        const scatterZ = explosion > 0 ? (Math.random() - 0.5) * explosion * 30 : 0;

        dummy.position.set(scatterX, y + scatterY, scatterZ);
        dummy.rotation.set(0, -angle + (explosion * Math.random() * 5), explosion * Math.random() * 5);
        
        const scaleX = radius * 2 + explosion * 5;
        dummy.scale.set(scaleX, 1, 1);
        dummy.updateMatrix();
        rungsRef.current.setMatrixAt(i, dummy.matrix);
      }
      rungsRef.current.instanceMatrix.needsUpdate = true;
    }

    if (plasmaRef.current) {
      plasmaRef.current.rotation.y = -time * 0.5;
      const pulse = 1 + Math.sin(time * 5) * 0.1 + (explosion * 5);
      plasmaRef.current.scale.set(pulse, 1, pulse);
    }
  });

  const solidMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#1a1a1a', 
    metalness: 0.9, 
    roughness: 0.4,
    clippingPlanes 
  }), [clippingPlanes]);
  
  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#00ccff', 
    wireframe: true, 
    transparent: true, 
    opacity: 0.5,
    clippingPlanes 
  }), [clippingPlanes]);

  const plasmaMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: '#ff00aa',
    emissiveIntensity: 4,
    transparent: true,
    opacity: 0.8,
    clippingPlanes
  }), [clippingPlanes]);

  return (
    <group ref={groupRef}>
      {/* Outer Strands */}
      <instancedMesh ref={strand1Ref} args={[undefined as any, undefined as any, STRAND_COUNT]}>
        <boxGeometry args={[1, 0.2, 1]} />
        <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
      </instancedMesh>
      <instancedMesh ref={strand2Ref} args={[undefined as any, undefined as any, STRAND_COUNT]}>
        <boxGeometry args={[1, 0.2, 1]} />
        <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
      </instancedMesh>
      
      {/* Inner Rungs */}
      <instancedMesh ref={rungsRef} args={[undefined as any, undefined as any, RUNG_COUNT]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
      </instancedMesh>

      {/* Inner Plasma Core */}
      <mesh ref={plasmaRef}>
        <cylinderGeometry args={[0.5, 0.5, HELIX_HEIGHT, 16]} />
        <primitive object={plasmaMat} attach="material" />
        {isBlueprint && <Edges scale={1.05} color="#ffffff" />}
      </mesh>
    </group>
  );
}

export function TheSpine() {
  const { viewport } = useThree();
  const planeBlueprint = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);
  const planeMachine = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  
  useFrame((state) => {
    const mouseX = (state.pointer.x * viewport.width) / 2;
    planeBlueprint.constant = mouseX;
    planeMachine.constant = -mouseX;
  });

  return (
    <group position={[0, 0, -10]}>
      <HelixPart isBlueprint={true} clippingPlanes={[planeBlueprint]} />
      <HelixPart isBlueprint={false} clippingPlanes={[planeMachine]} />
    </group>
  );
}
