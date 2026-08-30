"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, Edges } from "@react-three/drei";
import * as THREE from "three";

function JellyfishPart({ isFossil, clippingPlanes }: { isFossil: boolean, clippingPlanes: THREE.Plane[] }) {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  
  const domeRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const tentaclesRef = useRef<THREE.Group>(null);

  // Tentacle references for procedural animation
  const tentacleRefs = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    const offset = scroll.offset; 
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      const localOffset = Math.max(0, (offset - 0.5) * 2);
      
      const scale = THREE.MathUtils.lerp(0.001, 1, Math.min(1, localOffset * 2)); 
      groupRef.current.scale.set(scale, scale, scale);
      
      groupRef.current.visible = offset > 0.45;
      
      // Floating/swimming motion
      groupRef.current.position.y = Math.sin(time * 1.5) * 0.3;
      groupRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
      groupRef.current.rotation.x = Math.sin(time * 0.7) * 0.1;
    }

    if (domeRef.current) {
      // Dome pulsates like a jellyfish bell
      const pulse = 1 + Math.sin(time * 3) * 0.05;
      domeRef.current.scale.set(pulse, pulse, pulse);
    }
    
    if (coreRef.current && !isFossil) {
      // Glow intensity pulses
      const emissiveInt = 2 + Math.sin(time * 5) * 2;
      (coreRef.current.material as THREE.MeshPhysicalMaterial).emissiveIntensity = emissiveInt;
    }

    // Wriggling tentacles
    if (tentaclesRef.current) {
      tentacleRefs.current.forEach((tentacle, i) => {
        if (tentacle) {
          // Complex sine wave based on time and index to make them wriggle like swimming legs
          tentacle.rotation.x = Math.sin(time * 2 + i) * 0.2;
          tentacle.rotation.z = Math.cos(time * 1.5 + i) * 0.2;
        }
      });
    }
  });

  const fossilMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#1a1817', 
    roughness: 0.9, 
    metalness: 0.2, 
    flatShading: true,
    clippingPlanes 
  }), [clippingPlanes]);

  const aliveMat = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: '#00f0ff', 
    transmission: 0.95,
    thickness: 1.5,
    roughness: 0.1,
    ior: 1.5,
    clearcoat: 1,
    emissive: '#0022aa',
    emissiveIntensity: 0.5,
    clippingPlanes 
  }), [clippingPlanes]);

  const coreMatFossil = useMemo(() => new THREE.MeshStandardMaterial({ color: '#000000', roughness: 1, clippingPlanes }), [clippingPlanes]);
  const coreMatAlive = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: '#ffffff', 
    emissive: '#00ffff', 
    emissiveIntensity: 4, 
    clippingPlanes 
  }), [clippingPlanes]);
  
  const tentacleMatFossil = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2c2825', roughness: 1, wireframe: true, clippingPlanes }), [clippingPlanes]);
  const tentacleMatAlive = useMemo(() => new THREE.MeshBasicMaterial({ color: '#00f0ff', transparent: true, opacity: 0.6, clippingPlanes }), [clippingPlanes]);

  const tentacleCount = 12;

  return (
    <group ref={groupRef}>
      {/* The Jellyfish Dome (Hemisphere) */}
      <mesh ref={domeRef} position={[0, 1, 0]}>
        <sphereGeometry args={[3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {isFossil ? <primitive object={fossilMat} attach="material" /> : <primitive object={aliveMat} attach="material" />}
        {isFossil && (
           <Edges threshold={15}>
             <lineBasicMaterial attach="material" color="#000000" clippingPlanes={clippingPlanes} />
           </Edges>
        )}
      </mesh>

      {/* The Internal Neural Core */}
      <mesh ref={coreRef} position={[0, 0.5, 0]}>
        <icosahedronGeometry args={[1, 1]} />
        {isFossil ? <primitive object={coreMatFossil} attach="material" /> : <primitive object={coreMatAlive} attach="material" />}
      </mesh>

      {/* The Tentacles */}
      <group ref={tentaclesRef} position={[0, 0, 0]}>
        {Array.from({ length: tentacleCount }).map((_, i) => {
          const angle = (i / tentacleCount) * Math.PI * 2;
          const radius = 2.5;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <group 
              key={i} 
              position={[x, 0, z]} 
              ref={(el) => { if (el) tentacleRefs.current[i] = el; }}
            >
              <mesh position={[0, -2.5, 0]}>
                <cylinderGeometry args={[0.05, 0.01, 6, 8]} />
                {isFossil ? <primitive object={tentacleMatFossil} attach="material" /> : <primitive object={tentacleMatAlive} attach="material" />}
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

// Master component managing the medium shift
export function NeuralJellyfish() {
  const { viewport } = useThree();
  const planeFossil = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);
  const planeAlive = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  
  useFrame((state) => {
    const mouseX = (state.pointer.x * viewport.width) / 2;
    planeFossil.constant = mouseX;
    planeAlive.constant = -mouseX;
  });

  return (
    <group position={[0, 0, -5]}>
      <JellyfishPart isFossil={true} clippingPlanes={[planeFossil]} />
      <JellyfishPart isFossil={false} clippingPlanes={[planeAlive]} />
    </group>
  );
}
