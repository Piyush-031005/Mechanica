"use client";

import { useRef, useState, useEffect, useMemo } from "react";
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
  const gyroRef = useRef<THREE.InstancedMesh>(null);
  const [mousePos, setMousePos] = useState(new THREE.Vector2());
  const { viewport } = useThree();

  const activeTheme = useStore((state) => state.activeTheme);
  const cameraY = useStore((state) => state.cameraY);
  const cameraZ = useStore((state) => state.cameraZ);
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

  const artifactY = -55; 
  const isExploded = Math.abs(cameraY - artifactY) < 10;

  const dist = Math.abs(cameraZ - (-55));
  const htmlOpacity = Math.max(0, 1 - (dist / 10));

  const numRings = 150;
  
  const ringData = useMemo(() => {
    return Array.from({ length: numRings }, (_, i) => ({
      radius: 2 + Math.pow(i / numRings, 2) * 15, // Denser towards center
      axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      speed: (Math.random() - 0.5) * 0.5,
      thickness: 0.05 + Math.random() * 0.2
    }));
  }, []);

  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tempQuat = useMemo(() => new THREE.Quaternion(), []);

  useFrame((state, delta) => {
    if (gyroRef.current) {
      const time = state.clock.elapsedTime;
      
      // Target tracking rotation based on mouse
      const targetRotationX = -mousePos.y * 0.5;
      const targetRotationY = mousePos.x * 0.8;

      for (let i = 0; i < numRings; i++) {
        const d = ringData[i];
        
        tempObj.position.set(0, 0, 0);
        
        if (isExploded) {
          // Rings spin wildly on their own random axes
          tempQuat.setFromAxisAngle(d.axis, time * d.speed * 5);
          tempObj.rotation.setFromQuaternion(tempQuat);
        } else {
          // Rings align smoothly to track the mouse, forming an "Eye"
          // Inner rings track faster than outer rings
          const lerpFactor = Math.max(0.01, 0.1 - (i / numRings) * 0.09);
          
          const currentRotX = tempObj.rotation.x;
          const currentRotY = tempObj.rotation.y;
          
          tempObj.rotation.x = THREE.MathUtils.lerp(currentRotX, targetRotationX, lerpFactor);
          tempObj.rotation.y = THREE.MathUtils.lerp(currentRotY, targetRotationY, lerpFactor);
          // Constant slow rotation on Z to keep it looking mechanical
          tempObj.rotation.z += delta * d.speed;
        }

        tempObj.scale.set(d.radius, d.radius, d.thickness);
        tempObj.updateMatrix();
        gyroRef.current.setMatrixAt(i, tempObj.matrix);
      }
      gyroRef.current.instanceMatrix.needsUpdate = true;
    }
  });

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
            ID: ARTIFACT_03 // (x,y,z): 0, {artifactY}, -15<br/>
            GYROS: {numRings} // OPTICAL_TRACKING
          </div>
          <div style={{ fontSize: '18px', letterSpacing: '2px', fontWeight: 'bold' }}>
            NIGHT_WATCH_GYROSCOPE
          </div>
          <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>
            STATE: {isExploded ? '[ GYRO_SCATTER ]' : '[ TARGET_LOCKED ]'}
          </div>
        </div>
      </Html>

      {/* The Gyroscope / Astrolabe Eye */}
      <instancedMesh ref={gyroRef} args={[undefined, undefined, numRings]}>
        <cylinderGeometry args={[1, 1, 1, 32, 1, true]} />
        <meshStandardMaterial color={t.base} transparent opacity={0.2} side={THREE.DoubleSide} />
        <Edges color={t.edge} threshold={1} />
      </instancedMesh>
      
      {/* Core "Pupil" */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color={activeTheme === 'CYBER' ? '#ff00ff' : t.edge} emissive={activeTheme === 'CYBER' ? '#ff00ff' : t.edge} emissiveIntensity={1} />
      </mesh>
    </group>
  );
}
