"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Html, Edges } from "@react-three/drei";

export function Owl() {
  const headRef = useRef<THREE.Group>(null);
  const [mousePos, setMousePos] = useState(new THREE.Vector2());
  const { viewport } = useThree();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates (-1 to +1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos(new THREE.Vector2(x, y));
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (headRef.current) {
      // Lerp the head rotation to look at the mouse
      const targetRotationX = -mousePos.y * 0.5;
      const targetRotationY = mousePos.x * 0.8;
      
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotationX, 0.05);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotationY, 0.05);
    }
  });

  return (
    <group position={[0, -50, -45]}>
      <Html position={[0, 4, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          color: '#000000',
          fontFamily: 'monospace',
          fontSize: '10px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          textShadow: '0 0 5px rgba(255,255,255,0.8)'
        }}>
          NIGHT-WATCH SYSTEM<br/>
          ACTIVE TRACKING
        </div>
      </Html>

      {/* Body */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1, 1.5, 3, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} />
        <Edges color="black" />
      </mesh>
      
      {/* Armor Plates on Body */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 0.5 - (i * 0.3), 0]} rotation={[0.1, i * 0.5, 0]}>
          <cylinderGeometry args={[1.1 + (i * 0.05), 1.2 + (i * 0.05), 0.2, 8]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} />
          <Edges color="black" />
        </mesh>
      ))}

      {/* Head */}
      <group ref={headRef} position={[0, 2.5, 0]}>
        {/* Dome */}
        <mesh>
          <sphereGeometry args={[1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} />
          <Edges color="black" />
        </mesh>
        
        {/* Base of Head */}
        <mesh rotation={[Math.PI, 0, 0]}>
           <sphereGeometry args={[1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
           <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} />
           <Edges color="black" />
        </mesh>

        {/* Left Eye (Lens) */}
        <group position={[-0.4, 0.2, 1.1]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Glowing Aperture */}
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#FF0000" emissiveIntensity={2} />
          </mesh>
        </group>
        
        {/* Right Eye (Lens) */}
        <group position={[0.4, 0.2, 1.1]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Glowing Aperture */}
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ffffff" emissive="#FF0000" emissiveIntensity={2} />
          </mesh>
        </group>
        
        {/* Beak Mechanism */}
        <mesh position={[0, -0.3, 1.2]} rotation={[Math.PI / 4, 0, 0]}>
          <coneGeometry args={[0.2, 0.5, 4]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} />
          <Edges color="black" />
        </mesh>
      </group>
      
    </group>
  );
}
