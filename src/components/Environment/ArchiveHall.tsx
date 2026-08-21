"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

const THEME_COLORS = {
  CYANOTYPE: { base: "#000000", edge: "#ffffff", transparent: true, emissive: "#ffffff", opacity: 0.0 },
  DRAFT: { base: "#f0ebdc", edge: "#111111", transparent: false, emissive: "#000000", opacity: 1.0 },
  CYBER: { base: "#111111", edge: "#00ffff", transparent: false, emissive: "#ff00ff", opacity: 1.0 }
};

export function ArchiveHall() {
  const outerRingsRef = useRef<THREE.InstancedMesh>(null);
  const innerSwarmRef = useRef<THREE.InstancedMesh>(null);
  const coreNodesRef = useRef<THREE.InstancedMesh>(null);
  
  const activeTheme = useStore((state) => state.activeTheme);
  const t = THEME_COLORS[activeTheme];

  const numRings = 200;
  const numSwarm = 3000;
  const numNodes = 1000;
  
  const tempObj = useMemo(() => new THREE.Object3D(), []);
  
  // Pre-calculate random offsets for the swarm
  const swarmData = useMemo(() => {
    return Array.from({ length: numSwarm }, () => ({
      radius: 15 + Math.random() * 40,
      angle: Math.random() * Math.PI * 2,
      yOffset: (Math.random() - 0.5) * 200,
      speed: (Math.random() - 0.5) * 0.2,
      pulseSpeed: Math.random() * 2
    }));
  }, []);

  const nodeData = useMemo(() => {
    return Array.from({ length: numNodes }, () => {
      // Golden ratio spiral distribution on a sphere
      const phi = Math.acos(-1 + (2 * Math.random()));
      const theta = Math.sqrt(numNodes * Math.PI) * phi;
      return {
        x: Math.cos(theta) * Math.sin(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(phi),
        scale: 0.1 + Math.random() * 0.5
      };
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Outer interlocking rings (Astrolabe structure)
    if (outerRingsRef.current) {
      for (let i = 0; i < numRings; i++) {
        const radius = 20 + (i % 10) * 2; // Concentric layers
        const yOffset = -i * 1.5;
        const rotationSpeed = (i % 2 === 0 ? 1 : -1) * 0.1;
        
        tempObj.position.set(0, yOffset, -15);
        tempObj.rotation.set(
          Math.PI / 2 + Math.sin(time * 0.1 + i) * 0.2, 
          time * rotationSpeed + (i * 0.1), 
          Math.cos(time * 0.1 + i) * 0.2
        );
        const scale = 1 + Math.sin(time * 0.5 + i) * 0.05;
        tempObj.scale.set(radius * scale, radius * scale, 1);
        tempObj.updateMatrix();
        outerRingsRef.current.setMatrixAt(i, tempObj.matrix);
      }
      outerRingsRef.current.instanceMatrix.needsUpdate = true;
    }

    // Inner chaotic particle swarm (Data flow)
    if (innerSwarmRef.current) {
      for (let i = 0; i < numSwarm; i++) {
        const data = swarmData[i];
        const currentAngle = data.angle + time * data.speed;
        
        // Helix motion
        const x = Math.cos(currentAngle) * data.radius;
        const z = -15 + Math.sin(currentAngle) * data.radius;
        const y = data.yOffset + Math.sin(time * data.pulseSpeed) * 5;
        
        tempObj.position.set(x, y, z);
        tempObj.rotation.set(time, time * 1.5, 0);
        
        // Pulse size
        const s = 0.5 + Math.sin(time * data.pulseSpeed + i) * 0.4;
        tempObj.scale.set(s, s, s);
        
        tempObj.updateMatrix();
        innerSwarmRef.current.setMatrixAt(i, tempObj.matrix);
      }
      innerSwarmRef.current.instanceMatrix.needsUpdate = true;
    }

    // Sacred Geometry Core Nodes (Dyson sphere around the shaft)
    if (coreNodesRef.current) {
      const radiusBase = 40;
      for (let i = 0; i < numNodes; i++) {
        const d = nodeData[i];
        const r = radiusBase + Math.sin(time * 2 + i) * 2;
        
        tempObj.position.set(
          d.x * r,
          d.y * r * 2 - 50, // Stretched along Y axis
          -15 + d.z * r
        );
        
        // Look at center
        tempObj.lookAt(0, tempObj.position.y, -15);
        
        tempObj.scale.setScalar(d.scale);
        tempObj.updateMatrix();
        coreNodesRef.current.setMatrixAt(i, tempObj.matrix);
      }
      coreNodesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Astrolabe Rings */}
      <instancedMesh ref={outerRingsRef} args={[undefined, undefined, numRings]}>
        <torusGeometry args={[1, 0.005, 4, 64]} />
        <meshStandardMaterial color={t.base} transparent opacity={0.3} metalness={0} roughness={1} />
        <Edges color={activeTheme === 'CYBER' ? '#9900ff' : t.edge} threshold={1} />
      </instancedMesh>

      {/* Swarm Particles */}
      <instancedMesh ref={innerSwarmRef} args={[undefined, undefined, numSwarm]}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={t.edge} emissive={t.edge} emissiveIntensity={0.5} transparent opacity={0.5} wireframe={true} />
      </instancedMesh>

      {/* Sacred Geometry Core Nodes */}
      <instancedMesh ref={coreNodesRef} args={[undefined, undefined, numNodes]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={t.base} transparent opacity={0.8} />
        <Edges color={activeTheme === 'DRAFT' ? '#ff0000' : t.edge} />
      </instancedMesh>
    </group>
  );
}
