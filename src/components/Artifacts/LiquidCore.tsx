import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float, Text } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function LiquidCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Crazy twisting geometry (Safety Pin / Knot vibe)
  const geometry = useMemo(() => new THREE.TorusKnotGeometry(4.5, 1.5, 300, 64, 2, 5), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Base rotation
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.1;
      
      // Mouse magnetic reactivity
      const targetX = (state.pointer.x * Math.PI) / 8;
      const targetY = (state.pointer.y * Math.PI) / 8;
      
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetX, 0.05);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -targetY, 0.05);
      
      // Gentle floating based on time
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.5;
    }
  });

  return (
    <group>
      {/* Massive Graphic Poster Typography */}
      <Text
        font="/fonts/Orbitron-Black.ttf"
        fontSize={3.2}
        letterSpacing={0.05}
        color="#00f0ff"
        position={[0, 0, -1]} // Positioned slightly behind so the knot weaves through it
        anchorX="center"
        anchorY="middle"
        characters="NEVERA"
      >
        NEVERA
      </Text>
      <Text
        font="/fonts/Orbitron-Black.ttf"
        fontSize={4.2}
        letterSpacing={0.02}
        color="#ffffff"
        position={[0, -3.2, 0]}
        anchorX="center"
        anchorY="middle"
        characters="NEVERA"
      >
        Navera
      </Text>

      {/* The Liquid/Chrome Object intertwining with the text */}
      <mesh ref={meshRef} geometry={geometry} position={[0, 0, 0]}>
        <MeshTransmissionMaterial
          backside
          samples={4} // Reduced to 4 to fix precision warnings and improve performance
          resolution={128} // Explicit resolution
          thickness={3}
          chromaticAberration={1.0}
          anisotropy={0.8}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          color="#00f0ff" // Bright cyan liquid tint
          attenuationDistance={3}
          attenuationColor="#ffffff"
          clearcoat={1}
          roughness={0.02}
          transmission={1}
          ior={1.3}
        />
      </mesh>
    </group>
  );
}
