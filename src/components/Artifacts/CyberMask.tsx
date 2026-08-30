"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

export function CyberMask() {
  const isMutated = useStore((state) => state.isDismantled);
  const explosion = useStore((state) => state.explosion);
  const mutateProgress = useRef(0);
  
  const groupRef = useRef<THREE.Group>(null);
  
  const strand1MatRef = useRef<THREE.MeshBasicMaterial>(null);
  const strand2MatRef = useRef<THREE.MeshBasicMaterial>(null);
  const rungMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const numPairs = 40;
  
  // Mathematical positions for the double helix
  const { positions1, positions2, rungs } = useMemo(() => {
    const p1 = [];
    const p2 = [];
    const r = [];
    for (let i = 0; i < numPairs; i++) {
      const t = (i / numPairs) * Math.PI * 4; // 2 full turns
      const radius = 1.5;
      const y = (i - numPairs / 2) * 0.2;
      
      const x1 = Math.cos(t) * radius;
      const z1 = Math.sin(t) * radius;
      
      const x2 = Math.cos(t + Math.PI) * radius;
      const z2 = Math.sin(t + Math.PI) * radius;

      p1.push(new THREE.Vector3(x1, y, z1));
      p2.push(new THREE.Vector3(x2, y, z2));
      r.push({ p1: new THREE.Vector3(x1, y, z1), p2: new THREE.Vector3(x2, y, z2) });
    }
    return { positions1: p1, positions2: p2, rungs: r };
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    mutateProgress.current = THREE.MathUtils.lerp(mutateProgress.current, isMutated ? 1 : 0, 0.1);
    const m = mutateProgress.current;

    if (groupRef.current) {
      // Smooth elegant rotation
      groupRef.current.rotation.y = time * 0.5 + (m * time);
      groupRef.current.position.y = Math.sin(time) * 0.2;
      
      // When mutated, the DNA unzips (expands outward)
      const scaleX = THREE.MathUtils.lerp(1, 2.5, m);
      groupRef.current.scale.set(scaleX, 1, scaleX);
    }

    if (strand1MatRef.current && strand2MatRef.current && rungMatRef.current) {
      const green = new THREE.Color('#39ff14');
      const red = new THREE.Color('#ff0033');
      const black = new THREE.Color('#050505');

      strand1MatRef.current.color.lerpColors(green, red, m);
      strand2MatRef.current.color.lerpColors(green, black, m);
      rungMatRef.current.color.lerpColors(green, red, m);
      
      // Break the bonds when mutated
      rungMatRef.current.opacity = THREE.MathUtils.lerp(0.8, 0.0, m);
    }
  });

  return (
    <group ref={groupRef}>
      {/* STRAND 1 */}
      {positions1.map((pos, i) => (
        <mesh key={`s1-${i}`} position={pos}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial ref={i === 0 ? strand1MatRef : undefined} color="#39ff14" />
        </mesh>
      ))}

      {/* STRAND 2 */}
      {positions2.map((pos, i) => (
        <mesh key={`s2-${i}`} position={pos}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial ref={i === 0 ? strand2MatRef : undefined} color="#39ff14" />
        </mesh>
      ))}

      {/* RUNGS (BONDS) */}
      {rungs.map((rung, i) => {
        const distance = rung.p1.distanceTo(rung.p2);
        const center = new THREE.Vector3().addVectors(rung.p1, rung.p2).multiplyScalar(0.5);
        // Calculate rotation for cylinder
        const direction = new THREE.Vector3().subVectors(rung.p2, rung.p1).normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

        return (
          <mesh key={`r-${i}`} position={center} quaternion={quaternion}>
            <cylinderGeometry args={[0.02, 0.02, distance, 8]} />
            <meshBasicMaterial ref={i === 0 ? rungMatRef : undefined} color="#39ff14" transparent />
          </mesh>
        );
      })}

      <Html position={[2, 0, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ color: isMutated ? '#ff0033' : '#39ff14', fontFamily: 'monospace', fontSize: '10px', width: '200px', borderLeft: '1px solid currentColor', paddingLeft: '8px' }}>
          {isMutated ? 'DNA STRANDS UNZIPPING... HOST TAKEOVER' : 'STABLE SYMBIOTE DOUBLE HELIX'}
        </div>
      </Html>
    </group>
  );
}
