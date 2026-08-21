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

// Dimension annotation: horizontal line with tick ends and a label
function DimensionAnnotation({ from, to, label, edgeColor, yPos = 0 }: any) {
  const pts = useMemo(() => [
    new THREE.Vector3(from, yPos, 0),
    new THREE.Vector3(to, yPos, 0)
  ], [from, to, yPos]);
  const tickA = useMemo(() => [
    new THREE.Vector3(from, yPos - 0.4, 0),
    new THREE.Vector3(from, yPos + 0.4, 0)
  ], [from, yPos]);
  const tickB = useMemo(() => [
    new THREE.Vector3(to, yPos - 0.4, 0),
    new THREE.Vector3(to, yPos + 0.4, 0)
  ], [to, yPos]);

  return (
    <group>
      <Line points={pts} color={edgeColor} lineWidth={0.5} transparent opacity={0.35} />
      <Line points={tickA} color={edgeColor} lineWidth={0.8} transparent opacity={0.5} />
      <Line points={tickB} color={edgeColor} lineWidth={0.8} transparent opacity={0.5} />
      <Html position={[(from + to) / 2, yPos + 0.8, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: edgeColor, opacity: 0.55, whiteSpace: 'nowrap', letterSpacing: 1 }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

// A single precision gear ring — MUCH LARGER now
function GearRing({ radius, tubeRadius, segments, rotationSpeed, edgeColor }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.z += delta * rotationSpeed;
  });
  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, tubeRadius, 4, segments]} />
      <meshStandardMaterial transparent opacity={0} />
      <Edges color={edgeColor} threshold={1} />
    </mesh>
  );
}

// Satellite gear orbiting the center
function SatelliteGear({ orbitRadius, orbitSpeed, gearRadius, edgeColor, startAngle = 0 }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const selfRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * orbitSpeed;
    if (selfRef.current) selfRef.current.rotation.z -= delta * orbitSpeed * 3;
  });

  return (
    <group rotation={[0, 0, startAngle]}>
      <group ref={groupRef}>
        <group position={[orbitRadius, 0, 0]}>
          <mesh ref={selfRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[gearRadius, 0.08, 4, 24]} />
            <meshStandardMaterial transparent opacity={0} />
            <Edges color={edgeColor} threshold={1} />
          </mesh>
          {/* Glowing center dot of each satellite */}
          <mesh>
            <sphereGeometry args={[gearRadius * 0.25, 8, 8]} />
            <meshStandardMaterial color={edgeColor} emissive={edgeColor} emissiveIntensity={1.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// Orbit path dashed circle
function OrbitPath({ radius, edgeColor }: { radius: number; edgeColor: string }) {
  const pts = useMemo(() => {
    const arr = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      arr.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0));
    }
    return arr;
  }, [radius]);
  return <Line points={pts} color={edgeColor} lineWidth={0.4} transparent opacity={0.2} />;
}

// 24 radiating construction lines from center
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
        <Line key={i} points={pts} color={edgeColor} lineWidth={0.3} transparent opacity={0.15} />
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
  const scrollVelocity = useStore((s) => s.scrollVelocity);
  const t = THEME[activeTheme];

  useCursor(hovered, "crosshair", "auto");

  // Breathing animation
  useFrame((state, delta) => {
    if (coreRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
      coreRef.current.scale.setScalar(s);
    }
    if (coreGlowRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.2 + 1) * 0.2;
      coreGlowRef.current.scale.setScalar(s);
      (coreGlowRef.current.material as any).opacity = 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    // ENGINE: Right in front of the camera at the start. z=-8 so it fills the view.
    <group
      ref={groupRef}
      position={[0, -2, -8]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => { playMechanicalClick(); setIsExploded(e => !e); }}
    >
      {/* ── HTML LABEL ────────────────────────────────────────────── */}
      <Html position={[18, 4, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: 'monospace', fontSize: 11, color: t.edge,
          border: `1px solid ${t.edge}`, padding: '6px 10px',
          background: 'rgba(0,2,20,0.75)', backdropFilter: 'blur(6px)',
          whiteSpace: 'nowrap', letterSpacing: 1, lineHeight: 1.6,
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: -3, left: -3, width: 5, height: 5, borderTop: `1px solid ${t.edge}`, borderLeft: `1px solid ${t.edge}` }} />
          <div style={{ position: 'absolute', top: -3, right: -3, width: 5, height: 5, borderTop: `1px solid ${t.edge}`, borderRight: `1px solid ${t.edge}` }} />
          <div style={{ position: 'absolute', bottom: -3, left: -3, width: 5, height: 5, borderBottom: `1px solid ${t.edge}`, borderLeft: `1px solid ${t.edge}` }} />
          <div style={{ position: 'absolute', bottom: -3, right: -3, width: 5, height: 5, borderBottom: `1px solid ${t.edge}`, borderRight: `1px solid ${t.edge}` }} />
          <div style={{ opacity: 0.6, fontSize: 9 }}>ARTIFACT 01 · SECTOR A</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', letterSpacing: 3 }}>THE ENGINE</div>
          <div style={{ opacity: 0.6, fontSize: 9 }}>Ø 32.0m · GEAR RATIO 1:3:9</div>
        </div>
      </Html>

      {/* ── DIMENSION ANNOTATIONS ─────────────────────────────────── */}
      <DimensionAnnotation from={-16} to={16} label="Ø 32.00 m — OUTER GEAR RING" edgeColor={t.edge} yPos={-18} />
      <DimensionAnnotation from={0} to={12} label="R 12.00 m — ORBIT PATH" edgeColor={t.edge} yPos={17} />
      <DimensionAnnotation from={0} to={4} label="R 4.00 m — INNER MANDALA" edgeColor={t.accent} yPos={5.5} />

      {/* ── RADIATING CONSTRUCTION LINES ──────────────────────────── */}
      <RadiatingLines count={24} radius={18} edgeColor={t.edge} />

      {/* ── ORBIT PATHS ───────────────────────────────────────────── */}
      <OrbitPath radius={12} edgeColor={t.edge} />
      <OrbitPath radius={15} edgeColor={t.edge} />

      {/* ── MAIN GEAR RINGS ── doubled in size ────────────────────── */}
      {/* Outermost pair */}
      <GearRing radius={16} tubeRadius={0.12} segments={80} rotationSpeed={0.06} edgeColor={t.edge} />
      <GearRing radius={15.5} tubeRadius={0.05} segments={120} rotationSpeed={-0.045} edgeColor={t.edge} />
      {/* Mid pair */}
      <GearRing radius={12} tubeRadius={0.10} segments={64} rotationSpeed={0.10} edgeColor={t.edge} />
      <GearRing radius={11.5} tubeRadius={0.05} segments={64} rotationSpeed={-0.085} edgeColor={t.edge} />
      {/* Inner pair */}
      <GearRing radius={7.5} tubeRadius={0.12} segments={48} rotationSpeed={0.18} edgeColor={t.edge} />
      <GearRing radius={7} tubeRadius={0.05} segments={48} rotationSpeed={-0.15} edgeColor={t.edge} />

      {/* ── 6 SATELLITE GEARS on orbit radius 12 ─────────────────── */}
      {Array.from({ length: 6 }).map((_, i) => (
        <SatelliteGear
          key={i}
          orbitRadius={12}
          orbitSpeed={0.10}
          gearRadius={1.8}
          edgeColor={t.edge}
          startAngle={(i / 6) * Math.PI * 2}
        />
      ))}

      {/* ── INNER MANDALA ─────────────────────────────────────────── */}
      <GearRing radius={4} tubeRadius={0.08} segments={32} rotationSpeed={0.35} edgeColor={t.accent} />
      <GearRing radius={3} tubeRadius={0.06} segments={24} rotationSpeed={-0.45} edgeColor={t.edge} />

      {/* ── GLOWING CORE ──────────────────────────────────────────── */}
      <mesh ref={coreGlowRef}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshStandardMaterial color={t.edge} transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial color={t.edge} emissive={t.edge} emissiveIntensity={3} transparent opacity={0.95} />
      </mesh>
    </group>
  );
}
