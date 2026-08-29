"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

const HELIX_COUNT = 150;
const TOTEM_COUNT = 20;

function HelixPart({ isBlueprint, clippingPlanes }: { isBlueprint: boolean, clippingPlanes: THREE.Plane[] }) {
  const scroll = useScroll();
  const explosion = useStore((state) => state.explosion);
  
  const groupRef = useRef<THREE.Group>(null);
  const helixRef = useRef<THREE.InstancedMesh>(null);
  const coreRef = useRef<THREE.InstancedMesh>(null);
  const totemRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const helixData = useMemo(() => {
    const data = [];
    for (let i = 0; i < HELIX_COUNT; i++) {
      const t = i / HELIX_COUNT;
      data.push({
        y: (t - 0.5) * 40,
        angle: t * Math.PI * 10,
        radius: 2 + Math.sin(t * Math.PI * 4) * 0.5,
      });
    }
    return data;
  }, []);

  const totemData = useMemo(() => {
    const data = [];
    for (let i = 0; i < TOTEM_COUNT; i++) {
      data.push({
        y: (Math.random() - 0.5) * 40,
        size: 3 + Math.random() * 4,
        speed: (Math.random() - 0.5) * 5,
        wobble: Math.random() * 0.5
      });
    }
    return data;
  }, []);

  useFrame((state) => {
    const offset = scroll.offset; 
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      const localOffset = Math.max(0, Math.min(1, (offset - 0.45) * 4));
      
      groupRef.current.rotation.y = time * 0.2 + localOffset * Math.PI;
      groupRef.current.position.y = THREE.MathUtils.lerp(-20, 0, localOffset);
      
      groupRef.current.visible = offset > 0.4 && offset < 0.8;
    }

    const scatterMult = explosion * 10;

    if (helixRef.current) {
      helixData.forEach((h, i) => {
        const x = Math.cos(h.angle + time) * h.radius;
        const z = Math.sin(h.angle + time) * h.radius;
        
        const scatterX = explosion > 0 ? (Math.random() - 0.5) * scatterMult : 0;
        const scatterY = explosion > 0 ? (Math.random() - 0.5) * scatterMult : 0;
        const scatterZ = explosion > 0 ? (Math.random() - 0.5) * scatterMult : 0;

        dummy.position.set(x + scatterX, h.y + scatterY, z + scatterZ);
        dummy.rotation.set(time, h.angle, 0);
        
        const s = 1 + explosion;
        dummy.scale.set(s, s * 0.2, s);
        dummy.updateMatrix();
        helixRef.current!.setMatrixAt(i, dummy.matrix);
      });
      helixRef.current.instanceMatrix.needsUpdate = true;
    }

    if (coreRef.current) {
      helixData.forEach((h, i) => {
        dummy.position.set(0, h.y, 0);
        dummy.rotation.set(0, time * 2, 0);
        
        const s = (0.5 + Math.sin(h.y + time * 5) * 0.2) * (1 + explosion * 3);
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        coreRef.current!.setMatrixAt(i, dummy.matrix);
      });
      coreRef.current.instanceMatrix.needsUpdate = true;
    }

    if (totemRef.current) {
      totemData.forEach((t, i) => {
        const scatterX = explosion > 0 ? (Math.random() - 0.5) * scatterMult * 2 : 0;
        const scatterY = explosion > 0 ? (Math.random() - 0.5) * scatterMult * 2 : 0;
        const scatterZ = explosion > 0 ? (Math.random() - 0.5) * scatterMult * 2 : 0;

        dummy.position.set(scatterX, t.y + scatterY, scatterZ);
        
        // Chaotic wobbling rotation like the graffiti image
        dummy.rotation.set(
          Math.sin(time * t.speed) * t.wobble, 
          time * t.speed, 
          Math.cos(time * t.speed) * t.wobble
        );
        
        const s = t.size * (1 + explosion);
        dummy.scale.set(s, 0.5, s);
        dummy.updateMatrix();
        totemRef.current!.setMatrixAt(i, dummy.matrix);
      });
      totemRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const material = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ff00aa', wireframe: true, transparent: true, opacity: 0.5, clippingPlanes });
    return new THREE.MeshStandardMaterial({ color: '#111111', metalness: 0.9, roughness: 0.2, clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  const coreMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true, clippingPlanes });
    return new THREE.MeshStandardMaterial({ color: '#ff0000', emissive: '#ff0000', emissiveIntensity: 2, clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  const totemMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#00ffff', wireframe: true, transparent: true, opacity: 0.8, clippingPlanes });
    return new THREE.MeshStandardMaterial({ color: '#222222', metalness: 1, roughness: 0.5, flatShading: true, clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  return (
    <group ref={groupRef}>
      <instancedMesh ref={helixRef} args={[undefined as any, undefined as any, HELIX_COUNT]}>
        <boxGeometry args={[2, 1, 0.5]} />
        <primitive object={material} attach="material" />
      </instancedMesh>
      
      <instancedMesh ref={coreRef} args={[undefined as any, undefined as any, HELIX_COUNT]}>
        <octahedronGeometry args={[1, 0]} />
        <primitive object={coreMat} attach="material" />
      </instancedMesh>

      {/* Chaotic Totem Gears */}
      <instancedMesh ref={totemRef} args={[undefined as any, undefined as any, TOTEM_COUNT]}>
        <torusGeometry args={[1, 0.2, 8, 7]} />
        <primitive object={totemMat} attach="material" />
      </instancedMesh>
    </group>
  );
}

export function TheSpine() {
  const laserRef = useRef<THREE.Mesh>(null);
  
  // MRI Sweeping Scanner Planes
  const planeBlueprint = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  const planeMachine = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  
  useFrame((state) => {
    // MRI scanner sweeping up and down over time
    const yPos = Math.sin(state.clock.elapsedTime * 0.8) * 15; // Taller sweep for the helix
    planeBlueprint.constant = yPos;
    planeMachine.constant = -yPos;
    
    if (laserRef.current) {
      laserRef.current.position.y = yPos;
    }
  });

  return (
    <group position={[0, 0, -10]}>
      <HelixPart isBlueprint={true} clippingPlanes={[planeBlueprint]} />
      <HelixPart isBlueprint={false} clippingPlanes={[planeMachine]} />
      
      <mesh ref={laserRef} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial color="#ff00aa" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
        <meshBasicMaterial color="#ff00aa" wireframe transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
