"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor, Html, Edges } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

const THEME_COLORS = {
  CYANOTYPE: { base: "#000000", edge: "#ffffff", transparent: true, emissive: "#ffffff", opacity: 0.0 },
  DRAFT: { base: "#f0ebdc", edge: "#111111", transparent: false, emissive: "#000000", opacity: 1.0 },
  CYBER: { base: "#111111", edge: "#00ffff", transparent: false, emissive: "#ff00ff", opacity: 1.0 }
};

export function Dragonfly() {
  const groupRef = useRef<THREE.Group>(null);
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  
  const playMechanicalClick = useStore((state) => state.playMechanicalClick);
  const activeTheme = useStore((state) => state.activeTheme);
  const cameraY = useStore((state) => state.cameraY);
  const cameraZ = useStore((state) => state.cameraZ);
  const t = THEME_COLORS[activeTheme];

  useCursor(hovered, "crosshair", "auto");

  const artifactY = -35;
  const isExploded = Math.abs(cameraY - artifactY) < 10 || active;

  const dist = Math.abs(cameraZ - (-15));
  const htmlOpacity = Math.max(0, 1 - (dist / 10));

  const numParticles = 1000;

  // Initialize particle states
  const particles = useMemo(() => {
    return Array.from({ length: numParticles }, () => ({
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10,
      vx: 0, vy: 0, vz: 0,
      scale: 0.1 + Math.random() * 0.2
    }));
  }, []);

  const tempObj = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.y = artifactY + Math.sin(state.clock.elapsedTime) * 0.5;
      groupRef.current.rotation.y += delta * 0.1;
    }

    if (instancedRef.current) {
      const time = state.clock.elapsedTime;
      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];
        
        if (isExploded) {
          // Lorenz Attractor style chaos
          const dx = 10 * (p.y - p.x);
          const dy = p.x * (28 - p.z) - p.y;
          const dz = p.x * p.y - (8/3) * p.z;
          
          p.vx += dx * 0.0005;
          p.vy += dy * 0.0005;
          p.vz += dz * 0.0005;
          
          // Damping
          p.vx *= 0.95; p.vy *= 0.95; p.vz *= 0.95;
        } else {
          // Figure 8 infinity loop (hibernation pattern)
          const angle = time * 2 + i * 0.01;
          const targetX = Math.sin(angle) * 5;
          const targetY = Math.sin(angle * 2) * 2;
          const targetZ = Math.cos(angle) * 5;
          
          p.vx += (targetX - p.x) * 0.01;
          p.vy += (targetY - p.y) * 0.01;
          p.vz += (targetZ - p.z) * 0.01;
          
          // Heavier damping to keep shape tight
          p.vx *= 0.9; p.vy *= 0.9; p.vz *= 0.9;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        tempObj.position.set(p.x, p.y, p.z);
        // Point in direction of velocity
        if (p.vx !== 0 || p.vy !== 0 || p.vz !== 0) {
           tempObj.lookAt(p.x + p.vx, p.y + p.vy, p.z + p.vz);
        }
        
        const s = p.scale * (isExploded ? 2 : 1);
        tempObj.scale.set(s, s * 4, s); // Stretched along velocity
        tempObj.updateMatrix();
        instancedRef.current.setMatrixAt(i, tempObj.matrix);
      }
      instancedRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const handleClick = () => {
    playMechanicalClick();
    setActive(!active);
  };

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
            ID: ARTIFACT_02 // (x,y,z): 0, {artifactY}, -15<br/>
            PARTICLES: {numParticles} // CHAOS_MATH
          </div>
          <div style={{ fontSize: '18px', letterSpacing: '2px', fontWeight: 'bold' }}>
            AERO_DRONE_SWARM
          </div>
          <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
            STATE: {isExploded ? '[ LORENZ_ATTRACTOR ]' : '[ INFINITY_LOOP ]'}
          </div>
        </div>
      </Html>

      <instancedMesh ref={instancedRef} args={[undefined, undefined, numParticles]}>
        <coneGeometry args={[1, 3, 3]} />
        <meshStandardMaterial color={t.base} transparent opacity={0.5} />
        <Edges color={activeTheme === 'CYBER' ? '#00ffff' : t.edge} threshold={15} />
      </instancedMesh>
    </group>
  );
}
