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
  
  // Layers
  const brainRef = useRef<THREE.Mesh>(null);
  const skullRef = useRef<THREE.Mesh>(null);
  const symbioteRingsRef = useRef<THREE.Group>(null);
  
  const brainMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const skullMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);

  // Procedural Spider Lenses
  const lensShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.5, 0.8, 1.2, 1);
    shape.quadraticCurveTo(0.8, 0, 0, -0.2);
    shape.lineTo(0, 0);
    return new THREE.ShapeGeometry(shape);
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    mutateProgress.current = THREE.MathUtils.lerp(mutateProgress.current, isMutated ? 1 : 0, 0.1);
    const m = mutateProgress.current;
    const pulse = 1 + Math.sin(time * 5) * 0.1 + explosion * 2;

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 2) * 0.2;
      const twitch = m > 0.5 ? Math.sin(time * 30) * 0.05 : 0;
      groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.2 + twitch;
      groupRef.current.rotation.x = twitch;
      
      const scale = THREE.MathUtils.lerp(1, 1.3, m);
      groupRef.current.scale.set(scale, scale, scale);
    }

    if (brainRef.current) {
      // Alien Brain twists and writhes
      brainRef.current.rotation.x = time * 0.5;
      brainRef.current.rotation.y = time * 0.3;
      const brainScale = THREE.MathUtils.lerp(pulse, pulse * 1.5, m) * 0.6;
      brainRef.current.scale.setScalar(brainScale);
    }
    
    if (skullRef.current) {
      // Containment field / Skull snaps open
      skullRef.current.rotation.y = -time * 0.2;
      const skullScale = THREE.MathUtils.lerp(1.2, 1.5 + Math.sin(time * 15) * 0.1, m);
      skullRef.current.scale.setScalar(skullScale);
    }

    if (symbioteRingsRef.current) {
      // Rings orbit like a chaotic atom when mutated
      symbioteRingsRef.current.children.forEach((ring, i) => {
        ring.rotation.x = time * (0.2 + m * 2) + i;
        ring.rotation.y = time * (0.3 + m * 2) + i;
      });
    }

    // Material interpolations
    if (brainMatRef.current) {
      brainMatRef.current.color.lerpColors(
        new THREE.Color('#ffffff'), 
        new THREE.Color('#ff0033'), 
        m
      );
    }
    if (skullMatRef.current) {
      skullMatRef.current.color.lerpColors(
        new THREE.Color('#39ff14'), 
        new THREE.Color('#050505'), 
        m
      );
      skullMatRef.current.wireframe = m < 0.5; // Becomes solid void when mutated
    }
    if (ringMatRef.current) {
      ringMatRef.current.color.lerpColors(
        new THREE.Color('#39ff14'), 
        new THREE.Color('#ff0033'), 
        m
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* LAYER 1: INNER NEURAL CORE (Torus Knot) */}
      <mesh ref={brainRef}>
        <torusKnotGeometry args={[1, 0.4, 128, 32]} />
        <meshBasicMaterial ref={brainMatRef} wireframe />
        <Html position={[2, 1, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{ color: isMutated ? '#ff0033' : '#ffffff', fontFamily: 'monospace', fontSize: '10px', width: '150px', borderLeft: '1px solid currentColor', paddingLeft: '8px', textShadow: '0 0 5px currentColor' }}>
            {isMutated ? 'CORRUPTED NEURAL MATRIX' : 'OMNI-ENERGY CEREBRUM'}
          </div>
        </Html>
      </mesh>

      {/* LAYER 2: STRUCTURAL SKULL / CONTAINMENT FIELD */}
      <mesh ref={skullRef}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial ref={skullMatRef} wireframe />
        <Html position={[-2.5, 1, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{ color: isMutated ? '#050505' : '#39ff14', fontFamily: 'monospace', fontSize: '10px', width: '120px', borderBottom: '1px solid currentColor', paddingBottom: '4px', textAlign: 'right' }}>
            {isMutated ? 'HOST CRANIUM COMPROMISED' : 'GALVANIC SKULL LATTICE'}
          </div>
        </Html>
      </mesh>

      {/* LAYER 3: ORBITING SYMBIOTE RINGS */}
      <group ref={symbioteRingsRef}>
        {[1.8, 2.0, 2.2].map((radius, i) => (
          <mesh key={i}>
            <torusGeometry args={[radius, 0.02, 16, 100]} />
            <meshBasicMaterial ref={i === 0 ? ringMatRef : undefined} color={isMutated ? '#ff0033' : '#39ff14'} />
          </mesh>
        ))}
        <Html position={[0, -2.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{ color: isMutated ? '#ff0033' : '#39ff14', fontFamily: 'monospace', fontSize: '10px', width: '200px', borderTop: '1px solid currentColor', paddingTop: '4px', textAlign: 'center' }}>
            {isMutated ? 'SYMBIOTIC BINDING RINGS' : 'DNA CONTAINMENT FIELD'}
          </div>
        </Html>
      </group>

      {/* Spider-Man Lenses Overlay */}
      <group position={[0, 0, 1.3]}>
        <mesh position={[-0.2, 0, 0]} rotation={[0, 0, 0.2]}>
          <primitive object={lensShape} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.2, 0, 0]} rotation={[0, Math.PI, -0.2]}>
          <primitive object={lensShape} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
