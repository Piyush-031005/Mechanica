"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, Edges } from "@react-three/drei";
import * as THREE from "three";

// The core assembly component, instantiated twice (once for sketch, once for reality)
function AssemblyPart({ isSketch, clippingPlanes }: { isSketch: boolean, clippingPlanes: THREE.Plane[] }) {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const topCapRef = useRef<THREE.Mesh>(null);
  const bottomCapRef = useRef<THREE.Mesh>(null);
  const swarmRef = useRef<THREE.Points>(null);
  const topLaserRef = useRef<THREE.Mesh>(null);
  const bottomLaserRef = useRef<THREE.Mesh>(null);

  // Generate the Orbital Swarm Particles
  const swarmCount = isSketch ? 1000 : 5000; // Sketch has fewer particles like dust
  const [swarmPositions, swarmColors] = useMemo(() => {
    const pos = new Float32Array(swarmCount * 3);
    const col = new Float32Array(swarmCount * 3);
    const color = new THREE.Color();
    
    for (let i = 0; i < swarmCount; i++) {
      const r = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * 1.5; 
      
      pos[i * 3] = r * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = r * Math.sin(phi);
      pos[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);
      
      if (isSketch) {
        color.set('#2c2825'); // Ink color for sketch
      } else {
        color.lerpColors(new THREE.Color('#00f0ff'), new THREE.Color('#ff003c'), Math.random() > 0.8 ? 1 : 0);
      }
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, [isSketch]);

  useFrame((state) => {
    const offset = scroll.offset; 
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1 + offset * Math.PI * 4;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(0, Math.PI / 4, offset);
    }
    
    if (outerRingRef.current) {
      outerRingRef.current.position.y = THREE.MathUtils.lerp(0, 5, offset);
      outerRingRef.current.rotation.x = time * 0.5;
    }
    
    if (innerRingRef.current) {
      innerRingRef.current.position.y = THREE.MathUtils.lerp(0, -5, offset);
      innerRingRef.current.rotation.z = time * -0.5;
    }
    
    if (topCapRef.current) topCapRef.current.position.y = THREE.MathUtils.lerp(1.2, 7, offset);
    if (bottomCapRef.current) bottomCapRef.current.position.y = THREE.MathUtils.lerp(-1.2, -7, offset);
    
    if (coreRef.current) {
      const pulseSpeed = THREE.MathUtils.lerp(1, 10, offset);
      const scale = 1 + Math.sin(time * pulseSpeed) * 0.05;
      coreRef.current.scale.set(scale, scale, scale);
    }

    if (swarmRef.current) {
      swarmRef.current.rotation.y = time * 0.2 + offset * Math.PI * 2;
      swarmRef.current.rotation.x = time * -0.1;
      const swarmExpand = THREE.MathUtils.lerp(1, 2.5, offset);
      swarmRef.current.scale.set(swarmExpand, swarmExpand, swarmExpand);
    }

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

  const sketchMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#2c2825', wireframe: true, clippingPlanes }), [clippingPlanes]);
  const inkEdges = isSketch ? '#2c2825' : '#00f0ff';
  const redEdges = isSketch ? '#a31a1a' : '#ff003c';

  return (
    <group ref={groupRef}>
      {/* Blueprint Axes */}
      <axesHelper args={[4]} material={new THREE.LineBasicMaterial({ clippingPlanes, transparent: true, opacity: 0.3 })} />

      {/* Particle Swarm */}
      <points ref={swarmRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[swarmPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[swarmColors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={isSketch ? 0.01 : 0.02} vertexColors transparent opacity={0.6} sizeAttenuation blending={isSketch ? THREE.NormalBlending : THREE.AdditiveBlending} depthWrite={false} clippingPlanes={clippingPlanes} />
      </points>

      {/* Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        {isSketch ? (
          <meshBasicMaterial color="#f0eadd" transparent opacity={0.8} clippingPlanes={clippingPlanes} />
        ) : (
          <meshPhysicalMaterial 
            transmission={1} 
            thickness={2.5} 
            roughness={0.05} 
            ior={1.45} 
            clearcoat={1} 
            color="#ffffff" 
            attenuationDistance={5} 
            attenuationColor="#ff003c" 
            clippingPlanes={clippingPlanes} 
          />
        )}
        <Edges scale={1.02} threshold={15}>
          <lineBasicMaterial attach="material" color={inkEdges} clippingPlanes={clippingPlanes} />
        </Edges>
      </mesh>

      {/* Rings */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.5, 0.05, 16, 100]} />
        {isSketch ? <primitive object={sketchMat} attach="material" /> : <meshPhysicalMaterial color="#111111" metalness={1} roughness={0.2} clippingPlanes={clippingPlanes} />}
        <Edges>
          <lineBasicMaterial attach="material" color={redEdges} clippingPlanes={clippingPlanes} />
        </Edges>
      </mesh>
      <mesh ref={innerRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.02, 16, 100]} />
        {isSketch ? <primitive object={sketchMat} attach="material" /> : <meshPhysicalMaterial color="#111111" metalness={1} roughness={0.2} clippingPlanes={clippingPlanes} />}
        <Edges>
          <lineBasicMaterial attach="material" color={inkEdges} clippingPlanes={clippingPlanes} />
        </Edges>
      </mesh>
      
      {/* Caps */}
      <mesh ref={topCapRef} position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.5, 0.8, 0.4, 32]} />
        {isSketch ? <primitive object={sketchMat} attach="material" /> : <meshPhysicalMaterial color="#111111" metalness={1} roughness={0.5} wireframe clippingPlanes={clippingPlanes} />}
        <Edges>
          <lineBasicMaterial attach="material" color={redEdges} clippingPlanes={clippingPlanes} />
        </Edges>
      </mesh>
      <mesh ref={bottomCapRef} position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.8, 0.5, 0.4, 32]} />
        {isSketch ? <primitive object={sketchMat} attach="material" /> : <meshPhysicalMaterial color="#111111" metalness={1} roughness={0.5} wireframe clippingPlanes={clippingPlanes} />}
        <Edges>
          <lineBasicMaterial attach="material" color={inkEdges} clippingPlanes={clippingPlanes} />
        </Edges>
      </mesh>

      {/* Lasers */}
      <mesh ref={topLaserRef}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshBasicMaterial color={redEdges} transparent opacity={isSketch ? 0.2 : 0.5} clippingPlanes={clippingPlanes} />
      </mesh>
      <mesh ref={bottomLaserRef}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshBasicMaterial color={inkEdges} transparent opacity={isSketch ? 0.2 : 0.5} clippingPlanes={clippingPlanes} />
      </mesh>
    </group>
  );
}

// The master component that manages the clipping planes and renders both realities
export function MechanicalAssembly() {
  const { viewport } = useThree();
  
  // Normal points left [-1, 0, 0], so it clips everything to the right of the plane
  const planeSketch = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);
  // Normal points right [1, 0, 0], so it clips everything to the left of the plane
  const planeReality = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  
  const splitLineRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    // Convert normalized device coordinates (-1 to 1) to world units
    const mouseX = (state.pointer.x * viewport.width) / 2;
    
    // Update clipping planes to follow the mouse
    planeSketch.constant = mouseX;
    planeReality.constant = -mouseX;

    // Move the glowing red split line
    if (splitLineRef.current) {
      splitLineRef.current.position.x = mouseX;
    }
  });

  return (
    <>
      <AssemblyPart isSketch={true} clippingPlanes={[planeSketch]} />
      <AssemblyPart isSketch={false} clippingPlanes={[planeReality]} />
      
      {/* The Reality Splitter Line */}
      <mesh ref={splitLineRef} position={[0, 0, 2]}>
        <planeGeometry args={[0.02, 20]} />
        <meshBasicMaterial color="#ff003c" transparent opacity={0.8} />
      </mesh>
    </>
  );
}
