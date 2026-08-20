"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor, Html } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function Dragonfly() {
  const groupRef = useRef<THREE.Group>(null);
  const wingsRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  
  const playMechanicalClick = useStore((state) => state.playMechanicalClick);
  const globalExplosion = useStore((state) => state.globalExplosion);

  useCursor(hovered, "crosshair", "auto");

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Hover floating effect
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
      
      if (active || globalExplosion) {
        groupRef.current.rotation.y += delta * 0.2;
      } else {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
      }
    }

    if (wingsRef.current) {
      // Flapping logic
      const speed = active || globalExplosion ? 30 : 2;
      const flap = Math.sin(state.clock.elapsedTime * speed) * 0.5;
      
      // We have 4 wings inside wingsRef
      wingsRef.current.children.forEach((wing, index) => {
        // Top wings flap up, bottom wings flap down slightly offset
        const direction = index < 2 ? 1 : -1;
        wing.rotation.z = flap * direction;
      });
    }
  });

  const handleClick = () => {
    playMechanicalClick();
    setActive(!active);
  };

  return (
    <group 
      ref={groupRef} 
      position={[0, 0, -35]} 
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      <Html position={[0, -2, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          color: '#00ffff',
          fontFamily: 'monospace',
          fontSize: '10px',
          textAlign: 'center',
          opacity: active ? 1 : 0.2,
          transition: 'opacity 0.5s',
          whiteSpace: 'nowrap'
        }}>
          AERO-DRONE Mk-I<br/>
          {active ? 'SYSTEMS ONLINE' : 'HIBERNATION'}
        </div>
      </Html>

      {/* Body / Tail */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* Core */}
        <mesh>
          <capsuleGeometry args={[0.2, 1, 4, 8]} />
          <meshStandardMaterial color="#021B30" emissive="#005577" wireframe={!active} metalness={0.8} />
        </mesh>
        
        {/* Segmented Tail */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, -0.6 - i * 0.4, 0]}>
            <cylinderGeometry args={[0.1 - i * 0.015, 0.08 - i * 0.015, 0.3, 8]} />
            <meshStandardMaterial color="#00ffff" wireframe transparent opacity={0.6} />
          </mesh>
        ))}
      </group>

      {/* Wings */}
      <group ref={wingsRef}>
        {/* Front Right */}
        <group position={[0.2, 0, 0.5]}>
          <mesh position={[1.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.3, 2.5, 4, 8]} />
            <meshStandardMaterial color="#00ffff" wireframe transparent opacity={0.3} />
          </mesh>
        </group>
        {/* Front Left */}
        <group position={[-0.2, 0, 0.5]} rotation={[0, Math.PI, 0]}>
          <mesh position={[1.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.3, 2.5, 4, 8]} />
            <meshStandardMaterial color="#00ffff" wireframe transparent opacity={0.3} />
          </mesh>
        </group>
        {/* Back Right */}
        <group position={[0.2, 0, -0.5]} rotation={[0, -0.2, 0]}>
          <mesh position={[1.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.25, 2, 4, 8]} />
            <meshStandardMaterial color="#00ffff" wireframe transparent opacity={0.2} />
          </mesh>
        </group>
        {/* Back Left */}
        <group position={[-0.2, 0, -0.5]} rotation={[0, Math.PI + 0.2, 0]}>
          <mesh position={[1.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.25, 2, 4, 8]} />
            <meshStandardMaterial color="#00ffff" wireframe transparent opacity={0.2} />
          </mesh>
        </group>
      </group>

    </group>
  );
}
