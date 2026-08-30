"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

export function CyberMask() {
  const isMutated = useStore((state) => state.isDismantled); // isDismantled acts as isMutated
  const explosion = useStore((state) => state.explosion);
  const mutateProgress = useRef(0);
  
  const groupRef = useRef<THREE.Group>(null);
  const eyeRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Group>(null);
  const wingLeftRef = useRef<THREE.Group>(null);
  const wingRightRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Smooth transition between Alien and Symbiote
    mutateProgress.current = THREE.MathUtils.lerp(mutateProgress.current, isMutated ? 1 : 0, 0.1);
    const m = mutateProgress.current;
    const pulse = 1 + explosion * 2;

    if (groupRef.current) {
      // Floating motion
      groupRef.current.position.y = Math.sin(time) * 0.2;
      
      // The mask twitches violently when mutated
      const twitch = m > 0.5 ? Math.sin(time * 20) * 0.05 : 0;
      groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.3 + twitch;
      groupRef.current.rotation.x = twitch;
      
      // Scales up and pushes forward when mutated
      const scale = THREE.MathUtils.lerp(1, 1.3, m);
      groupRef.current.scale.set(scale, scale, scale);
      groupRef.current.position.z = THREE.MathUtils.lerp(0, 2, m);
    }

    if (eyeRef.current) {
      // Eye pulses aggressively when mutated
      const eyeScale = THREE.MathUtils.lerp(pulse, pulse * 1.5, m);
      eyeRef.current.scale.setScalar(eyeScale);
    }
    
    if (haloRef.current) {
      haloRef.current.rotation.z = time * (0.1 + m * 0.5); // Spins faster when mutated
      haloRef.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 4, 0, m);
    }

    if (wingLeftRef.current && wingRightRef.current) {
      const breathe = Math.sin(time) * 0.05;
      
      // Wings snap open into aggressive spider-like mandibles when mutated
      wingLeftRef.current.rotation.y = THREE.MathUtils.lerp(Math.PI / 6 + breathe, 0, m);
      wingLeftRef.current.position.x = THREE.MathUtils.lerp(-1.2, -2.5, m);
      wingLeftRef.current.rotation.z = THREE.MathUtils.lerp(Math.PI / 2, Math.PI / 4, m);
      
      wingRightRef.current.rotation.y = THREE.MathUtils.lerp(-Math.PI / 6 - breathe, 0, m);
      wingRightRef.current.position.x = THREE.MathUtils.lerp(1.2, 2.5, m);
      wingRightRef.current.rotation.z = THREE.MathUtils.lerp(-Math.PI / 2, -Math.PI / 4, m);
    }
  });

  // Materials dynamically interpolate colors based on state
  // We can't interpolate useMemo easily, so we use a custom shader or just rely on two overlapping meshes, OR update material color in useFrame.
  // Actually, updating material color in useFrame is perfect for this.

  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const eyeMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (matRef.current) {
      const color = new THREE.Color().lerpColors(
        new THREE.Color('#39ff14'), // Alien Green
        new THREE.Color('#ff0033'), // Symbiote Red
        mutateProgress.current
      );
      matRef.current.color = color;
    }
    if (eyeMatRef.current) {
      const color = new THREE.Color().lerpColors(
        new THREE.Color('#ffffff'), // White pupil
        new THREE.Color('#000000'), // Black symbiote pupil
        mutateProgress.current
      );
      eyeMatRef.current.color = color;
    }
  });

  return (
    <group ref={groupRef}>
      <meshBasicMaterial ref={matRef} attach="material" color="#39ff14" wireframe={false} side={THREE.DoubleSide} />
      <meshBasicMaterial ref={eyeMatRef} attach="material-eye" color="#ffffff" />
      
      {/* Central Eye */}
      <mesh ref={eyeRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color="#ffffff" /> {/* Will be overridden by ref if we attached it properly, let's just use the ref directly */}
      </mesh>
      
      {/* Fix: Attach material refs directly to meshes */}
      <group>
        <mesh ref={eyeRef}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshBasicMaterial ref={eyeMatRef} color="#ffffff" />
        </mesh>

        <group ref={haloRef}>
          <mesh>
            <ringGeometry args={[2.5, 2.6, 64]} />
            <meshBasicMaterial ref={matRef} color="#39ff14" side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3.0, 3.1, 64]} />
            <meshBasicMaterial ref={matRef} color="#39ff14" side={THREE.DoubleSide} />
          </mesh>
        </group>

        <group ref={wingLeftRef}>
          <mesh>
            <ringGeometry args={[1.5, 3.5, 64, 1, 0, Math.PI]} />
            <meshBasicMaterial ref={matRef} color="#39ff14" side={THREE.DoubleSide} />
          </mesh>
        </group>

        <group ref={wingRightRef}>
          <mesh>
            <ringGeometry args={[1.5, 3.5, 64, 1, 0, Math.PI]} />
            <meshBasicMaterial ref={matRef} color="#39ff14" side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
