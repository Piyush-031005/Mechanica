"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function DNAParticles({ scrollYProgress }: { scrollYProgress: any }) {
  const points = useRef<THREE.Points>(null);
  
  const particlesCount = 2000;
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    const col = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount; i++) {
      // Create a cylindrical tunnel effect
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 20; // Tunnel radius between 5 and 25
      const z = (Math.random() - 0.5) * 100; // Tunnel length
      
      pos[i * 3 + 0] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = z;
      
      // Omnitrix Green and Albedo Red theme colors
      const isGreen = Math.random() > 0.5;
      const color = new THREE.Color(isGreen ? "#00ff33" : "#ff003c");
      
      // Add slight variance to colors
      color.multiplyScalar(0.5 + Math.random() * 0.5);
      
      col[i * 3 + 0] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, []);

  useFrame((state, delta) => {
    if (points.current) {
      // Slowly rotate the entire tunnel
      points.current.rotation.z += delta * 0.05;
      
      // Move particles towards the camera based on scroll speed
      const scrollV = scrollYProgress.getVelocity();
      const speed = 0.5 + Math.abs(scrollV) * 20;
      
      const positions = points.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        // Move z position
        positions[i * 3 + 2] += speed * delta;
        
        // Loop back if past camera
        if (positions[i * 3 + 2] > 20) {
          positions[i * 3 + 2] -= 100;
        }
      }
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={points}>
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
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
