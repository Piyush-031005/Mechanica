"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Edges } from "@react-three/drei";
import * as THREE from "three";

export function CyberOrigami() {
  const groupRef = useRef<THREE.Group>(null);
  const outerMeshRef = useRef<THREE.Mesh>(null);
  const innerMeshRef = useRef<THREE.Mesh>(null);
  
  // High-poly geometry for smooth liquid glass distortion
  const geometry = useMemo(() => new THREE.TorusKnotGeometry(2.5, 1.2, 256, 64, 2, 3), []);
  const innerGeometry = useMemo(() => new THREE.OctahedronGeometry(2, 0), []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Floating, breathing rotation
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x += delta * 0.1;
      
      // Mouse magnetic reactivity
      const targetX = (state.pointer.x * Math.PI) / 4;
      const targetY = (state.pointer.y * Math.PI) / 4;
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, groupRef.current.rotation.y + targetX, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, groupRef.current.rotation.x - targetY, 0.05);

      // Organic "breathing" scale
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
      groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
    
    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.y -= delta * 0.5;
      innerMeshRef.current.rotation.z += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.5} floatingRange={[-0.3, 0.3]}>
      <group ref={groupRef}>
        
        {/* The Fluid Glass Data-Core */}
        <mesh ref={outerMeshRef} geometry={geometry}>
          <MeshTransmissionMaterial
            backside
            samples={6} 
            resolution={512}
            thickness={2.5}
            chromaticAberration={0.8}
            anisotropy={0.5}
            color="#ffffff"
            attenuationDistance={5}
            attenuationColor="#00f0ff"
            clearcoat={1}
            roughness={0.1}
            transmission={1}
            ior={1.4}
            distortion={0.6}
            distortionScale={0.3}
            temporalDistortion={0.1}
          />
        </mesh>

        {/* Inner Crimson Wireframe Core */}
        <mesh ref={innerMeshRef} geometry={innerGeometry}>
          <meshPhysicalMaterial 
            color="#ff003c"
            emissive="#ff003c"
            emissiveIntensity={2}
            roughness={0.2}
            metalness={1}
            wireframe
          />
        </mesh>
        
        {/* Orbiting Tech Shards - Replaced with geometric glass shards */}
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh 
            key={i} 
            position={[
              Math.cos((i / 12) * Math.PI * 2) * 5, 
              Math.sin((i / 12) * Math.PI * 6) * 1.5, 
              Math.sin((i / 12) * Math.PI * 2) * 5
            ]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
          >
            <octahedronGeometry args={[0.3, 0]} />
            <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} transparent roughness={0.1} ior={1.5} />
            <Edges scale={1.05} color="#00f0ff" opacity={0.5} transparent />
          </mesh>
        ))}
      </group>
    </Float>
  );
}
