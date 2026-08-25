"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ArcaneGeometry() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Slow rotation for the magical tech circles
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.05;
      
      // Slight parallax on mouse move
      const mouseX = (state.pointer.x * Math.PI) / 100;
      const mouseY = (state.pointer.y * Math.PI) / 100;
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouseY, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouseX, 0.05);
    }
  });

  const material = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#00ffff', // Cyan tint for arcane tech
    wireframe: true,
    transparent: true,
    opacity: 0.1,
  }), []);
  
  const accentMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#ff007f', // Neon Pink accent
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  }), []);

  return (
    <group ref={groupRef} position={[0, 0, -20]} scale={25}>
      {/* Outer Ring */}
      <mesh>
        <torusGeometry args={[1, 0.005, 3, 64]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* Inner Triangle */}
      <mesh rotation={[0, 0, Math.PI / 6]}>
        <torusGeometry args={[0.8, 0.005, 3, 3]} />
        <primitive object={accentMaterial} attach="material" />
      </mesh>
      
      {/* Reverse Triangle */}
      <mesh rotation={[0, 0, -Math.PI / 6]}>
        <torusGeometry args={[0.8, 0.005, 3, 3]} />
        <primitive object={accentMaterial} attach="material" />
      </mesh>
      
      {/* Core Ring */}
      <mesh>
        <torusGeometry args={[0.4, 0.01, 3, 32]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* Dashed data rings (represented by low segment torus) */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[1.2, 0.005, 3, 24]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* Central Axis Lines */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 2, 3]} />
        <primitive object={accentMaterial} attach="material" />
      </mesh>
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 2, 3]} />
        <primitive object={accentMaterial} attach="material" />
      </mesh>
    </group>
  );
}
