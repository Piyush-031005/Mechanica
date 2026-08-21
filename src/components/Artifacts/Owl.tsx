"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html, Edges, Line } from "@react-three/drei";
import { useStore } from "@/store/useStore";

const THEME = {
  CYANOTYPE: { edge: "#6eb5ff", accent: "#ffffff", bodyOpacity: 0.0 },
  DRAFT:     { edge: "#222222", accent: "#cc0000", bodyOpacity: 0.9 },
  CYBER:     { edge: "#00ccff", accent: "#ff00aa", bodyOpacity: 0.0 },
};

// A single precision gyroscope ring with its own rotation axis and speed
function GyroRing({ axisX, axisY, axisZ, radius, tubeRadius, speed, edgeColor, opacity = 0.9 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const axis = useMemo(() => new THREE.Vector3(axisX, axisY, axisZ).normalize(), [axisX, axisY, axisZ]);
  const quat = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      quat.setFromAxisAngle(axis, delta * speed);
      meshRef.current.quaternion.premultiply(quat);
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[radius, tubeRadius, 4, 64]} />
      <meshStandardMaterial transparent opacity={0} />
      <Edges color={edgeColor} threshold={1} />
    </mesh>
  );
}

export function Owl() {
  const [mousePos, setMousePos] = useState(new THREE.Vector2());
  const containerRef = useRef<THREE.Group>(null);
  const pupilRef = useRef<THREE.Mesh>(null);
  const innerPupilRef = useRef<THREE.Mesh>(null);

  const activeTheme = useStore((s) => s.activeTheme);
  const cameraY = useStore((s) => s.cameraY);
  const cameraZ = useStore((s) => s.cameraZ);
  const t = THEME[activeTheme];

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos(new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      ));
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const artifactY = -55;
  const htmlOpacity = 1; // Always visible when camera is here

  // Mouse-tracking for the container (the whole eye tracks mouse)
  useFrame((state, delta) => {
    if (containerRef.current) {
      containerRef.current.rotation.y = THREE.MathUtils.lerp(
        containerRef.current.rotation.y,
        mousePos.x * 0.6,
        0.04
      );
      containerRef.current.rotation.x = THREE.MathUtils.lerp(
        containerRef.current.rotation.x,
        -mousePos.y * 0.4,
        0.04
      );
    }
    // Pupil breathe
    if (pupilRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      pupilRef.current.scale.setScalar(s);
    }
    if (innerPupilRef.current) {
      const glow = 1.5 + Math.sin(state.clock.elapsedTime * 3) * 0.5;
      (innerPupilRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = glow;
    }
  });

  // Precise gyroscope ring configurations — scaled up for visibility
  const rings = useMemo(() => [
    // Cardinal rings
    { ax: 1, ay: 0, az: 0, r: 10,  speed: 0.22, tube: 0.10 },
    { ax: 0, ay: 1, az: 0, r: 10,  speed: -0.18, tube: 0.10 },
    { ax: 0, ay: 0, az: 1, r: 10,  speed: 0.15, tube: 0.10 },
    // Intermediate rings
    { ax: 1, ay: 1, az: 0, r: 7.5, speed: -0.3, tube: 0.07 },
    { ax: 0, ay: 1, az: 1, r: 7.5, speed: 0.28, tube: 0.07 },
    { ax: 1, ay: 0, az: 1, r: 7.5, speed: -0.25, tube: 0.07 },
    // Inner precision rings
    { ax: 1, ay: 1, az: 1, r: 5.5, speed: 0.5, tube: 0.06 },
    { ax: -1, ay: 1, az: 1, r: 5.5, speed: -0.45, tube: 0.06 },
    { ax: 1, ay: -1, az: 1, r: 5.5, speed: 0.4, tube: 0.06 },
    // Accent inner rings
    { ax: 1, ay: 2, az: 0, r: 3.5, speed: 0.9, tube: 0.05 },
    { ax: 0, ay: 1, az: 2, r: 3.5, speed: -0.85, tube: 0.05 },
    { ax: 2, ay: 0, az: 1, r: 3.5, speed: 0.75, tube: 0.05 },
  ], []);

  // Outer stabilizer frame — static, does NOT rotate
  const framePoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 11, Math.sin(a) * 11, 0));
    }
    return pts;
  }, []);

  // 8 structural spokes from outer frame to center
  const spokes = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return [
        new THREE.Vector3(Math.cos(a) * 11, Math.sin(a) * 11, 0),
        new THREE.Vector3(0, 0, 0),
      ];
    }), []);

  return (
    <group position={[0, -55, -90]}>
      {/* ── HTML LABEL ──────────────────────────────────────────── */}
      <Html position={[7, 3, 0]} center style={{ pointerEvents: 'none', opacity: htmlOpacity, transition: 'opacity 0.5s' }}>
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
          <div style={{ opacity: 0.6, fontSize: 9 }}>ARTIFACT 03 · SECTOR C</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', letterSpacing: 3 }}>NIGHT-WATCH</div>
          <div style={{ opacity: 0.6, fontSize: 9 }}>12-AXIS GYRO · OPTICAL TRACK</div>
        </div>
      </Html>

      {/* ── STATIC OUTER FRAME (does not rotate — holds the gyro) ── */}
      <Line points={framePoints} color={t.edge} lineWidth={0.8} transparent opacity={0.5} />
      {spokes.map((pts, i) => (
        <Line key={i} points={pts} color={t.edge} lineWidth={0.5} transparent opacity={0.25} />
      ))}

      {/* ── THE GYROSCOPE (this entire group tracks the mouse) ───── */}
      <group ref={containerRef}>
        {rings.map((r, i) => (
          <GyroRing
            key={i}
            axisX={r.ax} axisY={r.ay} axisZ={r.az}
            radius={r.r} tubeRadius={r.tube}
            speed={r.speed}
            edgeColor={i < 3 ? t.edge : (i < 6 ? t.edge : t.accent)}
          />
        ))}

        {/* ── PUPIL: glowing core sphere ────────────────────────── */}
        <mesh ref={pupilRef}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color={t.edge} transparent opacity={0.1} />
        </mesh>
        <mesh ref={innerPupilRef}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial
            color={t.edge}
            emissive={t.edge}
            emissiveIntensity={2}
            transparent opacity={0.95}
          />
        </mesh>
      </group>
    </group>
  );
}
