"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, Edges } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

const WIRE_COUNT = 150;
const GEAR_COUNT = 50;

function ScannerPart({ isBlueprint, clippingPlanes }: { isBlueprint: boolean, clippingPlanes: THREE.Plane[] }) {
  const scroll = useScroll();
  const explosion = useStore((state) => state.explosion);
  
  const groupRef = useRef<THREE.Group>(null);
  const outerHullRef = useRef<THREE.Mesh>(null);
  const wiresRef = useRef<THREE.InstancedMesh>(null);
  const gearsRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Precompute complex internal wiring
  const wireData = useMemo(() => {
    const data = [];
    for (let i = 0; i < WIRE_COUNT; i++) {
      data.push({
        radius: Math.random() * 2.5,
        height: (Math.random() - 0.5) * 6,
        angle: Math.random() * Math.PI * 2,
        tubeRadius: 0.02 + Math.random() * 0.03
      });
    }
    return data;
  }, []);

  // Precompute internal gears
  const gearData = useMemo(() => {
    const data = [];
    for (let i = 0; i < GEAR_COUNT; i++) {
      data.push({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 4,
        size: 0.2 + Math.random() * 0.8,
        speed: (Math.random() - 0.5) * 5,
        axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize()
      });
    }
    return data;
  }, []);

  useFrame((state) => {
    const offset = scroll.offset; 
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // 0 to 0.25 maps to local 0 to 1 for explosion
      const localOffset = Math.min(1, offset * 4);
      
      groupRef.current.rotation.y = time * 0.1 + localOffset * Math.PI * 4;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(0, Math.PI / 4, localOffset);

      if (offset > 0.25) {
        const flyby = (offset - 0.25) * 4; 
        const scale = THREE.MathUtils.lerp(1, 15, flyby);
        groupRef.current.scale.set(scale, scale, scale);
        groupRef.current.position.z = THREE.MathUtils.lerp(0, 10, flyby);
        groupRef.current.visible = flyby < 0.8;
      } else {
        groupRef.current.scale.set(1, 1, 1);
        groupRef.current.position.z = 0;
        groupRef.current.visible = true;
      }
    }
    
    // Wires Simulation
    if (wiresRef.current) {
      wireData.forEach((w, i) => {
        const scatterX = explosion > 0 ? (Math.random() - 0.5) * explosion * 10 : 0;
        const scatterY = explosion > 0 ? (Math.random() - 0.5) * explosion * 10 : 0;
        const scatterZ = explosion > 0 ? (Math.random() - 0.5) * explosion * 10 : 0;
        
        dummy.position.set(
          Math.cos(w.angle + time * 0.5) * w.radius + scatterX,
          w.height + scatterY,
          Math.sin(w.angle + time * 0.5) * w.radius + scatterZ
        );
        dummy.rotation.set(0, -w.angle, Math.PI / 2);
        
        const s = 1 + explosion;
        dummy.scale.set(w.tubeRadius * s, w.radius * Math.PI * s, w.tubeRadius * s);
        dummy.updateMatrix();
        wiresRef.current!.setMatrixAt(i, dummy.matrix);
      });
      wiresRef.current.instanceMatrix.needsUpdate = true;
    }

    // Gears Simulation
    if (gearsRef.current) {
      gearData.forEach((g, i) => {
        const scatterX = explosion > 0 ? (Math.random() - 0.5) * explosion * 20 : 0;
        const scatterY = explosion > 0 ? (Math.random() - 0.5) * explosion * 20 : 0;
        const scatterZ = explosion > 0 ? (Math.random() - 0.5) * explosion * 20 : 0;
        
        dummy.position.set(g.x + scatterX, g.y + scatterY, g.z + scatterZ);
        
        const q = new THREE.Quaternion().setFromAxisAngle(g.axis, time * g.speed + (explosion * Math.random() * 10));
        dummy.quaternion.copy(q);
        
        const s = g.size * (1 + explosion * 2);
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        gearsRef.current!.setMatrixAt(i, dummy.matrix);
      });
      gearsRef.current.instanceMatrix.needsUpdate = true;
    }

    if (outerHullRef.current) {
      const pulse = 1 + explosion * 2;
      outerHullRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  const solidMat = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: '#0a0a0a', 
    metalness: 1, 
    roughness: 0.2,
    clearcoat: 1,
    clippingPlanes 
  }), [clippingPlanes]);
  
  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#00ccff', 
    wireframe: true, 
    transparent: true, 
    opacity: 0.6,
    clippingPlanes 
  }), [clippingPlanes]);

  const gearMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ff00aa', wireframe: true, clippingPlanes });
    return new THREE.MeshStandardMaterial({ color: '#222222', metalness: 0.8, roughness: 0.5, clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  const tubeMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.3, clippingPlanes });
    return new THREE.MeshStandardMaterial({ color: '#ff00aa', emissive: '#ff00aa', emissiveIntensity: 2, clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  return (
    <group ref={groupRef}>
      {/* The solid exterior hull (only visible on one side of scanner) */}
      {!isBlueprint && (
        <mesh ref={outerHullRef}>
          <capsuleGeometry args={[3, 4, 32, 64]} />
          <primitive object={solidMat} attach="material" />
        </mesh>
      )}

      {/* The internal anatomical wires */}
      <instancedMesh ref={wiresRef} args={[undefined as any, undefined as any, WIRE_COUNT]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <primitive object={tubeMat} attach="material" />
      </instancedMesh>

      {/* The internal anatomical gears */}
      <instancedMesh ref={gearsRef} args={[undefined as any, undefined as any, GEAR_COUNT]}>
        <torusGeometry args={[1, 0.2, 16, 32]} />
        <primitive object={gearMat} attach="material" />
      </instancedMesh>

      {/* Blueprint outline for hull */}
      {isBlueprint && (
        <mesh>
          <capsuleGeometry args={[3, 4, 16, 32]} />
          <primitive object={wireMat} attach="material" />
        </mesh>
      )}
    </group>
  );
}

export function MechanicalAssembly() {
  // MRI Sweeping Scanner Planes
  const planeBlueprint = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  const planeMachine = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  
  useFrame((state) => {
    // MRI scanner sweeping up and down over time
    const yPos = Math.sin(state.clock.elapsedTime * 1.5) * 4; 
    planeBlueprint.constant = yPos;
    planeMachine.constant = -yPos;
  });

  return (
    <group position={[0, 0, -5]}>
      <ScannerPart isBlueprint={true} clippingPlanes={[planeBlueprint]} />
      <ScannerPart isBlueprint={false} clippingPlanes={[planeMachine]} />
      
      {/* Scanner laser visual */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial 
          color="#00ffff" 
          transparent 
          opacity={0.1} 
          side={THREE.DoubleSide} 
          depthWrite={false}
        />
        <meshBasicMaterial 
          color="#00ffff" 
          wireframe 
          transparent 
          opacity={0.5} 
          side={THREE.DoubleSide} 
        />
      </mesh>
    </group>
  );
}
