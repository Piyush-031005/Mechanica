"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function TheEye() {
  const groupRef = useRef<THREE.Group>(null);
  const pupilRef = useRef<THREE.Mesh>(null);
  
  // Create Gyroscope Rings (Astrolabe-style observer)
  const ringGeo = useMemo(() => new THREE.TorusGeometry(5, 0.15, 16, 100), []);
  const pupilGeo = useMemo(() => new THREE.SphereGeometry(1.5, 32, 32), []);
  
  // Premium materials
  const goldMetal = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#ffaa55", 
    metalness: 1, 
    roughness: 0.1 
  }), []);

  const silverMetal = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#ffffff", 
    metalness: 1, 
    roughness: 0.3 
  }), []);
  
  const pureBlackGlass = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: "#000000", 
    metalness: 1, 
    roughness: 0,
    clearcoat: 1
  }), []);

  const rings = Array.from({ length: 4 }).map((_, i) => ({
    scale: 1 - i * 0.15,
    speedX: (Math.random() - 0.5) * 2,
    speedY: (Math.random() - 0.5) * 2,
    speedZ: (Math.random() - 0.5) * 2,
    material: i % 2 === 0 ? goldMetal : silverMetal,
    ref: useRef<THREE.Mesh>(null)
  }));

  useFrame((state, delta) => {
    const depth = useStore.getState().scrollDepth;
    const velocity = useStore.getState().scrollVelocity;
    
    if (groupRef.current) {
      // The Eye is active between 75% and 100% scroll
      let targetScale = 0;
      let targetZ = 50; 
      
      if (depth > 0.70) {
        // Entrance animation
        const enterProgress = Math.min(1, Math.max(0, (depth - 0.75) * 10)); // 0 to 1 between 75% and 85%
        
        targetScale = enterProgress;
        
        // Rings spin aggressively based on scroll velocity (mechanical whirring)
        const spinSpeed = 0.5 + Math.abs(velocity) * 0.05;

        rings.forEach((ring) => {
          if (ring.ref.current) {
            ring.ref.current.rotation.x += delta * ring.speedX * spinSpeed;
            ring.ref.current.rotation.y += delta * ring.speedY * spinSpeed;
            ring.ref.current.rotation.z += delta * ring.speedZ * spinSpeed;
          }
        });

        // The Pupil perfectly tracks the user's mouse pointer
        if (pupilRef.current) {
          const targetX = (state.pointer.x * Math.PI) / 6;
          const targetY = (state.pointer.y * Math.PI) / 6;
          
          pupilRef.current.rotation.y = THREE.MathUtils.lerp(pupilRef.current.rotation.y, targetX, 0.1);
          pupilRef.current.rotation.x = THREE.MathUtils.lerp(pupilRef.current.rotation.x, -targetY, 0.1);
        }

        // Looming threat: The eye slowly gets closer as you reach the bottom
        const approachScale = Math.max(0, (depth - 0.85) * 2); // 0 to 0.3
        targetScale += approachScale;
        
        targetZ = THREE.MathUtils.lerp(-100, -20, enterProgress);
      }
      
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 50]} scale={0}>
      {/* Central Black Hole / Pupil */}
      <mesh ref={pupilRef} geometry={pupilGeo} material={pureBlackGlass}>
        {/* Glowing Iris Ring inside the pupil */}
        <mesh position={[0, 0, 1.4]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.5, 0.02, 16, 64]} />
          <meshBasicMaterial color="#ff5500" />
        </mesh>
      </mesh>

      {/* Chaotic Gyroscope Rings */}
      {rings.map((ring, i) => (
        <mesh key={i} ref={ring.ref} geometry={ringGeo} material={ring.material} scale={ring.scale} />
      ))}
    </group>
  );
}
