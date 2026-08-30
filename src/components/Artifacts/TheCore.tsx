"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function TheCore() {
  const isMutated = useStore((state) => state.isDismantled);
  const explosion = useStore((state) => state.explosion);
  const mutateProgress = useRef(0);
  
  const groupRef = useRef<THREE.Group>(null);
  const pupilRef = useRef<THREE.Mesh>(null);
  const irisRef = useRef<THREE.Group>(null);
  const clockRef = useRef<THREE.Group>(null);

  const irisMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const clockMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    mutateProgress.current = THREE.MathUtils.lerp(mutateProgress.current, isMutated ? 1 : 0, 0.1);
    const m = mutateProgress.current;

    if (groupRef.current) {
      const explodeScale = 1 + explosion * 2; 
      
      // Snaps to perfect head-on view on mutation
      groupRef.current.position.y = THREE.MathUtils.lerp(Math.sin(time * 0.5) * 0.5, 0, m);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 6, 0, m);
      
      const s = THREE.MathUtils.lerp(1, 1.2, m) * explodeScale;
      groupRef.current.scale.set(s, s, s);
    }

    const speedMult = 1 + explosion * 20;

    if (pupilRef.current) {
      const pulse = 1 + Math.sin(time * 5) * 0.05 + (explosion * 3);
      pupilRef.current.scale.set(pulse, pulse, pulse);
    }
    
    if (irisRef.current) {
      irisRef.current.rotation.z = time * (0.5 + m) * speedMult;
      const dilation = THREE.MathUtils.lerp(1, 1.5, m);
      irisRef.current.scale.setScalar(dilation);
    }

    if (clockRef.current) {
      clockRef.current.rotation.z = -time * (0.2 + m * 0.5) * speedMult;
      const clockScale = 1 + explosion * 2;
      clockRef.current.scale.setScalar(clockScale);
    }

    if (irisMatRef.current) {
      irisMatRef.current.color.lerpColors(
        new THREE.Color('#39ff14'), // Alien Green
        new THREE.Color('#ff0033'), // Symbiote Red
        m
      );
    }
    if (clockMatRef.current) {
      clockMatRef.current.color.lerpColors(
        new THREE.Color('#39ff14'),
        new THREE.Color('#ff0033'),
        m
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -8]}>
      {/* Central Pupil */}
      <mesh ref={pupilRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Iris Rings */}
      <group ref={irisRef}>
        <mesh position={[0, 0, 0.1]}>
          <ringGeometry args={[1.6, 2.2, 64, 1, 0, Math.PI * 1.5]} />
          <meshBasicMaterial ref={irisMatRef} color="#39ff14" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, -0.1]} rotation={[0, 0, Math.PI]}>
          <ringGeometry args={[2.5, 3.5, 64, 1, 0, Math.PI * 1.2]} />
          <meshBasicMaterial ref={irisMatRef} color="#39ff14" side={THREE.DoubleSide} />
        </mesh>
      </group>
      
      {/* The Clockwork Outer Boundary */}
      <group ref={clockRef} rotation={[0, 0, 0]}>
        <mesh>
          <ringGeometry args={[5, 5.05, 64]} />
          <meshBasicMaterial ref={clockMatRef} color="#39ff14" side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[6, 6.02, 64]} />
          <meshBasicMaterial ref={clockMatRef} color="#39ff14" side={THREE.DoubleSide} />
        </mesh>
        
        {/* Roman Numerals */}
        {ROMAN_NUMERALS.map((num, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const r = 5.5;
          const x = Math.cos(angle - Math.PI/2 + Math.PI/12) * r;
          const y = Math.sin(angle - Math.PI/2 + Math.PI/12) * r;
          
          return (
            <group key={i} position={[x, y, 0]} rotation={[0, 0, angle + Math.PI/12]}>
              <Text
                color="#ffffff"
                fontSize={0.6}
                maxWidth={2}
                lineHeight={1}
                letterSpacing={0.02}
                textAlign="center"
                font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                anchorX="center"
                anchorY="middle"
              >
                {num}
              </Text>
            </group>
          );
        })}
      </group>
    </group>
  );
}
