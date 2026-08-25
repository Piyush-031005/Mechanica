"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll, Edges, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

export function MechanicalAssembly() {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const topCapRef = useRef<THREE.Mesh>(null);
  const bottomCapRef = useRef<THREE.Mesh>(null);
  const swarmRef = useRef<THREE.Points>(null);

  // Connection lines that scale based on scroll
  const topLaserRef = useRef<THREE.Mesh>(null);
  const bottomLaserRef = useRef<THREE.Mesh>(null);

  // Generate the Orbital Swarm Particles
  const swarmCount = 5000;
  const [swarmPositions, swarmColors] = useMemo(() => {
    const pos = new Float32Array(swarmCount * 3);
    const col = new Float32Array(swarmCount * 3);
    const color = new THREE.Color();
    
    for (let i = 0; i < swarmCount; i++) {
      // Create a dense disc/spherical hybrid swarm
      const r = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 1.5; // Flattened sphere (disc-like)
      
      pos[i * 3] = r * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = r * Math.sin(phi);
      pos[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);
      
      // Mix Cyan and Crimson for the swarm
      color.lerpColors(new THREE.Color('#00f0ff'), new THREE.Color('#ff003c'), Math.random() > 0.8 ? 1 : 0);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, []);

  useFrame((state, delta) => {
    // scroll.offset is 0 at top, 1 at bottom of scrollable area
    const offset = scroll.offset; 

    if (groupRef.current) {
      // Slowly rotate by default, spin wildly as you scroll
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1 + offset * Math.PI * 4;
      // Tilt the assembly to show the exploded view better
      groupRef.current.rotation.x = THREE.MathUtils.lerp(0, Math.PI / 4, offset);
    }

    // --- EXPLODED VIEW KINEMATICS ---
    
    if (outerRingRef.current) {
      // Ring expands outward on Y axis
      outerRingRef.current.position.y = THREE.MathUtils.lerp(0, 5, offset);
      outerRingRef.current.rotation.x = state.clock.elapsedTime * 0.5;
    }
    
    if (innerRingRef.current) {
      innerRingRef.current.position.y = THREE.MathUtils.lerp(0, -5, offset);
      innerRingRef.current.rotation.z = state.clock.elapsedTime * -0.5;
    }
    
    if (topCapRef.current) {
      topCapRef.current.position.y = THREE.MathUtils.lerp(1.2, 7, offset);
    }
    
    if (bottomCapRef.current) {
      bottomCapRef.current.position.y = THREE.MathUtils.lerp(-1.2, -7, offset);
    }
    
    if (coreRef.current) {
      // Core pulses rapidly when exploded
      const pulseSpeed = THREE.MathUtils.lerp(1, 10, offset);
      const scale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.05;
      coreRef.current.scale.set(scale, scale, scale);
    }

    if (swarmRef.current) {
      // Swarm rotates and expands dramatically on scroll
      swarmRef.current.rotation.y = state.clock.elapsedTime * 0.2 + offset * Math.PI * 2;
      swarmRef.current.rotation.x = state.clock.elapsedTime * -0.1;
      
      const swarmExpand = THREE.MathUtils.lerp(1, 2.5, offset);
      swarmRef.current.scale.set(swarmExpand, swarmExpand, swarmExpand);
    }

    // Scale lasers to connect the pieces
    if (topLaserRef.current && topCapRef.current) {
       const dist = topCapRef.current.position.y - 1.2;
       topLaserRef.current.scale.y = Math.max(0.001, dist);
       topLaserRef.current.position.y = 1.2 + (dist / 2);
    }
    if (bottomLaserRef.current && bottomCapRef.current) {
       const dist = Math.abs(bottomCapRef.current.position.y + 1.2);
       bottomLaserRef.current.scale.y = Math.max(0.001, dist);
       bottomLaserRef.current.position.y = -1.2 - (dist / 2);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3D Blueprint Axes fixed to the group */}
      <axesHelper args={[4]} />

      {/* The Crazy Orbital Swarm */}
      <points ref={swarmRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={swarmPositions.length / 3}
            array={swarmPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={swarmColors.length / 3}
            array={swarmColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Central Quantum Glass Core - Upgraded Geometry */}
      <mesh ref={coreRef}>
        {/* Using a higher-poly geometry for better glass refractions */}
        <sphereGeometry args={[1.2, 32, 32]} />
        <MeshTransmissionMaterial
          backside
          samples={6}
          resolution={512}
          thickness={2.5}
          chromaticAberration={0.8}
          anisotropy={1}
          color="#ffffff"
          attenuationDistance={5}
          attenuationColor="#ff003c"
          roughness={0.05}
          ior={1.45}
          clearcoat={1}
        />
        {/* Geometric wireframe overlay on the glass core */}
        <Edges scale={1.02} color="#00f0ff" threshold={15} />
      </mesh>

      {/* Outer Technical Ring */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.5, 0.05, 16, 100]} />
        <meshPhysicalMaterial color="#111111" metalness={1} roughness={0.2} />
        <Edges color="#ff003c" />
        {/* Orbital nodes on the ring */}
        <mesh position={[3.5, 0, 0]}>
            <sphereGeometry args={[0.2, 16, 16]}/>
            <meshBasicMaterial color="#ff003c" />
        </mesh>
      </mesh>

      {/* Inner Technical Ring */}
      <mesh ref={innerRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.02, 16, 100]} />
        <meshPhysicalMaterial color="#111111" metalness={1} roughness={0.2} />
        <Edges color="#00f0ff" />
      </mesh>
      
      {/* Top Cap Component */}
      <mesh ref={topCapRef} position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.5, 0.8, 0.4, 32]} />
        <meshPhysicalMaterial color="#111111" metalness={1} roughness={0.5} wireframe />
        <Edges color="#ff003c" />
      </mesh>

      {/* Bottom Cap Component */}
      <mesh ref={bottomCapRef} position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.8, 0.5, 0.4, 32]} />
        <meshPhysicalMaterial color="#111111" metalness={1} roughness={0.5} wireframe />
        <Edges color="#00f0ff" />
      </mesh>

      {/* Connecting Laser Lines (Visible when exploded) */}
      <mesh ref={topLaserRef}>
        <cylinderGeometry args={[0.02, 1, 8]} />
        <meshBasicMaterial color="#ff003c" transparent opacity={0.5} />
      </mesh>
      <mesh ref={bottomLaserRef}>
        <cylinderGeometry args={[0.02, 1, 8]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
