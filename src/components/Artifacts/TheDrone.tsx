"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function TheDrone() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create Drone parts (Sleek aerodynamic fuselage with sweeping wings)
  const bodyGeo = useMemo(() => new THREE.CapsuleGeometry(0.8, 6, 16, 32), []);
  const wingGeo = useMemo(() => new THREE.BoxGeometry(12, 0.2, 3), []);
  
  // Premium materials
  const blackGlass = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: "#050505", 
    metalness: 0.8, 
    roughness: 0.1,
    transmission: 0.9,
    thickness: 1.5,
    ior: 1.5
  }), []);
  
  const glowingCyan = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: "#00ffff" 
  }), []);

  const wings = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const depth = useStore.getState().scrollDepth;
    
    if (groupRef.current) {
      // The Drone is active between 50% and 75% scroll
      let targetScale = 0;
      let targetZ = 50; 
      
      if (depth > 0.50 && depth < 0.80) {
        // Entrance animation
        const enterProgress = Math.min(1, Math.max(0, (depth - 0.50) * 10)); // 0 to 1 between 50% and 60%
        
        // Exit animation
        const exitProgress = Math.max(0, Math.min(1, (depth - 0.70) * 10)); // 0 to 1 between 70% and 80%
        
        const activeScale = 1 - exitProgress;
        targetScale = enterProgress * activeScale;
        
        // Cinematic Flight Mechanics: Banking based on mouse position
        const targetBankX = (state.pointer.x * Math.PI) / 3;
        const targetBankY = -(state.pointer.y * Math.PI) / 6;
        
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetBankX, 0.05);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetBankY, 0.05);
        
        // Gentle hover
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 1.5;

        // Wing flapping logic (subtle adjustments)
        if (wings.current) {
          const flap = Math.sin(state.clock.elapsedTime * 15) * 0.05;
          wings.current.children[0].rotation.z = flap;
          wings.current.children[1].rotation.z = -flap;
        }

        targetZ = THREE.MathUtils.lerp(-100, -10, enterProgress) - (exitProgress * 50);
      }
      
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 50]} scale={0}>
      {/* Fuselage */}
      <mesh geometry={bodyGeo} material={blackGlass} rotation={[Math.PI / 2, 0, 0]} />
      
      {/* Glowing Thruster/Eye */}
      <mesh position={[0, 0, 3.5]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>

      {/* Swept Wings */}
      <group ref={wings}>
        <mesh position={[5, 0, -1]} geometry={wingGeo} material={blackGlass} rotation={[0, -0.2, 0]} />
        <mesh position={[-5, 0, -1]} geometry={wingGeo} material={blackGlass} rotation={[0, 0.2, 0]} />
      </group>
    </group>
  );
}
