"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

// Organic Tentacle Component
function Tentacle({ isLeft, index, isMutated, mutateProgress, time }: any) {
  const curveRef = useRef<THREE.CatmullRomCurve3>(
    new THREE.CatmullRomCurve3(Array(10).fill(0).map(() => new THREE.Vector3()))
  );
  const tubeRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const m = mutateProgress;
    const baseLength = 4;
    const points = [];
    
    // Ghostfreak / Symbiote organic wriggling math
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const xDir = isLeft ? -1 : 1;
      
      // Rigid spider leg vs Organic Symbiote Tentacle
      const rigidY = Math.sin(t * Math.PI) * 2;
      const rigidX = t * baseLength * xDir;
      const rigidZ = 0;

      const organicY = Math.sin(time * (2 + m * 5) + i * 0.5 + index) * (1 + m * 2);
      const organicX = t * (baseLength + m * 2) * xDir + Math.cos(time * 3 + i) * m;
      const organicZ = Math.sin(time * 4 + i * 0.8) * (2 * m);
      
      points.push(new THREE.Vector3(
        THREE.MathUtils.lerp(rigidX, organicX, m),
        THREE.MathUtils.lerp(rigidY, organicY, m),
        THREE.MathUtils.lerp(rigidZ, organicZ, m)
      ));
    }
    
    curveRef.current.points = points;
    
    if (tubeRef.current) {
      tubeRef.current.geometry.dispose();
      tubeRef.current.geometry = new THREE.TubeGeometry(curveRef.current, 20, 0.1 + m * 0.1, 8, false);
    }
    if (matRef.current) {
      matRef.current.color.lerpColors(
        new THREE.Color('#39ff14'), 
        new THREE.Color('#050505'), 
        m
      );
    }
  });

  return (
    <mesh ref={tubeRef}>
      <tubeGeometry args={[curveRef.current, 20, 0.1, 8, false]} />
      <meshBasicMaterial ref={matRef} color="#39ff14" wireframe={false} />
    </mesh>
  );
}

export function ArachnidCore() {
  const isMutated = useStore((state) => state.isDismantled);
  const explosion = useStore((state) => state.explosion);
  const mutateProgress = useRef(0);
  
  const groupRef = useRef<THREE.Group>(null);
  const webRef = useRef<THREE.LineSegments>(null);
  const spiderMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const webMatRef = useRef<THREE.LineBasicMaterial>(null);

  // Procedural Web Generation
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

    if (groupRef.current) {
      groupRef.current.rotation.z = time * (0.05 + m * 0.1);
      const s = THREE.MathUtils.lerp(1, 1.2, m);
      groupRef.current.scale.set(s, s, s);
    }
    if (webRef.current) {
      webRef.current.scale.z = THREE.MathUtils.lerp(1, Math.sin(time * 5) * 2, m);
    }
    if (spiderMatRef.current) {
      spiderMatRef.current.color.lerpColors(new THREE.Color('#39ff14'), new THREE.Color('#050505'), m);
    }
    if (webMatRef.current) {
      webMatRef.current.color.lerpColors(new THREE.Color('#39ff14'), new THREE.Color('#ff0033'), m);
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
          <Html position={[2, 0, 0]} center style={{ pointerEvents: 'none' }}>
            <div style={{ color: isMutated ? '#ff0033' : '#39ff14', fontFamily: 'monospace', fontSize: '10px', width: '150px', borderLeft: '1px solid currentColor', paddingLeft: '8px' }}>
              {isMutated ? 'SYMBIOTE HOST CORE' : 'RADIOACTIVE ABDOMEN'}
            </div>
          </Html>
        </mesh>

        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>

        {/* 8 Organic Tentacle Legs */}
        {[...Array(8)].map((_, i) => {
          const isLeft = i < 4;
          const yPos = 1 - (i % 4) * 0.6;
          const xDir = isLeft ? -1 : 1;
          
          return (
            <group key={i} position={[0.5 * xDir, yPos, 0]}>
              {/* @ts-ignore */}
              <Tentacle isLeft={isLeft} index={i} isMutated={isMutated} mutateProgress={mutateProgress.current} time={Date.now() / 1000} />
            </group>
          );
        })}

        {/* Fangs */}
        <group position={[0, 1.8, 0]}>
          <mesh position={[-0.3, 0.5, 0]} rotation={[0, 0, 0.5]}>
            <coneGeometry args={[0.1, 1.5, 4]} />
            <meshBasicMaterial color={isMutated ? '#ff0033' : '#39ff14'} />
          </mesh>
          <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, -0.5]}>
            <coneGeometry args={[0.1, 1.5, 4]} />
            <meshBasicMaterial color={isMutated ? '#ff0033' : '#39ff14'} />
          </mesh>
          <Html position={[0, 2, 0]} center style={{ pointerEvents: 'none' }}>
            <div style={{ color: isMutated ? '#ff0033' : '#39ff14', fontFamily: 'monospace', fontSize: '10px', width: '150px', borderBottom: '1px solid currentColor', paddingBottom: '4px' }}>
              {isMutated ? 'VENOM FANGS ACTIVE' : 'ARACHNID MANDIBLES'}
            </div>
          </Html>
        </group>
      </group>
    </group>
  );
}
