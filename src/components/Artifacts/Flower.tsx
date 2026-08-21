"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor, Html, Edges } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

const THEME_COLORS = {
  CYANOTYPE: { base: "#000000", edge: "#ffffff", transparent: true, emissive: "#ffffff", opacity: 0.0 },
  DRAFT: { base: "#f0ebdc", edge: "#111111", transparent: false, emissive: "#000000", opacity: 1.0 },
  CYBER: { base: "#111111", edge: "#00ffff", transparent: false, emissive: "#ff00ff", opacity: 1.0 }
};

export function Flower() {
  const groupRef = useRef<THREE.Group>(null);
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const [hovered, setHovered] = useState(false);
  const [discoveryState, setDiscoveryState] = useState(0); 
  
  const playMechanicalClick = useStore((state) => state.playMechanicalClick);
  const activeTheme = useStore((state) => state.activeTheme);
  const cameraY = useStore((state) => state.cameraY);
  const cameraZ = useStore((state) => state.cameraZ);
  const t = THEME_COLORS[activeTheme];

  useCursor(hovered, "crosshair", "auto");

  const artifactY = -15;
  const isExploded = Math.abs(cameraY - artifactY) < 10 || discoveryState >= 3;

  const dist = Math.abs(cameraZ - (-15));
  const htmlOpacity = Math.max(0, 1 - (dist / 10));

  const numNodes = 400;
  
  // Calculate golden spiral nodes
  const nodeData = useMemo(() => {
    return Array.from({ length: numNodes }, (_, i) => {
      const t = i / (numNodes - 1);
      const angle = t * Math.PI * 2 * 10; // 10 spirals
      const radius = t * 5; // Spiral outwards up to radius 5
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      // Sacred geometry layout (hexagon points for explosion)
      const hexAngle = (i % 6) * (Math.PI / 3);
      const hexRadius = 8 + (i % 3);
      const hexX = Math.cos(hexAngle) * hexRadius;
      const hexY = Math.sin(hexAngle) * hexRadius;
      const hexZ = ((i % 10) - 5) * 0.5;

      return {
        baseX: x, baseY: y, baseZ: (Math.random() - 0.5) * 2,
        expX: hexX, expY: hexY, expZ: hexZ,
        scale: 0.1 + Math.random() * 0.3
      };
    });
  }, []);

  const tempObj = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.2;
      if (isExploded) {
        groupRef.current.rotation.x += delta * 0.5;
        groupRef.current.rotation.y += delta * 0.5;
      } else {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.05);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
      }
    }

    if (instancedRef.current) {
      const time = state.clock.elapsedTime;
      for (let i = 0; i < numNodes; i++) {
        const d = nodeData[i];
        
        // Target calculation based on state
        const targetX = isExploded ? d.expX : d.baseX;
        const targetY = isExploded ? d.expY : d.baseY;
        const targetZ = isExploded ? d.expZ : d.baseZ;
        
        // Add subtle breathing math
        const breath = Math.sin(time * 2 + i * 0.1) * 0.2;
        
        tempObj.position.x = THREE.MathUtils.lerp(tempObj.position.x || 0, targetX * (1 + breath), 0.05);
        tempObj.position.y = THREE.MathUtils.lerp(tempObj.position.y || 0, targetY * (1 + breath), 0.05);
        tempObj.position.z = THREE.MathUtils.lerp(tempObj.position.z || 0, targetZ * (1 + breath), 0.05);
        
        tempObj.rotation.set(time + i, time * 2, 0);
        
        const s = d.scale * (isExploded ? 2 : 1);
        tempObj.scale.setScalar(s);
        tempObj.updateMatrix();
        
        instancedRef.current.setMatrixAt(i, tempObj.matrix);
      }
      instancedRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const handleClick = () => {
    playMechanicalClick();
    setDiscoveryState((prev) => (prev + 1) % 4);
  };

  return (
    <group 
      ref={groupRef} 
      position={[0, artifactY, -15]} 
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      <Html position={[2, 2, 0]} center style={{ pointerEvents: 'none', opacity: htmlOpacity, transition: 'opacity 0.2s' }}>
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
            ID: ARTIFACT_01 // (x,y,z): 0, {artifactY}, -15<br/>
            NODES: {numNodes} // FIBONACCI
          </div>
          <div style={{ fontSize: '18px', letterSpacing: '2px', fontWeight: 'bold' }}>
            SACRED_GEOMETRY
          </div>
          <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
            STATE: {isExploded ? '[ METATRON_CUBE ]' : '[ SEED_OF_LIFE ]'}
          </div>
        </div>
      </Html>

      <instancedMesh ref={instancedRef} args={[undefined, undefined, numNodes]}>
        <tetrahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={t.base} transparent opacity={0.8} />
        <Edges color={activeTheme === 'DRAFT' ? '#ff0000' : t.edge} />
      </instancedMesh>
    </group>
  );
}
