"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor, Html, Edges } from "@react-three/drei";
import * as THREE from "three";
import { useStore, ThemeMode } from "@/store/useStore";

const THEME_COLORS = {
  CYANOTYPE: { base: "#000000", edge: "#ffffff", transparent: true, emissive: "#ffffff", opacity: 0.0 },
  DRAFT: { base: "#f0ebdc", edge: "#111111", transparent: false, emissive: "#000000", opacity: 1.0 },
  CYBER: { base: "#111111", edge: "#00ffff", transparent: false, emissive: "#ff00ff", opacity: 1.0 }
};

export function Dragonfly() {
  const groupRef = useRef<THREE.Group>(null);
  const wingsRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  
  const playMechanicalClick = useStore((state) => state.playMechanicalClick);
  const activeTheme = useStore((state) => state.activeTheme);
  const cameraY = useStore((state) => state.cameraY);
  const t = THEME_COLORS[activeTheme];

  useCursor(hovered, "crosshair", "auto");

  // The Y position of this artifact in the shaft
  const artifactY = -35;
  // Explode if camera is near
  const isExploded = Math.abs(cameraY - artifactY) < 10 || active;

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.y = artifactY + Math.sin(state.clock.elapsedTime) * 0.5;
      
      if (isExploded) {
        groupRef.current.rotation.y += delta * 0.2;
      } else {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
      }
    }

    if (wingsRef.current) {
      const speed = isExploded ? 30 : 2;
      const flap = Math.sin(state.clock.elapsedTime * speed) * 0.5;
      
      wingsRef.current.children.forEach((wing, index) => {
        const direction = index < 2 ? 1 : -1;
        wing.rotation.z = flap * direction;
        
        // Explode outward
        const targetX = isExploded ? (index % 2 === 0 ? 0.5 : -0.5) : 0;
        wing.position.x = THREE.MathUtils.lerp(wing.position.x, targetX, 0.05);
      });
    }

    if (tailRef.current) {
      tailRef.current.children.forEach((segment, index) => {
        // Explode outward along Y axis of the tail (which is Z axis globally due to rotation)
        const targetY = isExploded ? -0.6 - index * 0.8 : -0.6 - index * 0.4;
        segment.position.y = THREE.MathUtils.lerp(segment.position.y, targetY, 0.1);
      });
    }
  });

  const handleClick = () => {
    playMechanicalClick();
    setActive(!active);
  };

  const cameraZ = useStore((state) => state.cameraZ);
  
  // Fade out HTML if camera is far
  const dist = Math.abs(cameraZ - (-15));
  const htmlOpacity = Math.max(0, 1 - (dist / 10));

  return (
    <group 
      ref={groupRef} 
      position={[0, artifactY, -15]} 
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      <Html position={[0, -3, 0]} center style={{ pointerEvents: 'none', opacity: htmlOpacity, transition: 'opacity 0.2s' }}>
        <div style={{
          color: t.edge,
          fontFamily: 'monospace',
          fontSize: '12px',
          border: `1px solid ${t.edge}`,
          padding: '8px',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: -3, left: -3, width: 6, height: 6, borderTop: `1px solid ${t.edge}`, borderLeft: `1px solid ${t.edge}` }} />
          <div style={{ position: 'absolute', top: -3, right: -3, width: 6, height: 6, borderTop: `1px solid ${t.edge}`, borderRight: `1px solid ${t.edge}` }} />
          <div style={{ position: 'absolute', bottom: -3, left: -3, width: 6, height: 6, borderBottom: `1px solid ${t.edge}`, borderLeft: `1px solid ${t.edge}` }} />
          <div style={{ position: 'absolute', bottom: -3, right: -3, width: 6, height: 6, borderBottom: `1px solid ${t.edge}`, borderRight: `1px solid ${t.edge}` }} />

          <div style={{ fontSize: '10px', opacity: 0.7, borderBottom: `1px dashed ${t.edge}`, paddingBottom: '4px', marginBottom: '4px' }}>
            ID: ARTIFACT_02 // (x,y,z): 0, {artifactY}, -15
          </div>
          <div style={{ fontSize: '18px', letterSpacing: '2px', fontWeight: 'bold' }}>
            AERO_DRONE
          </div>
          <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
            STATE: {isExploded ? '[ KINETIC ]' : '[ STATIC ]'}
          </div>
        </div>
      </Html>

      {/* Body / Tail */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* Core */}
        <mesh>
          <capsuleGeometry args={[0.2, 1, 4, 8]} />
          <meshStandardMaterial 
            color={t.base} 
            emissive={isExploded ? t.emissive : "#000000"} 
            transparent={t.transparent}
            opacity={t.opacity}
            metalness={0.1} roughness={0.9} 
          />
          <Edges color={t.edge} />
        </mesh>
        
        {/* Segmented Tail */}
        <group ref={tailRef}>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[0, -0.6 - i * 0.4, 0]}>
              <cylinderGeometry args={[0.1 - i * 0.015, 0.08 - i * 0.015, 0.3, 8]} />
              <meshStandardMaterial color={t.base} transparent={t.transparent} opacity={t.opacity} metalness={0.1} roughness={0.9} />
              <Edges color={activeTheme === 'DRAFT' ? '#ff0000' : t.edge} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Wings */}
      <group ref={wingsRef}>
        {/* Front Right */}
        <group position={[0.2, 0, 0.5]}>
          <mesh position={[1.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.3, 2.5, 4, 8]} />
            <meshStandardMaterial color={t.base} transparent={t.transparent} opacity={0.5} metalness={0.1} roughness={0.9} />
            <Edges color={activeTheme === 'CYBER' ? '#ff00ff' : t.edge} />
          </mesh>
        </group>
        {/* Front Left */}
        <group position={[-0.2, 0, 0.5]} rotation={[0, Math.PI, 0]}>
          <mesh position={[1.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.3, 2.5, 4, 8]} />
            <meshStandardMaterial color={t.base} transparent={t.transparent} opacity={0.5} metalness={0.1} roughness={0.9} />
            <Edges color={activeTheme === 'CYBER' ? '#ff00ff' : t.edge} />
          </mesh>
        </group>
        {/* Back Right */}
        <group position={[0.2, 0, -0.5]} rotation={[0, -0.2, 0]}>
          <mesh position={[1.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.25, 2, 4, 8]} />
            <meshStandardMaterial color={t.base} transparent={t.transparent} opacity={0.5} metalness={0.1} roughness={0.9} />
            <Edges color={t.edge} />
          </mesh>
        </group>
        {/* Back Left */}
        <group position={[-0.2, 0, -0.5]} rotation={[0, Math.PI + 0.2, 0]}>
          <mesh position={[1.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.25, 2, 4, 8]} />
            <meshStandardMaterial color={t.base} transparent={t.transparent} opacity={0.5} metalness={0.1} roughness={0.9} />
            <Edges color={t.edge} />
          </mesh>
        </group>
      </group>

    </group>
  );
}
