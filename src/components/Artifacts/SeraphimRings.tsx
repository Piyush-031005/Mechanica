"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

export function SeraphimRings() {
  const scroll = useScroll();
  const explosion = useStore((state) => state.explosion);
  
  const groupRef = useRef<THREE.Group>(null);
  
  // Create planes for clipping (MRI effect)
  const planeBlueprint = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  const planeMachine = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const offset = scroll.offset; 
    
    // MRI scanner sweeping
    const yPos = Math.sin(time * 2.0) * 5; 
    planeBlueprint.constant = yPos;
    planeMachine.constant = -yPos;

    if (groupRef.current) {
      // Map scroll offset 0.5 - 0.75 to local flyby 0 to 1
      const localOffset = Math.max(0, Math.min(1, (offset - 0.5) * 4));
      
      // Floating motion
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.5;
      
      if (offset > 0.75) {
        // Fly past camera
        const flyby = (offset - 0.75) * 4; 
        const scale = THREE.MathUtils.lerp(1, 20, flyby);
        groupRef.current.scale.setScalar(scale);
        groupRef.current.position.z = THREE.MathUtils.lerp(-5, 15, flyby);
        groupRef.current.visible = flyby < 0.8;
      } else if (offset > 0.25) {
        // Enter screen from background
        const entry = Math.min(1, (offset - 0.25) * 4);
        groupRef.current.scale.setScalar(1);
        groupRef.current.position.z = THREE.MathUtils.lerp(-30, -5, entry);
        groupRef.current.visible = true;
      } else {
        groupRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <SeraphimHalf isBlueprint={true} clippingPlanes={[planeBlueprint]} explosion={explosion} />
      <SeraphimHalf isBlueprint={false} clippingPlanes={[planeMachine]} explosion={explosion} />
    </group>
  );
}

function SeraphimHalf({ isBlueprint, clippingPlanes, explosion }: { isBlueprint: boolean, clippingPlanes: THREE.Plane[], explosion: number }) {
  const outerRing = useRef<THREE.Mesh>(null);
  const midRing = useRef<THREE.Mesh>(null);
  const innerRing = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const pulse = 1 + explosion * 2;

    // Neat, majestic, mathematical gyroscope rotation
    if (outerRing.current) {
      outerRing.current.rotation.x = time * (0.2 * pulse);
      outerRing.current.rotation.y = time * 0.1;
    }
    if (midRing.current) {
      midRing.current.rotation.y = time * (0.3 * pulse);
      midRing.current.rotation.z = time * 0.15;
    }
    if (innerRing.current) {
      innerRing.current.rotation.z = time * (0.4 * pulse);
      innerRing.current.rotation.x = time * 0.2;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = -time * 0.5;
      coreRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.1 * pulse);
    }
  });

  const solidMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#050505', 
    metalness: 1, 
    roughness: 0.1,
    clippingPlanes,
    side: THREE.DoubleSide
  }), [clippingPlanes]);
  
  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#00ffff', 
    wireframe: true, 
    transparent: true, 
    opacity: 0.5,
    clippingPlanes 
  }), [clippingPlanes]);

  const coreMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ff00aa', wireframe: true, clippingPlanes });
    return new THREE.MeshStandardMaterial({ color: '#ff0055', emissive: '#ff0055', emissiveIntensity: 2, clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  return (
    <group>
      {/* Outer Gyro Ring */}
      <mesh ref={outerRing}>
        <torusGeometry args={[4, 0.2, 16, 100]} />
        <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
      </mesh>
      
      {/* Middle Gyro Ring */}
      <mesh ref={midRing}>
        <torusGeometry args={[3, 0.15, 16, 100]} />
        <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
      </mesh>

      {/* Inner Gyro Ring */}
      <mesh ref={innerRing}>
        <torusGeometry args={[2, 0.1, 16, 100]} />
        <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
      </mesh>

      {/* Ethereal Glowing Core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1, 1]} />
        <primitive object={coreMat} attach="material" />
      </mesh>
    </group>
  );
}
