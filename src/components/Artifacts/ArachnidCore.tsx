"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

export function ArachnidCore() {
  const isMutated = useStore((state) => state.isDismantled);
  const explosion = useStore((state) => state.explosion);
  const mutateProgress = useRef(0);
  
  const groupRef = useRef<THREE.Group>(null);
  const webRef = useRef<THREE.LineSegments>(null);
  const legRefs = useRef<THREE.Group[]>([]);
  
  const spiderMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const webMatRef = useRef<THREE.LineBasicMaterial>(null);

  // Procedural Web Generation (Ultra-fine deliberate lines)
  const webGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radials = 32;
    const spirals = 40;
    const maxRadius = 15;

    for (let i = 0; i < radials; i++) {
      const angle = (i / radials) * Math.PI * 2;
      points.push(new THREE.Vector3(0, 0, 0));
      points.push(new THREE.Vector3(Math.cos(angle) * maxRadius, Math.sin(angle) * maxRadius, 0));
    }

    for (let s = 1; s <= spirals; s++) {
      const r = (s / spirals) * maxRadius;
      for (let i = 0; i < radials; i++) {
        const a1 = (i / radials) * Math.PI * 2;
        const a2 = ((i + 1) / radials) * Math.PI * 2;
        const sag = Math.sin(r * 0.5) * 2 * (1 - r/maxRadius);
        
        points.push(new THREE.Vector3(Math.cos(a1) * r, Math.sin(a1) * r, sag));
        points.push(new THREE.Vector3(Math.cos(a2) * r, Math.sin(a2) * r, sag));
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    mutateProgress.current = THREE.MathUtils.lerp(mutateProgress.current, isMutated ? 1 : 0, 0.1);
    const m = mutateProgress.current;
    const pulse = 1 + explosion * 2;

    if (groupRef.current) {
      groupRef.current.rotation.z = time * (0.05 + m * 0.1);
      // Snaps out on mutation
      const s = THREE.MathUtils.lerp(1, 1.2, m);
      groupRef.current.scale.set(s, s, s);
    }

    if (webRef.current) {
      // Web flattens on mutation
      webRef.current.scale.z = THREE.MathUtils.lerp(1, 0, m);
    }

    legRefs.current.forEach((leg, index) => {
      if (!leg) return;
      const isLeft = index < 4;
      const twitch = Math.sin(time * (4 + m * 10) + index) * 0.1 * pulse;
      
      const curlZ = isLeft ? 1.5 : -1.5;
      const flatZ = isLeft ? 0.2 : -0.2;
      
      // Legs snap open violently
      leg.rotation.z = THREE.MathUtils.lerp(curlZ + twitch, flatZ, m);
      leg.rotation.x = THREE.MathUtils.lerp(twitch * 0.5, 0, m);
    });

    if (spiderMatRef.current) {
      spiderMatRef.current.color.lerpColors(
        new THREE.Color('#39ff14'), // Alien Green
        new THREE.Color('#000000'), // Venom Black
        m
      );
    }
    
    if (webMatRef.current) {
      webMatRef.current.color.lerpColors(
        new THREE.Color('#39ff14'), 
        new THREE.Color('#ff0033'), // Symbiote Red webs
        m
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -5]}>
      {/* Spider Web */}
      <lineSegments ref={webRef} geometry={webGeometry}>
        <lineBasicMaterial ref={webMatRef} color="#39ff14" transparent opacity={0.5} />
      </lineSegments>

      {/* Spider Body */}
      <group>
        <mesh position={[0, -1, 0]}>
          <capsuleGeometry args={[0.8, 1.5, 16, 32]} />
          <meshBasicMaterial ref={spiderMatRef} color="#39ff14" />
        </mesh>

        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>

        {/* Legs */}
        {[...Array(8)].map((_, i) => {
          const isLeft = i < 4;
          const yPos = 1 - (i % 4) * 0.6;
          const xDir = isLeft ? -1 : 1;
          
          return (
            <group key={i} position={[0.5 * xDir, yPos, 0]} rotation={[0, 0, isLeft ? Math.PI : 0]}>
              <group ref={(el) => { if (el) legRefs.current[i] = el; }} rotation={[0, 0, 1.5]}>
                <mesh position={[1.5, 0, 0]}>
                  <boxGeometry args={[3, 0.05, 0.05]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                <group position={[3, 0, 0]} rotation={[0, 0, -2.5]}>
                  <mesh position={[3, 0, 0]}>
                    <coneGeometry args={[0.05, 6, 4]} />
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                </group>
              </group>
            </group>
          );
        })}

        {/* Fangs */}
        <group position={[0, 1.8, 0]}>
          <mesh position={[-0.3, 0.5, 0]} rotation={[0, 0, 0.5]}>
            <coneGeometry args={[0.1, 1.5, 4]} />
            <meshBasicMaterial color="#ff0033" />
          </mesh>
          <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, -0.5]}>
            <coneGeometry args={[0.1, 1.5, 4]} />
            <meshBasicMaterial color="#ff0033" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
