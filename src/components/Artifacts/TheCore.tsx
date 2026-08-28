"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, Edges } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

const PARTICLE_COUNT = 3000;

function CorePart({ isBlueprint, clippingPlanes }: { isBlueprint: boolean, clippingPlanes: THREE.Plane[] }) {
  const scroll = useScroll();
  const explosion = useStore((state) => state.explosion);
  
  const groupRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const diskRef = useRef<THREE.InstancedMesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Precompute random particle parameters for accretion disk
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 2 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 0.5 + 0.5) * (10 / radius); // Faster near the center
      const yOffset = (Math.random() - 0.5) * (radius - 1);
      
      data.push({ radius, angle, speed, yOffset });
    }
    return data;
  }, []);

  useFrame((state) => {
    const offset = scroll.offset; 
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Enter animation around offset 0.7 (pages 12-13)
      const localOffset = Math.max(0, (offset - 0.7) * 4);
      const scale = THREE.MathUtils.lerp(0.001, 1, Math.min(1, localOffset)); 
      
      const explodeScale = 1 + explosion * 2; 
      
      groupRef.current.scale.set(scale * explodeScale, scale * explodeScale, scale * explodeScale);
      groupRef.current.visible = offset > 0.65;
      
      // Floating motion
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.5;
      groupRef.current.rotation.x = 0.2;
    }

    const speedMult = 1 + explosion * 20;

    if (sunRef.current) {
      sunRef.current.rotation.y = time * 2 * speedMult;
      const pulse = 1 + Math.sin(time * 20) * 0.05 + (explosion * 3);
      sunRef.current.scale.set(pulse, pulse, pulse);
    }
    
    if (haloRef.current) {
      const haloScale = 1.2 + Math.sin(time * 15) * 0.1 + (explosion * 5);
      haloRef.current.scale.set(haloScale, haloScale, haloScale);
    }
    
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(time) * 0.1;
      ringRef.current.rotation.z = -time * speedMult;
      const ringScale = 1 + explosion * 5;
      ringRef.current.scale.set(ringScale, ringScale, ringScale);
    }

    // Accretion Disk Simulation
    if (diskRef.current) {
      particles.forEach((p, i) => {
        const currentAngle = p.angle + time * p.speed * speedMult;
        
        const scatterX = explosion > 0 ? (Math.random() - 0.5) * explosion * 50 : 0;
        const scatterY = explosion > 0 ? (Math.random() - 0.5) * explosion * 50 : 0;
        const scatterZ = explosion > 0 ? (Math.random() - 0.5) * explosion * 50 : 0;
        
        dummy.position.set(
          Math.cos(currentAngle) * p.radius + scatterX,
          p.yOffset + scatterY,
          Math.sin(currentAngle) * p.radius + scatterZ
        );
        
        // Elongate particles in the direction of motion
        dummy.rotation.y = -currentAngle;
        
        const s = 1 + explosion * 2;
        dummy.scale.set(s * 0.05, s * 0.05, s * 0.5);
        dummy.updateMatrix();
        
        diskRef.current!.setMatrixAt(i, dummy.matrix);
      });
      diskRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const sunMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true, transparent: true, opacity: 0.8, clippingPlanes });
    return new THREE.MeshStandardMaterial({ color: '#000000', roughness: 0, clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  const haloMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ff00aa', wireframe: true, clippingPlanes });
    return new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  const diskMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#00ccff', clippingPlanes });
    return new THREE.MeshBasicMaterial({ color: '#ff00aa', clippingPlanes });
  }, [isBlueprint, clippingPlanes]);
  
  const ringMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ff00aa', wireframe: true, clippingPlanes });
    return new THREE.MeshPhysicalMaterial({ 
      color: '#00ccff', 
      transmission: 0.9,
      roughness: 0,
      ior: 1.5,
      clippingPlanes 
    });
  }, [isBlueprint, clippingPlanes]);

  return (
    <group ref={groupRef} position={[0, -2, -8]}>
      {/* Central Black Hole */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <primitive object={sunMat} attach="material" />
      </mesh>
      
      {/* Event Horizon Halo */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[1.6, 32, 32]} />
        <primitive object={haloMat} attach="material" />
      </mesh>

      {/* Gravitational Lensing Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.2, 16, 100]} />
        <primitive object={ringMat} attach="material" />
      </mesh>

      {/* Accretion Disk Particles */}
      <instancedMesh ref={diskRef} args={[undefined as any, undefined as any, PARTICLE_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={diskMat} attach="material" />
      </instancedMesh>
    </group>
  );
}

export function TheCore() {
  const { viewport } = useThree();
  const planeBlueprint = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);
  const planeMachine = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  
  useFrame((state) => {
    const mouseX = (state.pointer.x * viewport.width) / 2;
    planeBlueprint.constant = mouseX;
    planeMachine.constant = -mouseX;
  });

  return (
    <group position={[0, 0, -3]}>
      <CorePart isBlueprint={true} clippingPlanes={[planeBlueprint]} />
      <CorePart isBlueprint={false} clippingPlanes={[planeMachine]} />
    </group>
  );
}
