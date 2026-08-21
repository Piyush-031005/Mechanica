"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor, Html, Edges } from "@react-three/drei";
import * as THREE from "three";
import { useStore, ThemeMode } from "@/store/useStore";

const THEME_COLORS = {
  CYANOTYPE: { base: "#000000", edge: "#ffffff", transparent: true, emissive: "#ffffff", opacity: 0.0 },
  DRAFT: { base: "#f0ebdc", edge: "#111111", transparent: false, emissive: "#000000", opacity: 1.0 },
  CYBER: { base: "#111111", edge: "#00ffff", transparent: false, emissive: "#ff00ff", opacity: 1.0 }
};

export function Flower() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [discoveryState, setDiscoveryState] = useState(0); 
  
  const playMechanicalClick = useStore((state) => state.playMechanicalClick);
  const activeTheme = useStore((state) => state.activeTheme);
  const cameraY = useStore((state) => state.cameraY);
  const t = THEME_COLORS[activeTheme];

  useCursor(hovered, "crosshair", "auto");

  // The Y position of this artifact in the shaft
  const artifactY = -15;
  // If camera is close on Y axis, trigger isometric exploded view
  const isExploded = Math.abs(cameraY - artifactY) < 10 || discoveryState >= 3;

  const numPetals = 36;
  const petals = useMemo(() => {
    const arr = [];
    for (let i = 0; i < numPetals; i++) {
      const angle = (i / numPetals) * Math.PI * 2;
      const radius = 1.2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const isInner = i % 2 === 0;
      arr.push({ 
        basePosition: new THREE.Vector3(x * (isInner ? 0.8 : 1.2), y * (isInner ? 0.8 : 1.2), isInner ? 0.5 : 0),
        explodedPosition: new THREE.Vector3(x * (isInner ? 2.5 : 4.0), y * (isInner ? 2.5 : 4.0), isInner ? 1.5 : -1.5),
        rotation: angle,
        isInner
      });
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.1;
      if (isExploded) {
        groupRef.current.rotation.x += delta * 0.2;
        groupRef.current.rotation.y += delta * 0.2;
      } else {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.05);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
      }
    }
    
    if (coreRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * (isExploded ? 5 : 2)) * 0.05;
      coreRef.current.scale.set(scale, scale, scale);
    }
  });

  const handleClick = () => {
    playMechanicalClick();
    setDiscoveryState((prev) => (prev + 1) % 4);
  };

  return (
    <group 
      ref={groupRef} 
      position={[0, artifactY, -15]} // Positioned in the shaft
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      
      <Html position={[2, 2, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          color: t.edge,
          fontFamily: 'monospace',
          fontSize: '10px',
          borderLeft: `1px solid ${activeTheme === 'DRAFT' ? '#ff0000' : t.edge}`,
          paddingLeft: '10px',
          opacity: 0.8,
          whiteSpace: 'nowrap',
          textTransform: 'uppercase'
        }}>
          ARTIFACT_01 // THE FLOWER<br/>
          STATE: {isExploded ? 'EXPLODED_VIEW' : 'ASSEMBLED'}<br/>
          THEME: {activeTheme}
        </div>
      </Html>

      {/* The Core Engine */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.5, 2]} />
        <meshStandardMaterial 
          color={t.base}
          transparent={t.transparent}
          opacity={t.opacity}
          metalness={0.1}
          roughness={0.9}
        />
        <Edges color={t.edge} />
      </mesh>
      
      <mesh>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial 
          color={t.base}
          emissive={isExploded ? t.emissive : "#000000"} 
          emissiveIntensity={isExploded ? 2 : 0} 
        />
        <Edges color={activeTheme === 'DRAFT' ? '#ff0000' : t.edge} />
      </mesh>
      
      {/* Procedural Gears in Core */}
      <Gear radius={0.8} teeth={16} speed={1} isExploded={isExploded} zOffset={0} t={t} />
      <Gear radius={0.6} teeth={12} speed={-1.5} isExploded={isExploded} zOffset={0.2} t={t} />
      <Gear radius={1.0} teeth={24} speed={0.5} isExploded={isExploded} zOffset={-0.2} t={t} />

      {/* The Mechanical Petals */}
      {petals.map((petal, i) => (
        <Petal key={i} petal={petal} isExploded={isExploded} t={t} activeTheme={activeTheme} />
      ))}
    </group>
  );
}

function Petal({ petal, isExploded, t, activeTheme }: { petal: any, isExploded: boolean, t: any, activeTheme: ThemeMode }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      let targetPos = isExploded ? petal.explodedPosition : petal.basePosition;
      meshRef.current.position.lerp(targetPos, 0.05);
    }
  });

  return (
    <group ref={meshRef} position={petal.basePosition} rotation={[0, 0, petal.rotation]}>
      <mesh>
        <capsuleGeometry args={[0.1, 1, 4, 8]} />
        <meshStandardMaterial 
          color={t.base}
          transparent={t.transparent}
          opacity={t.opacity}
          metalness={0.1}
          roughness={0.9}
        />
        <Edges color={t.edge} />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <capsuleGeometry args={[0.02, 1.1, 4, 4]} />
        <meshStandardMaterial 
          color={t.base}
          transparent={t.transparent}
          opacity={t.opacity}
          metalness={0.1}
          roughness={0.9} 
        />
        <Edges color={activeTheme === 'CYBER' ? '#ff00ff' : t.edge} />
      </mesh>
    </group>
  );
}

function Gear({ radius, teeth, speed, isExploded, zOffset = 0, t }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      if (isExploded) {
        meshRef.current.rotation.z += delta * speed * 5;
        // Move outward on Z for exploded view
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, zOffset + Math.sign(zOffset) * 2.0, 0.05);
      } else {
        meshRef.current.rotation.z += delta * speed;
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, zOffset, 0.1);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, zOffset]}>
      <cylinderGeometry args={[radius, radius, 0.1, teeth * 2, 1, false]} />
      <meshStandardMaterial 
        color={t.base}
        transparent={t.transparent}
        opacity={t.opacity}
        metalness={0.1}
        roughness={0.9}
      />
      <Edges color={t.edge} />
    </mesh>
  );
}
