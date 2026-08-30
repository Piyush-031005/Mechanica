"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

export function CyberMask() {
  const isMutated = useStore((state) => state.isDismantled);
  const explosion = useStore((state) => state.explosion);
  const mutateProgress = useRef(0);
  
  const groupRef = useRef<THREE.Group>(null);
  
  // Layers
  const brainRef = useRef<THREE.Mesh>(null);
  const skullRef = useRef<THREE.Mesh>(null);
  const symbioteSkinRef = useRef<THREE.Mesh>(null);
  
  const brainMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const skullMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const skinMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Smooth transition between Alien and Symbiote
    mutateProgress.current = THREE.MathUtils.lerp(mutateProgress.current, isMutated ? 1 : 0, 0.1);
    const m = mutateProgress.current;
    const pulse = 1 + explosion * 2;

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time) * 0.2;
      const twitch = m > 0.5 ? Math.sin(time * 20) * 0.05 : 0;
      groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.3 + twitch;
      groupRef.current.rotation.x = twitch;
      
      const scale = THREE.MathUtils.lerp(1, 1.2, m);
      groupRef.current.scale.set(scale, scale, scale);
      groupRef.current.position.z = THREE.MathUtils.lerp(0, 2, m);
    }

    if (brainRef.current) {
      // Inner brain pulses heavily
      const brainScale = THREE.MathUtils.lerp(pulse, pulse * 1.5, m) * 0.5;
      brainRef.current.scale.setScalar(brainScale);
    }
    
    if (skullRef.current) {
      // Skull counter rotates
      skullRef.current.rotation.y = -time * 0.2;
      skullRef.current.scale.setScalar(0.7);
    }

    if (symbioteSkinRef.current) {
      // Outer skin violently expands and distorts
      symbioteSkinRef.current.rotation.y = time * 0.1;
      symbioteSkinRef.current.rotation.x = time * 0.05;
      
      // Expand skin off the skull when mutated
      const skinDistortion = THREE.MathUtils.lerp(1, 1.5 + Math.sin(time * 10) * 0.1, m);
      symbioteSkinRef.current.scale.set(1, skinDistortion, 1);
    }

    // Material interpolations
    if (brainMatRef.current) {
      brainMatRef.current.color.lerpColors(
        new THREE.Color('#ffffff'), // White energy brain
        new THREE.Color('#ff0033'), // Symbiote core
        m
      );
    }
    if (skullMatRef.current) {
      skullMatRef.current.color.lerpColors(
        new THREE.Color('#39ff14'), // Alien Green bones
        new THREE.Color('#050505'), // Void black bones
        m
      );
    }
    if (skinMatRef.current) {
      skinMatRef.current.color.lerpColors(
        new THREE.Color('#39ff14'), 
        new THREE.Color('#ff0033'), 
        m
      );
      // Fade out skin in normal mode to see skull better, make it opaque when mutated
      skinMatRef.current.opacity = THREE.MathUtils.lerp(0.1, 0.4, m);
    }
  });

  return (
    <group ref={groupRef}>
      {/* LAYER 1: INNER NEURAL CORE */}
      <mesh ref={brainRef}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial ref={brainMatRef} wireframe />
        <Html position={[1.5, 0.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{ color: isMutated ? '#ff0033' : '#ffffff', fontFamily: 'monospace', fontSize: '10px', width: '150px', borderLeft: '1px solid currentColor', paddingLeft: '8px', textShadow: '0 0 5px currentColor' }}>
            {isMutated ? 'CORRUPTED NEURAL MATRIX' : 'OMNI-ENERGY CEREBRUM'}
          </div>
        </Html>
      </mesh>

      {/* LAYER 2: STRUCTURAL SKULL / MASK */}
      <mesh ref={skullRef}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial ref={skullMatRef} wireframe />
        <Html position={[-2, 1, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{ color: isMutated ? '#050505' : '#39ff14', fontFamily: 'monospace', fontSize: '10px', width: '120px', borderBottom: '1px solid currentColor', paddingBottom: '4px', textAlign: 'right' }}>
            {isMutated ? 'HOST CRANIUM COMPROMISED' : 'GALVANIC SKULL LATTICE'}
          </div>
        </Html>
      </mesh>

      {/* LAYER 3: OUTER SYMBIOTE / ALIEN SKIN */}
      <mesh ref={symbioteSkinRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial ref={skinMatRef} transparent depthWrite={false} />
        <Html position={[0, -2, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{ color: isMutated ? '#ff0033' : '#39ff14', fontFamily: 'monospace', fontSize: '10px', width: '200px', borderTop: '1px solid currentColor', paddingTop: '4px', textAlign: 'center' }}>
            {isMutated ? 'SYMBIOTIC BINDING ENVELOPE' : 'ALIEN EXOSKELETON'}
          </div>
        </Html>
      </mesh>

      {/* Spider-Man Lenses Overlay */}
      <group position={[0, 0, 1.8]}>
        <mesh position={[-0.5, 0.3, 0]} rotation={[0, 0, 0.2]}>
          <planeGeometry args={[0.6, 0.3]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.5, 0.3, 0]} rotation={[0, 0, -0.2]}>
          <planeGeometry args={[0.6, 0.3]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
