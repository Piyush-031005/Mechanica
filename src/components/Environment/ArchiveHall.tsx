"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges, Line } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

const EDGE_COLORS = {
  CYANOTYPE: "#6eb5ff",
  DRAFT:     "#333333",
  CYBER:     "#00ccff",
};

// Creates precise "dimension tick" marks — like on a technical drawing
function DimensionRing({ y, radius, edgeColor }: { y: number; radius: number; edgeColor: string }) {
  const points = useMemo(() => {
    const pts = [];
    const segments = 6; // hexagonal cross-section — feels engineered, not random
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  // Small tick marks radiating out from each vertex
  const ticks = useMemo(() => {
    const arr = [];
    const segments = 6;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const inner = radius - 0.3;
      const outer = radius + 0.5;
      arr.push([
        new THREE.Vector3(Math.cos(angle) * inner, 0, Math.sin(angle) * inner),
        new THREE.Vector3(Math.cos(angle) * outer, 0, Math.sin(angle) * outer),
      ]);
    }
    return arr;
  }, [radius]);

  return (
    <group position={[0, y, -15]}>
      <Line points={points} color={edgeColor} lineWidth={0.5} transparent opacity={0.3} />
      {ticks.map((pair, i) => (
        <Line key={i} points={pair} color={edgeColor} lineWidth={0.5} transparent opacity={0.5} />
      ))}
    </group>
  );
}

// A single structural archway ring
function ArchRing({ y, radius, edgeColor, opacity = 0.15 }: { y: number; radius: number; edgeColor: string; opacity?: number }) {
  return (
    <mesh position={[0, y, -15]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.03, 6, 64]} />
      <meshStandardMaterial color="#000000" transparent opacity={0} />
      <Edges color={edgeColor} threshold={1} />
    </mesh>
  );
}

export function ArchiveHall() {
  const rotatorRef = useRef<THREE.Group>(null);
  const activeTheme = useStore((state) => state.activeTheme);
  const edgeColor = EDGE_COLORS[activeTheme];

  // Slowly rotate the outer structural rings
  useFrame((state, delta) => {
    if (rotatorRef.current) {
      rotatorRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <group>
      {/* ── MAIN SHAFT RINGS: Clean, regular, spaced 6 units apart ── */}
      {/* Each ring gets a dimension line annotation */}
      {Array.from({ length: 18 }).map((_, i) => {
        const y = i * -6;
        const alternating = i % 3 === 0;
        return (
          <group key={i}>
            <ArchRing y={y} radius={alternating ? 14 : 12} edgeColor={edgeColor} opacity={alternating ? 0.25 : 0.12} />
            {alternating && (
              <DimensionRing y={y + 0.5} radius={10} edgeColor={edgeColor} />
            )}
          </group>
        );
      })}

      {/* ── ROTATING OUTER CAGE: Very large, barely visible ─────── */}
      <group ref={rotatorRef}>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 18;
          const z = -15 + Math.sin(angle) * 18;
          return (
            <group key={i}>
              {/* Vertical spine */}
              <mesh position={[x, -50, z]}>
                <cylinderGeometry args={[0.05, 0.05, 100, 4]} />
                <meshStandardMaterial color="#000" transparent opacity={0} />
                <Edges color={edgeColor} threshold={1} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ── DEEP STRUCTURE: Cross-shaped beams at depth intervals ── */}
      {[-30, -60, -90].map((y, i) => (
        <group key={i} position={[0, y, -15]}>
          {/* Cross beams */}
          <mesh rotation={[0, 0, 0]}>
            <boxGeometry args={[30, 0.05, 0.05]} />
            <meshStandardMaterial color="#000" transparent opacity={0} />
            <Edges color={edgeColor} threshold={1} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[30, 0.05, 0.05]} />
            <meshStandardMaterial color="#000" transparent opacity={0} />
            <Edges color={edgeColor} threshold={1} />
          </mesh>
          {/* Large annotation ring at each structural node */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[15, 0.02, 4, 64]} />
            <meshStandardMaterial color="#000" transparent opacity={0} />
            <Edges color={edgeColor} threshold={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
