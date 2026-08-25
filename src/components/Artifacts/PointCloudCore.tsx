"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Edges } from "@react-three/drei";

export function PointCloudCore() {
  const pointsRef = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  
  const particleCount = 15000;
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const color = new THREE.Color();
    
    for (let i = 0; i < particleCount; i++) {
      // Golden ratio spiral / spherical distribution
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      
      const r = 3 + Math.random() * 1.5; // Radius with noise
      
      pos[i * 3] = r * Math.cos(theta) * Math.sin(phi);
      pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      // Mix between blueprint cyan and crimson
      const mixRatio = Math.random();
      color.lerpColors(new THREE.Color('#00f0ff'), new THREE.Color('#ff003c'), mixRatio > 0.9 ? 1 : 0);
      
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, [particleCount]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Rotate the entire swarm
      pointsRef.current.rotation.y += delta * 0.1;
      pointsRef.current.rotation.z += delta * 0.05;
      
      // Mouse magnetic reactivity
      const targetX = (state.pointer.x * Math.PI) / 2;
      const targetY = (state.pointer.y * Math.PI) / 2;
      
      pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, targetX, 0.02);
      pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, -targetY, 0.02);
      
      // Breathing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      pointsRef.current.scale.set(scale, scale, scale);

      // Animate particles (vertex displacement)
      const positionsAttr = pointsRef.current.geometry.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];
        
        // Complex noise based on time
        const time = state.clock.elapsedTime;
        const noise = Math.sin(x * 2 + time) * Math.cos(y * 2 + time) * 0.1;
        
        positionsAttr.setXYZ(
          i, 
          x + noise, 
          y + noise, 
          z + noise
        );
      }
      positionsAttr.needsUpdate = true;
    }
    
    if (coreRef.current) {
      coreRef.current.rotation.x -= delta * 0.2;
      coreRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group>
      {/* 3D Blueprint Axes */}
      <axesHelper args={[10]} />
      
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5, 5.02, 64]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <ringGeometry args={[5.5, 5.52, 64]} />
        <meshBasicMaterial color="#ff003c" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* The Biomechanical Particle Swarm */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Central Solid Geometric Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[1.5, 1]} />
        <meshPhysicalMaterial 
          color="#111111" 
          metalness={1} 
          roughness={0.2} 
          wireframe={true} 
          emissive="#ff003c" 
          emissiveIntensity={0.5} 
        />
        <Edges scale={1.01} color="#00f0ff" />
      </mesh>
    </group>
  );
}
