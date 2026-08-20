"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor, Html, Edges } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function Flower() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [discoveryState, setDiscoveryState] = useState(0); // 0: Base, 1: Blueprint, 2: Mechanical, 3: Exploded
  
  const globalExplosion = useStore((state) => state.globalExplosion);
  const playMechanicalClick = useStore((state) => state.playMechanicalClick);
  
  useCursor(hovered, "crosshair", "auto");

  // Mathematical procedural generation of petals
  const numPetals = 36; // Increased petal count for complexity
  const petals = useMemo(() => {
    const arr = [];
    for (let i = 0; i < numPetals; i++) {
      const angle = (i / numPetals) * Math.PI * 2;
      const radius = 1.2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      // We will create two layers of petals
      const isInner = i % 2 === 0;
      
      arr.push({ 
        basePosition: new THREE.Vector3(x * (isInner ? 0.8 : 1.2), y * (isInner ? 0.8 : 1.2), isInner ? 0.5 : 0),
        explodedPosition: new THREE.Vector3(x * (isInner ? 1.5 : 3), y * (isInner ? 1.5 : 3), Math.random() * 2 - 1),
        globalExplodedPosition: new THREE.Vector3(x * 6, y * 6, (Math.random() - 0.5) * 15),
        rotation: angle,
        isInner
      });
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.1;
      // If exploded (state >= 3) or global explosion, rotate faster/wilder
      if (discoveryState >= 3 || globalExplosion) {
        groupRef.current.rotation.x += delta * 0.2;
        groupRef.current.rotation.y += delta * 0.2;
      } else {
        // Lerp back to base rotation if returning
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.05);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
      }
    }
    
    if (coreRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * (discoveryState >= 3 || globalExplosion ? 5 : 2)) * 0.05;
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
      position={[0, 0, -10]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      
      {/* Dynamic Engineering Measurements Overlay */}
      <Html position={[2, 2, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          color: '#000000', // Black text
          fontFamily: 'monospace',
          fontSize: '10px',
          borderLeft: '1px solid #FF0000', // Red accent
          paddingLeft: '10px',
          opacity: discoveryState >= 1 ? 1 : 0,
          transition: 'opacity 0.5s',
          whiteSpace: 'nowrap',
          textShadow: '0 0 2px #ffffff'
        }}>
          RAD: 1.204m<br/>
          CORE: {discoveryState >= 3 ? 'CRITICAL' : 'STABLE'}<br/>
          FRQ: {(1.61803398875).toFixed(4)} Hz<br/>
          STATUS: {discoveryState === 0 ? 'DORMANT' : 'ACTIVE'}
        </div>
      </Html>

      {/* The Core Engine */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.5, 2]} />
        <meshStandardMaterial 
          color="#ffffff" // Stark white
          transparent 
          opacity={0.8} 
          metalness={0.1}
          roughness={0.9}
        />
        <Edges color="black" />
      </mesh>
      
      <mesh>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive={discoveryState >= 2 ? "#FF0000" : "#000000"} 
          emissiveIntensity={discoveryState >= 3 ? 2 : 0.5} 
        />
        <Edges color={discoveryState >= 2 ? "#FF0000" : "black"} />
      </mesh>
      
      {/* Procedural Gears in Core */}
      <Gear radius={0.8} teeth={16} speed={1} discoveryState={discoveryState} globalExplosion={globalExplosion} />
      <Gear radius={0.6} teeth={12} speed={-1.5} discoveryState={discoveryState} globalExplosion={globalExplosion} zOffset={0.2} />
      <Gear radius={1.0} teeth={24} speed={0.5} discoveryState={discoveryState} globalExplosion={globalExplosion} zOffset={-0.2} />

      {/* The Mechanical Petals */}
      {petals.map((petal, i) => {
        // We use a small nested component to handle individual petal lerping safely
        return <Petal key={i} petal={petal} discoveryState={discoveryState} />;
      })}

      {/* Sacred Geometry Overlays */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.01, 16, 64]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={discoveryState >= 1 ? 0.8 : 0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.01, 16, 64]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={discoveryState >= 1 ? 0.4 : 0.1} />
      </mesh>
    </group>
  );
}

// Sub-component to manage individual petal lerping without massive re-renders
function Petal({ petal, discoveryState }: { petal: any, discoveryState: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const globalExplosion = useStore((state) => state.globalExplosion);
  
  useFrame(() => {
    if (meshRef.current) {
      let targetPos = petal.basePosition;
      if (globalExplosion) {
        targetPos = petal.globalExplodedPosition;
      } else if (discoveryState >= 3) {
        targetPos = petal.explodedPosition;
      }
      meshRef.current.position.lerp(targetPos, 0.05);
    }
  });

  return (
    <group ref={meshRef} position={petal.basePosition} rotation={[0, 0, petal.rotation]}>
      <mesh>
        <capsuleGeometry args={[0.1, 1, 4, 8]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive={discoveryState >= 2 ? "#FF0000" : "#000000"} // Crimson Red emissive
          emissiveIntensity={0.5}
          metalness={0.1}
          roughness={0.9}
        />
        <Edges color="black" />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <capsuleGeometry args={[0.02, 1.1, 4, 4]} />
        <meshStandardMaterial 
          color="#111111" // Black line
          metalness={0.1} 
          roughness={0.9} 
        />
        <Edges color={discoveryState >= 2 ? "#00FF00" : "black"} />
      </mesh>
    </group>
  );
}

// Procedural Gear Component
function Gear({ radius, teeth, speed, discoveryState, globalExplosion, zOffset = 0 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      if (globalExplosion || discoveryState >= 3) {
        meshRef.current.rotation.z += delta * speed * 5;
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, zOffset + (Math.random() - 0.5) * 5, 0.05);
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
        color="#ffffff"
        emissive={discoveryState >= 2 ? "#00FF00" : "#000000"} // Emerald Green emissive
        transparent
        opacity={0.8}
        metalness={0.1}
        roughness={0.9}
      />
      <Edges color="black" />
    </mesh>
  );
}
