"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, Edges } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

function CorePart({ isBlueprint, clippingPlanes }: { isBlueprint: boolean, clippingPlanes: THREE.Plane[] }) {
  const scroll = useScroll();
  const explosion = useStore((state) => state.explosion);
  
  const groupRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const offset = scroll.offset; 
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Enter animation around offset 0.95 (pages 13-16)
      const localOffset = Math.max(0, (offset - 0.9) * 10);
      const scale = THREE.MathUtils.lerp(0.001, 1, Math.min(1, localOffset)); 
      
      // Explosion scale math: shatter outward based on store state
      const explodeScale = 1 + explosion * 2; // Expands wildly if explosion > 0
      
      groupRef.current.scale.set(scale * explodeScale, scale * explodeScale, scale * explodeScale);
      groupRef.current.visible = offset > 0.85;
      
      // Gently bob up and down
      groupRef.current.position.y = Math.sin(time) * 0.2;
    }

    // Explode speed multiplier
    const speedMult = 1 + explosion * 10;

    if (sunRef.current) {
      sunRef.current.rotation.x = time * 0.5 * speedMult;
      sunRef.current.rotation.y = time * 0.7 * speedMult;
      // Pulse scale
      const pulse = 1 + Math.sin(time * 5) * 0.05 + (explosion * 2);
      sunRef.current.scale.set(pulse, pulse, pulse);
    }
    
    // Rotate rings on different axes
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 1.2 * speedMult;
      ring1Ref.current.rotation.y = time * 0.4 * speedMult;
      if (explosion > 0) ring1Ref.current.position.x = Math.sin(time * 20) * explosion;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -time * 0.8 * speedMult;
      ring2Ref.current.rotation.z = time * 1.5 * speedMult;
      if (explosion > 0) ring2Ref.current.position.y = Math.cos(time * 25) * explosion;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x = -time * 1.5 * speedMult;
      ring3Ref.current.rotation.z = -time * 0.5 * speedMult;
      if (explosion > 0) ring3Ref.current.position.z = Math.sin(time * 30) * explosion;
    }
  });

  const sunMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true, transparent: true, opacity: 0.8, clippingPlanes });
    return new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 5, clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  const shellMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#34d399', wireframe: true, clippingPlanes });
    return new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.2, metalness: 0.9, clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  const innerRingMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ff007f', wireframe: true, clippingPlanes });
    return new THREE.MeshPhysicalMaterial({ 
      color: '#ffbf00', 
      transmission: 0.9,
      roughness: 0.1,
      ior: 1.5,
      thickness: 0.5,
      emissive: '#ffbf00',
      emissiveIntensity: 0.5,
      clippingPlanes 
    });
  }, [isBlueprint, clippingPlanes]);

  return (
    <group ref={groupRef} position={[0, -2, -5]}>
      {/* Central Blinding Sun */}
      <mesh ref={sunRef}>
        <icosahedronGeometry args={[1, 2]} />
        <primitive object={sunMat} attach="material" />
      </mesh>

      {/* Inner Energy Ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.5, 0.1, 16, 64]} />
        <primitive object={innerRingMat} attach="material" />
      </mesh>

      {/* Middle Heavy Plating Ring */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.5, 0.4, 6, 32]} />
        <primitive object={shellMat} attach="material" />
        {isBlueprint && <Edges scale={1.05} color="#34d399" />}
      </mesh>

      {/* Outer Hexagonal Structure */}
      <mesh ref={ring3Ref}>
        <torusGeometry args={[3.5, 0.1, 3, 64]} />
        <primitive object={shellMat} attach="material" />
        {isBlueprint && <Edges scale={1.05} color="#ff007f" />}
      </mesh>
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
