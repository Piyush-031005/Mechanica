"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Html, Edges } from "@react-three/drei";
import { useStore } from "@/store/useStore";

const THEME_COLORS = {
  CYANOTYPE: { base: "#000000", edge: "#ffffff", transparent: true, emissive: "#ffffff", opacity: 0.0 },
  DRAFT: { base: "#f0ebdc", edge: "#111111", transparent: false, emissive: "#000000", opacity: 1.0 },
  CYBER: { base: "#111111", edge: "#00ffff", transparent: false, emissive: "#ff00ff", opacity: 1.0 }
};

export function Owl() {
  const headRef = useRef<THREE.Group>(null);
  const armorRef = useRef<THREE.Group>(null);
  const [mousePos, setMousePos] = useState(new THREE.Vector2());
  const { viewport } = useThree();

  const activeTheme = useStore((state) => state.activeTheme);
  const cameraY = useStore((state) => state.cameraY);
  const t = THEME_COLORS[activeTheme];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos(new THREE.Vector2(x, y));
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const artifactY = -55; // positioned deeper in shaft
  const isExploded = Math.abs(cameraY - artifactY) < 10;

  useFrame((state, delta) => {
    if (headRef.current) {
      // Lerp the head rotation to look at the mouse
      const targetRotationX = isExploded ? -0.5 : -mousePos.y * 0.5;
      const targetRotationY = isExploded ? Math.sin(state.clock.elapsedTime * 2) * 0.5 : mousePos.x * 0.8;
      
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotationX, 0.05);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotationY, 0.05);
      
      // Explode head upward
      const targetY = isExploded ? 3.5 : 2.5;
      headRef.current.position.y = THREE.MathUtils.lerp(headRef.current.position.y, targetY, 0.05);
    }

    if (armorRef.current) {
      armorRef.current.children.forEach((plate, i) => {
        // Explode armor plates outward radially
        const angle = i * 0.5 + state.clock.elapsedTime;
        const radius = isExploded ? 0.5 : 0;
        const targetX = Math.cos(angle) * radius;
        const targetZ = Math.sin(angle) * radius;
        
        plate.position.x = THREE.MathUtils.lerp(plate.position.x, targetX, 0.05);
        plate.position.z = THREE.MathUtils.lerp(plate.position.z, targetZ, 0.05);
        
        if (isExploded) {
          plate.rotation.y += delta;
        }
      });
    }
  });

  const cameraZ = useStore((state) => state.cameraZ);
  
  // Fade out HTML if camera is far
  const dist = Math.abs(cameraZ - (-55));
  const htmlOpacity = Math.max(0, 1 - (dist / 10));

  return (
    <group position={[0, artifactY, -15]}>
      <Html position={[0, 5, 0]} center style={{ pointerEvents: 'none', opacity: htmlOpacity, transition: 'opacity 0.2s' }}>
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
            ID: ARTIFACT_03 // (x,y,z): 0, {artifactY}, -15
          </div>
          <div style={{ fontSize: '18px', letterSpacing: '2px', fontWeight: 'bold' }}>
            NIGHT_WATCH
          </div>
          <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
            STATE: {isExploded ? '[ EXPLODED ]' : '[ TRACKING ]'}
          </div>
        </div>
      </Html>

      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1, 1.5, 3, 16]} />
        <meshStandardMaterial 
          color={t.base} 
          transparent={t.transparent} 
          opacity={t.opacity} 
          metalness={0.1} 
          roughness={0.9} 
        />
        <Edges color={t.edge} />
      </mesh>
      
      {/* Armor Plates on Body */}
      <group ref={armorRef}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[0, 0.5 - (i * 0.3), 0]} rotation={[0.1, i * 0.5, 0]}>
            <cylinderGeometry args={[1.1 + (i * 0.05), 1.2 + (i * 0.05), 0.2, 8]} />
            <meshStandardMaterial 
              color={t.base} 
              transparent={t.transparent} 
              opacity={t.opacity} 
              metalness={0.1} 
              roughness={0.9} 
            />
            <Edges color={activeTheme === 'DRAFT' ? '#ff0000' : t.edge} />
          </mesh>
        ))}
      </group>

      {/* Head */}
      <group ref={headRef} position={[0, 2.5, 0]}>
        {/* Dome */}
        <mesh>
          <sphereGeometry args={[1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={t.base} transparent={t.transparent} opacity={t.opacity} metalness={0.1} roughness={0.9} />
          <Edges color={t.edge} />
        </mesh>
        
        {/* Base of Head */}
        <mesh rotation={[Math.PI, 0, 0]}>
           <sphereGeometry args={[1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
           <meshStandardMaterial color={t.base} transparent={t.transparent} opacity={t.opacity} metalness={0.1} roughness={0.9} />
           <Edges color={t.edge} />
        </mesh>

        {/* Left Eye (Lens) */}
        <group position={[-0.4, 0.2, 1.1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color={t.base} transparent={t.transparent} opacity={0.5} metalness={0.9} roughness={0.1} />
            <Edges color={t.edge} />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive={isExploded ? t.emissive : "#ff0000"} emissiveIntensity={2} />
          </mesh>
        </group>
        
        {/* Right Eye (Lens) */}
        <group position={[0.4, 0.2, 1.1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color={t.base} transparent={t.transparent} opacity={0.5} metalness={0.9} roughness={0.1} />
            <Edges color={t.edge} />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive={isExploded ? t.emissive : "#ff0000"} emissiveIntensity={2} />
          </mesh>
        </group>
        
        {/* Beak Mechanism */}
        <mesh position={[0, -0.3, 1.2]} rotation={[Math.PI / 4, 0, 0]}>
          <coneGeometry args={[0.2, 0.5, 4]} />
          <meshStandardMaterial color={t.base} transparent={t.transparent} opacity={t.opacity} metalness={0.1} roughness={0.9} />
          <Edges color={activeTheme === 'CYBER' ? '#ff00ff' : t.edge} />
        </mesh>
      </group>
      
    </group>
  );
}
