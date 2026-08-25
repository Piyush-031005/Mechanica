"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Edges } from "@react-three/drei";
import * as THREE from "three";

export function CyberOrigami() {
  const groupRef = useRef<THREE.Group>(null);
  const outerMeshRef = useRef<THREE.Mesh>(null);
  const innerMeshRef = useRef<THREE.Mesh>(null);
  
  // A highly faceted geometry to represent origami folds
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(3.5, 1), []);
  const innerGeometry = useMemo(() => new THREE.OctahedronGeometry(2.5, 0), []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Floating, breathing rotation
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.x += delta * 0.05;
      
      // Mouse magnetic reactivity
      const targetX = (state.pointer.x * Math.PI) / 6;
      const targetY = (state.pointer.y * Math.PI) / 6;
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, groupRef.current.rotation.y + targetX, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, groupRef.current.rotation.x - targetY, 0.05);

      // Origami "breathing" scale
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
    
    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.y -= delta * 0.3;
      innerMeshRef.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <Float speed={3} rotationIntensity={1.5} floatIntensity={2} floatingRange={[-0.5, 0.5]}>
      <group ref={groupRef}>
        
        {/* Outer Glass Envelope */}
        <mesh ref={outerMeshRef} geometry={geometry}>
          <MeshTransmissionMaterial
            backside
            samples={4} 
            resolution={256}
            thickness={1.5}
            chromaticAberration={0.4}
            anisotropy={0.5}
            color="#ffffff"
            attenuationDistance={10}
            attenuationColor="#00f0ff"
            clearcoat={1}
            roughness={0.05}
            transmission={1}
            ior={1.4}
          />
          {/* Subtle cyan wireframe overlay on the glass */}
          <Edges scale={1.001} threshold={15} color="rgba(0, 240, 255, 0.4)" />
        </mesh>

        {/* Inner Crimson Core */}
        <mesh ref={innerMeshRef} geometry={innerGeometry}>
          <meshPhysicalMaterial 
            color="#ff003c"
            emissive="#ff003c"
            emissiveIntensity={1.5}
            roughness={0.2}
            metalness={1}
            wireframe
          />
        </mesh>
        
        {/* Orbiting Tech Shards */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh 
            key={i} 
            position={[
              Math.cos((i / 8) * Math.PI * 2) * 5, 
              Math.sin((i / 8) * Math.PI * 4) * 2, 
              Math.sin((i / 8) * Math.PI * 2) * 5
            ]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
          >
            <tetrahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.1} />
            <Edges color="#ff003c" />
          </mesh>
        ))}
      </group>
    </Float>
  );
}
