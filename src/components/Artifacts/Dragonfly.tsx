"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor, Html, Edges, Line } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

const THEME = {
  CYANOTYPE: { edge: "#6eb5ff", accent: "#ffffff", bodyOpacity: 0.0 },
  DRAFT:     { edge: "#222222", accent: "#cc0000", bodyOpacity: 0.9 },
  CYBER:     { edge: "#00ccff", accent: "#ff00aa", bodyOpacity: 0.0 },
};

// One wing panel — made of a grid of lines like the reference image
function WingPanel({ side, wingsActive, edgeColor }: { side: 1 | -1; wingsActive: boolean; edgeColor: string }) {
  const groupRef = useRef<THREE.Group>(null);

  const wingPts = useMemo(() => {
    // Wing outline — asymmetric, dragonfly-shaped
    return [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(side * 0.3, 0.4, 0),
      new THREE.Vector3(side * 1.8, 0.8, 0),
      new THREE.Vector3(side * 3.5, 0.5, 0),
      new THREE.Vector3(side * 4.2, 0, 0),
      new THREE.Vector3(side * 3.8, -0.4, 0),
      new THREE.Vector3(side * 2.0, -0.5, 0),
      new THREE.Vector3(side * 0.8, -0.3, 0),
      new THREE.Vector3(0, 0, 0),
    ];
  }, [side]);

  // Wing vein lines — the grid of detail inside the wing
  const veins = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const divisions = 7;
    for (let i = 1; i < divisions; i++) {
      const t = i / divisions;
      // Longitudinal veins (root to tip)
      lines.push([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(side * (4.2 * t), (Math.sin(t * Math.PI) * 0.5), 0),
      ]);
    }
    // Cross veins
    for (let i = 1; i < divisions; i++) {
      const x = side * (i * 0.6);
      const yTop = Math.sin((i / divisions) * Math.PI) * 0.7;
      const yBot = -Math.sin((i / divisions) * Math.PI) * 0.4;
      lines.push([
        new THREE.Vector3(x, yTop, 0),
        new THREE.Vector3(x, yBot, 0),
      ]);
    }
    return lines;
  }, [side]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Wing flap
      const speed = wingsActive ? 18 : 1.2;
      const amplitude = wingsActive ? 0.3 : 0.08;
      const flapAngle = Math.sin(state.clock.elapsedTime * speed) * amplitude;
      groupRef.current.rotation.y = flapAngle * side;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0.2]}>
      {/* Wing outline */}
      <Line points={wingPts} color={edgeColor} lineWidth={1.2} transparent opacity={0.8} />
      {/* Wing veins */}
      {veins.map((pts, i) => (
        <Line key={i} points={pts} color={edgeColor} lineWidth={0.5} transparent opacity={0.4} />
      ))}
    </group>
  );
}

// Rear (smaller) wing pair
function RearWingPanel({ side, wingsActive, edgeColor }: { side: 1 | -1; wingsActive: boolean; edgeColor: string }) {
  const groupRef = useRef<THREE.Group>(null);

  const wingPts = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(side * 0.4, 0.3, 0),
    new THREE.Vector3(side * 2.5, 0.4, 0),
    new THREE.Vector3(side * 3.2, 0, 0),
    new THREE.Vector3(side * 2.8, -0.5, 0),
    new THREE.Vector3(side * 1.0, -0.4, 0),
    new THREE.Vector3(0, 0, 0),
  ], [side]);

  useFrame((state) => {
    if (groupRef.current) {
      const speed = wingsActive ? 18 : 1.2;
      const flapAngle = Math.sin(state.clock.elapsedTime * speed + 0.4) * (wingsActive ? 0.25 : 0.06);
      groupRef.current.rotation.y = flapAngle * side;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -0.8]}>
      <Line points={wingPts} color={edgeColor} lineWidth={0.9} transparent opacity={0.65} />
    </group>
  );
}

export function Dragonfly() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [wingsActive, setWingsActive] = useState(false);

  const playMechanicalClick = useStore((s) => s.playMechanicalClick);
  const activeTheme = useStore((s) => s.activeTheme);
  const cameraZ = useStore((s) => s.cameraZ);
  const cameraY = useStore((s) => s.cameraY);
  const t = THEME[activeTheme];

  useCursor(hovered, "crosshair", "auto");

  const artifactY = 0;
  const htmlOpacity = 1; // Always visible when camera reaches this artifact

  // Tail segments geometry
  const tailSegments = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      y: -(i * 0.65 + 0.7),
      r: 0.22 - i * 0.025,
      h: 0.6,
    }));
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Hover float + Z position: -50 so it's FAR behind the engine
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.5 - 28;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, -28, -50]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => { playMechanicalClick(); setWingsActive(e => !e); }}
    >
      {/* ── HTML LABEL ──────────────────────────────────────────── */}
      <Html position={[5, 2, 0]} center style={{ pointerEvents: 'none', opacity: htmlOpacity, transition: 'opacity 0.5s' }}>
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
          <div style={{ opacity: 0.6, fontSize: 9 }}>ARTIFACT 02 · SECTOR B</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', letterSpacing: 3 }}>AERO-DRONE</div>
          <div style={{ opacity: 0.6, fontSize: 9 }}>WINGSPAN 6.4m · {wingsActive ? 'FLIGHT MODE' : 'PATROL MODE'}</div>
        </div>
      </Html>

      {/* ── THORAX (main body center) ────────────────────────────── */}
      <mesh>
        <capsuleGeometry args={[0.25, 0.8, 8, 16]} />
        <meshStandardMaterial color={activeTheme === 'DRAFT' ? '#f0ebdc' : '#000'} transparent opacity={t.bodyOpacity} />
        <Edges color={t.edge} />
      </mesh>

      {/* ── HEAD ─────────────────────────────────────────────────── */}
      <group position={[0, 0.85, 0]}>
        <mesh>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color={activeTheme === 'DRAFT' ? '#f0ebdc' : '#000'} transparent opacity={t.bodyOpacity} />
          <Edges color={t.edge} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.14, 0.06, 0.22]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={t.edge} emissive={t.edge} emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[0.14, 0.06, 0.22]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={t.edge} emissive={t.edge} emissiveIntensity={1.5} />
        </mesh>
      </group>

      {/* ── SEGMENTED TAIL ───────────────────────────────────────── */}
      {tailSegments.map((seg, i) => (
        <mesh key={i} position={[0, seg.y, 0]}>
          <cylinderGeometry args={[seg.r, seg.r * 0.88, seg.h, 8]} />
          <meshStandardMaterial color={activeTheme === 'DRAFT' ? '#f0ebdc' : '#000'} transparent opacity={t.bodyOpacity} />
          <Edges color={i % 2 === 0 ? t.edge : t.accent} threshold={1} />
        </mesh>
      ))}
      {/* Tail tip */}
      <mesh position={[0, -5.5, 0]}>
        <coneGeometry args={[0.06, 0.4, 6]} />
        <meshStandardMaterial color={t.edge} emissive={t.edge} emissiveIntensity={0.8} />
      </mesh>

      {/* ── WINGS (4 panels) ─────────────────────────────────────── */}
      <WingPanel side={1} wingsActive={wingsActive} edgeColor={t.edge} />
      <WingPanel side={-1} wingsActive={wingsActive} edgeColor={t.edge} />
      <RearWingPanel side={1} wingsActive={wingsActive} edgeColor={t.edge} />
      <RearWingPanel side={-1} wingsActive={wingsActive} edgeColor={t.edge} />

      {/* ── CENTER ANNOTATION LINE ───────────────────────────────── */}
      <Line
        points={[new THREE.Vector3(0, 1.2, 0), new THREE.Vector3(0, -6.0, 0)]}
        color={t.accent}
        lineWidth={0.3}
        transparent opacity={0.4}
      />
    </group>
  );
}
