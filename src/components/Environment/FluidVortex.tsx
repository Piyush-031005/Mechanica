"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

const PARTICLE_COUNT = 8000;

export function FluidVortex() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const scroll = useScroll();
  const explosion = useStore(state => state.explosion);
  
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Create a flowing river with a tight core and a diffuse outer cloud
      const radius = Math.random() > 0.8 ? Math.random() * 15 : Math.random() * 2;
      const angle = Math.random() * Math.PI * 2;
      
      data.push({
        t: Math.random(), // position along the river (0 to 1)
        speed: 0.1 + Math.random() * 0.2,
        offsetX: Math.cos(angle) * radius,
        offsetY: (Math.random() - 0.5) * 5,
        offsetZ: Math.sin(angle) * radius,
        scale: 0.05 + Math.random() * 0.2
      });
    }
    return data;
  }, []);

  const material = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#00ccff', 
    transparent: true, 
    opacity: 0.4, 
    blending: THREE.AdditiveBlending, 
    depthWrite: false 
  }), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const globalScroll = scroll.offset; // 0 to 1

    if (meshRef.current) {
      particles.forEach((p, i) => {
        // Flow the particle forward over time, speed increases during explosion
        p.t = (p.t + (p.speed * (1 + explosion * 5)) * 0.002) % 1.0;
        
        // The river winds back and forth (sine wave) and spirals down
        const riverLength = 120; // total vertical distance
        const y = (0.5 - p.t) * riverLength; 
        
        // Winding mathematical river
        // It starts wide, winds heavily in the middle, and spirals tightly at the end (The Core)
        const spiralFactor = Math.max(0, (p.t - 0.7) * 3.33); // 0 until 0.7, then ramps up to 1
        
        // Wide winding meander
        const meanderX = Math.sin(p.t * Math.PI * 4) * 20;
        const meanderZ = Math.cos(p.t * Math.PI * 3) * 15;
        
        // Tight fast vortex
        const vortexAngle = time * 2 + p.t * Math.PI * 40;
        const vortexRadius = (1 - spiralFactor) * 20 + 2; // shrinks as it goes down
        const vortexX = Math.cos(vortexAngle) * vortexRadius;
        const vortexZ = Math.sin(vortexAngle) * vortexRadius;

        // Blend between meander and vortex
        const finalX = THREE.MathUtils.lerp(meanderX, vortexX, spiralFactor);
        const finalZ = THREE.MathUtils.lerp(meanderZ, vortexZ, spiralFactor);

        dummy.position.set(
          finalX + p.offsetX * (1 + explosion * 2),
          y + p.offsetY + globalScroll * riverLength * 0.3, // Parallax scroll opposite to camera
          finalZ + p.offsetZ * (1 + explosion * 2) - 20
        );

        const s = p.scale * (1 + explosion * 3);
        // Stretch particles along velocity for motion blur effect
        dummy.scale.set(s, s * 4, s); 
        
        // Align particle to the flow direction
        dummy.rotation.set(0, 0, 0);
        dummy.lookAt(
          finalX + p.offsetX,
          y - 1 + p.offsetY,
          finalZ + p.offsetZ - 20
        );

        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  );
}
