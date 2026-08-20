"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export function TheEye() {
  const eyeRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (eyeRef.current) {
      // Very slow rotation
      eyeRef.current.rotation.z += delta * 0.05;
      eyeRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <group position={[0, 0, -60]}>
      {/* 
        The final mechanical eye that looks back at the user.
        It's huge but very faint in the fog/distance.
      */}
      <group ref={eyeRef}>
        <mesh>
          <sphereGeometry args={[10, 32, 32]} />
          <meshBasicMaterial color="#001122" wireframe transparent opacity={0.3} />
        </mesh>
        
        <mesh>
          <torusGeometry args={[12, 0.1, 16, 100]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.1} />
        </mesh>
        
        {/* The glowing dot (pupil) */}
        <mesh>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#00ffff" emissiveIntensity={5} />
        </mesh>
      </group>

      <Html position={[0, -15, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '14px',
          textAlign: 'center',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          textShadow: '0 0 10px #00ffff',
          whiteSpace: 'nowrap'
        }}>
          Archive Closed.<br/><br/>
          <span style={{ opacity: 0.5, fontSize: '10px' }}>Until Another Curious Mind Arrives.</span>
        </div>
      </Html>
    </group>
  );
}
