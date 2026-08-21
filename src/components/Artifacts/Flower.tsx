"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor, Html, Edges, Line } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

const THEME = {
  CYANOTYPE: { edge: "#6eb5ff", accent: "#ffffff", bodyOpacity: 0.0 },
  DRAFT:     { edge: "#1a1a1a", accent: "#cc2200", bodyOpacity: 0.95 },
  CYBER:     { edge: "#00ccff", accent: "#ff00aa", bodyOpacity: 0.0 },
};

// Dimension annotation: a horizontal line with tick ends and a label
// Used to annotate diameters, like a real technical drawing
function DimensionAnnotation({ from, to, label, edgeColor, yPos = 0 }: any) {
  const pts = useMemo(() => [
    new THREE.Vector3(from, yPos, 0),
    new THREE.Vector3(to, yPos, 0)
  ], [from, to, yPos]);
  const tickA = useMemo(() => [
    new THREE.Vector3(from, yPos - 0.25, 0),
    new THREE.Vector3(from, yPos + 0.25, 0)
  ], [from, yPos]);
  const tickB = useMemo(() => [
    new THREE.Vector3(to, yPos - 0.25, 0),
    new THREE.Vector3(to, yPos + 0.25, 0)
  ], [to, yPos]);

  return (
    <group>
      <Line points={pts} color={edgeColor} lineWidth={0.5} transparent opacity={0.4} />
      <Line points={tickA} color={edgeColor} lineWidth={0.5} transparent opacity={0.4} />
      <Line points={tickB} color={edgeColor} lineWidth={0.5} transparent opacity={0.4} />
      <Html position={[(from + to) / 2, yPos + 0.5, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 8, color: edgeColor, opacity: 0.6, whiteSpace: 'nowrap', letterSpacing: 1 }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

// A single precision gear ring
function GearRing({ radius, tubeRadius, segments, rotationSpeed, yOffset = 0, edgeColor }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.z += delta * rotationSpeed;
  });
  return (
    <mesh ref={meshRef} position={[0, yOffset, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, tubeRadius, 3, segments]} />
      <meshStandardMaterial transparent opacity={0} />
      <Edges color={edgeColor} threshold={1} />
    </mesh>
  );
}

// Satellite gear: a small disk orbiting the center
function SatelliteGear({ orbitRadius, orbitSpeed, gearRadius, edgeColor, startAngle = 0 }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const selfRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * orbitSpeed;
    }
    if (selfRef.current) {
      selfRef.current.rotation.z -= delta * orbitSpeed * 3; // Counter-spin (meshing gears)
    }
  });

  return (
    <group rotation={[0, 0, startAngle]}>
      <group ref={groupRef}>
        <group position={[orbitRadius, 0, 0]}>
          <mesh ref={selfRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[gearRadius, 0.04, 3, 16]} />
            <meshStandardMaterial transparent opacity={0} />
            <Edges color={edgeColor} threshold={1} />
          </mesh>
          {/* Inner detail dot */}
          <mesh>
            <sphereGeometry args={[gearRadius * 0.2, 8, 8]} />
            <meshStandardMaterial color={edgeColor} emissive={edgeColor} emissiveIntensity={1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// Orbit annotation ring (the dotted circle showing a gear's orbit path)
function OrbitPath({ radius, edgeColor }: { radius: number; edgeColor: string }) {
  const pts = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      arr.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
    }
    return arr;
  }, [radius]);
  return <Line points={pts} color={edgeColor} lineWidth={0.3} transparent opacity={0.25} />;
}

// Radiating line annotations from center
function RadiatingLines({ count, radius, edgeColor }: any) {
  const lines = useMemo(() =>
    Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0),
      ];
    }), [count, radius]);

  return (
    <>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color={edgeColor} lineWidth={0.4} transparent opacity={0.2} />
      ))}
    </>
  );
}

export function Flower() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreGlowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [isExploded, setIsExploded] = useState(false);

  const playMechanicalClick = useStore((s) => s.playMechanicalClick);
  const activeTheme = useStore((s) => s.activeTheme);
  const cameraZ = useStore((s) => s.cameraZ);
  const cameraY = useStore((s) => s.cameraY);
  const t = THEME[activeTheme];

  useCursor(hovered, "crosshair", "auto");

  const htmlOpacity = Math.max(0, Math.min(1, 1 - (Math.abs(cameraZ + 6) / 8)));

  // Breathing animation
  useFrame((state, delta) => {
    if (coreRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      coreRef.current.scale.setScalar(s);
    }
    if (coreGlowRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.5 + 1) * 0.15;
      coreGlowRef.current.scale.setScalar(s);
      (coreGlowRef.current.material as any).opacity = 0.12 + Math.sin(state.clock.elapsedTime * 2) * 0.06;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, -10]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => { playMechanicalClick(); setIsExploded(e => !e); }}
    >
      {/* ── HTML LABEL ──────────────────────────────────────────── */}
      <Html position={[9, 2.5, 0]} center style={{ pointerEvents: 'none', opacity: htmlOpacity, transition: 'opacity 0.5s' }}>
        <div style={{
          fontFamily: 'monospace', fontSize: 11, color: t.edge,
          border: `1px solid ${t.edge}`, padding: '6px 10px',
          background: 'rgba(0,0,15,0.6)', backdropFilter: 'blur(6px)',
          whiteSpace: 'nowrap', letterSpacing: 1, lineHeight: 1.6,
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: -3, left: -3, width: 5, height: 5, borderTop: `1px solid ${t.edge}`, borderLeft: `1px solid ${t.edge}` }} />
          <div style={{ position: 'absolute', top: -3, right: -3, width: 5, height: 5, borderTop: `1px solid ${t.edge}`, borderRight: `1px solid ${t.edge}` }} />
          <div style={{ position: 'absolute', bottom: -3, left: -3, width: 5, height: 5, borderBottom: `1px solid ${t.edge}`, borderLeft: `1px solid ${t.edge}` }} />
          <div style={{ position: 'absolute', bottom: -3, right: -3, width: 5, height: 5, borderBottom: `1px solid ${t.edge}`, borderRight: `1px solid ${t.edge}` }} />
          <div style={{ opacity: 0.6, fontSize: 9 }}>ARTIFACT 01 · SECTOR A</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', letterSpacing: 3 }}>THE ENGINE</div>
          <div style={{ opacity: 0.6, fontSize: 9 }}>Ø 16.0m · GEAR RATIO 1:3:9</div>
        </div>
      </Html>

      {/* ── DIMENSION ANNOTATIONS (like a real technical drawing) ─── */}
      {/* Outer diameter annotation */}
      <DimensionAnnotation from={-8.0} to={8.0} label="Ø 16.00 m — OUTER GEAR RING" edgeColor={t.edge} yPos={-9.5} />
      {/* Orbit radius annotation */}
      <DimensionAnnotation from={0} to={5.5} label="R 5.50 m — ORBIT PATH" edgeColor={t.edge} yPos={9.2} />
      {/* Inner mandala */}
      <DimensionAnnotation from={0} to={2.0} label="R 2.00 m — INNER MANDALA" edgeColor={t.accent} yPos={2.8} />

      {/* ── MAIN GEAR RINGS (nested, counter-rotating) ──────────── */}
      {/* Outermost: Slow, large, prominent */}
      <GearRing radius={8.0} tubeRadius={0.05} segments={64} rotationSpeed={0.08} edgeColor={t.edge} />
      <GearRing radius={7.8} tubeRadius={0.02} segments={96} rotationSpeed={-0.06} edgeColor={t.edge} />

      {/* Mid rings */}
      <GearRing radius={6.0} tubeRadius={0.04} segments={48} rotationSpeed={0.14} edgeColor={t.edge} />
      <GearRing radius={5.8} tubeRadius={0.02} segments={48} rotationSpeed={-0.12} edgeColor={t.edge} />

      {/* Inner */}
      <GearRing radius={3.5} tubeRadius={0.05} segments={32} rotationSpeed={0.25} edgeColor={t.edge} />
      <GearRing radius={3.3} tubeRadius={0.02} segments={32} rotationSpeed={-0.2} edgeColor={t.edge} />

      {/* ── SATELLITE GEARS: 6 evenly spaced ────────────────────── */}
      {Array.from({ length: 6 }).map((_, i) => (
        <SatelliteGear
          key={i}
          orbitRadius={5.5}
          orbitSpeed={0.12}
          gearRadius={0.8}
          edgeColor={t.edge}
          startAngle={(i / 6) * Math.PI * 2}
        />
      ))}

      {/* ── INNER MANDALA: thin rings ────────────────────────────── */}
      <GearRing radius={2.0} tubeRadius={0.03} segments={24} rotationSpeed={0.4} edgeColor={t.accent} />
      <GearRing radius={1.4} tubeRadius={0.03} segments={18} rotationSpeed={-0.5} edgeColor={t.edge} />

      {/* ── GLOWING CORE ─────────────────────────────────────────── */}
      {/* Outer glow halo */}
      <mesh ref={coreGlowRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color={t.edge} transparent opacity={0.12} depthWrite={false} />
      </mesh>
      {/* Inner bright sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color={t.edge}
          emissive={t.edge}
          emissiveIntensity={2}
          transparent opacity={0.9}
        />
      </mesh>
    </group>
  );
}
