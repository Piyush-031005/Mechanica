"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

const PETAL_COUNT = 500;

export function CyberLotus() {
  const scroll = useScroll();
  const explosion = useStore((state) => state.explosion);
  const isDismantled = useStore((state) => state.isDismantled);
  const dismantleProgress = useRef(0);
  
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const laserRef = useRef<THREE.Mesh>(null);

  // Clipping planes for the Reality Split effect
  const planeBlueprint = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  const planeMachine = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

  // Pre-calculate the Fibonacci spiral (Sunflower seed arrangement) for organic intricacy
  const baseData = useMemo(() => {
    const data = [];
    const c = 0.4; // spread factor
    for (let i = 1; i <= PETAL_COUNT; i++) {
      const r = c * Math.sqrt(i);
      const theta = i * 137.508 * (Math.PI / 180);
      
      // 2D position in the spiral
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      
      // Dome effect: higher in the center, tapering off
      const z = Math.max(0, 4 - r * 0.8);
      
      // Rotation: point outwards from center
      const rotZ = theta; 
      // Tilt: inner petals tilt up, outer petals tilt flat
      const rotX = (Math.PI / 2) * (r / (c * Math.sqrt(PETAL_COUNT)));
      
      data.push({ x, y, z, rotX, rotZ, r, theta });
    }
    return data;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const offset = scroll.offset;
    
    // MRI scanner sweeping
    const scanY = Math.sin(time * 1.5) * 6; 
    planeBlueprint.constant = scanY;
    planeMachine.constant = -scanY;
    if (laserRef.current) {
      laserRef.current.position.y = scanY;
    }

    dismantleProgress.current = THREE.MathUtils.lerp(
      dismantleProgress.current, 
      isDismantled ? 1 : 0, 
      0.05
    );
    const d = dismantleProgress.current;
    const pulse = 1 + explosion * 2;

    if (groupRef.current) {
      const localOffset = Math.max(0, Math.min(1, (offset - 0.5) * 4));
      
      if (offset > 0.75) {
        const flyby = (offset - 0.75) * 4; 
        const scale = THREE.MathUtils.lerp(1, 15, flyby);
        groupRef.current.scale.setScalar(scale);
        groupRef.current.position.z = THREE.MathUtils.lerp(-5, 10, flyby);
        groupRef.current.visible = flyby < 0.8;
      } else if (offset > 0.25) {
        const entry = Math.min(1, (offset - 0.25) * 4);
        // Expand massively on dismantle
        const targetScale = THREE.MathUtils.lerp(1, 2.5, d);
        groupRef.current.scale.setScalar(targetScale);
        groupRef.current.position.z = THREE.MathUtils.lerp(-30, -5, entry);
        groupRef.current.visible = true;
      } else {
        groupRef.current.visible = false;
      }

      // Entire lotus rotates majesticly
      groupRef.current.rotation.z = time * 0.1;
      // Flatten out to face the camera on dismantle
      groupRef.current.rotation.x = THREE.MathUtils.lerp(Math.sin(time * 0.2) * 0.3, Math.PI / 2, d);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(Math.sin(time * 0.3) * 0.2, 0, d);
    }

    // Update 500 petals
    if (meshRef.current) {
      baseData.forEach((petal, i) => {
        // Breathing organic motion
        const breathe = Math.sin(time * 2 - petal.r) * 0.2 * pulse;
        
        // On dismantle, the dome flattens completely into a perfect 2D Mandala graphic
        const currentZ = THREE.MathUtils.lerp(petal.z + breathe, 0, d);
        
        // On dismantle, petals unfold flat
        const currentRotX = THREE.MathUtils.lerp(petal.rotX + breathe * 0.5, 0, d);

        dummy.position.set(petal.x, petal.y, currentZ);
        dummy.rotation.set(currentRotX, 0, petal.rotZ);
        
        // On dismantle, petals stretch out to create an intricate web/starburst
        const stretchY = THREE.MathUtils.lerp(1, 3, d);
        const stretchX = THREE.MathUtils.lerp(1, 0.2, d);
        
        // Size variation based on distance from center
        const size = Math.max(0.1, 1 - (petal.r * 0.05));
        dummy.scale.set(size * stretchX, size * stretchY, size);
        
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  // Solid, striking flat graphic materials (matching the Nuclear Matter / Rebel Moon aesthetic)
  const redMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#ff0033', // Nuclear Red
    clippingPlanes: [planeMachine],
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9
  }), [planeMachine]);

  return (
    <group ref={groupRef}>
      {/* 500 Petal Instanced Mesh */}
      <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, PETAL_COUNT]}>
        {/* A stretched circle acting as an organic petal or insectoid leg segment */}
        <circleGeometry args={[0.5, 32]} />
        <primitive object={redMat} attach="material" />
      </instancedMesh>
      
      {/* 500 Petal Instanced Mesh - BLUEPRINT SIDE */}
      <LotusBlueprint planeBlueprint={planeBlueprint} baseData={baseData} dRef={dismantleProgress} explosion={explosion} />

      {/* MRI Scanner Line */}
      <mesh ref={laserRef} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Separate component for the blueprint half so we can use a different instanced mesh
function LotusBlueprint({ planeBlueprint, baseData, dRef, explosion }: any) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const d = dRef.current;
    const pulse = 1 + explosion * 2;

    if (meshRef.current) {
      baseData.forEach((petal: any, i: number) => {
        const breathe = Math.sin(time * 2 - petal.r) * 0.2 * pulse;
        const currentZ = THREE.MathUtils.lerp(petal.z + breathe, 0, d);
        const currentRotX = THREE.MathUtils.lerp(petal.rotX + breathe * 0.5, 0, d);

        dummy.position.set(petal.x, petal.y, currentZ);
        dummy.rotation.set(currentRotX, 0, petal.rotZ);
        
        const stretchY = THREE.MathUtils.lerp(1, 3, d);
        const stretchX = THREE.MathUtils.lerp(1, 0.2, d);
        const size = Math.max(0.1, 1 - (petal.r * 0.05));
        
        dummy.scale.set(size * stretchX, size * stretchY, size);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const whiteWireMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#ffffff', // High contrast white for blueprint
    wireframe: true,
    clippingPlanes: [planeBlueprint],
    side: THREE.DoubleSide
  }), [planeBlueprint]);

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, PETAL_COUNT]}>
      <circleGeometry args={[0.5, 32]} />
      <primitive object={whiteWireMat} attach="material" />
    </instancedMesh>
  );
}
