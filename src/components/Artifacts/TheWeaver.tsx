"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, Edges } from "@react-three/drei";
import * as THREE from "three";

// A single articulated leg for the mechanical spider
function SpiderLeg({ index, isBlueprint, clippingPlanes, position, rotationBase }: { index: number, isBlueprint: boolean, clippingPlanes: THREE.Plane[], position: [number, number, number], rotationBase: [number, number, number] }) {
  const legGroup = useRef<THREE.Group>(null);
  const femurRef = useRef<THREE.Group>(null);
  const tibiaRef = useRef<THREE.Group>(null);
  
  // Materials
  const material = useMemo(() => {
    if (isBlueprint) {
      return new THREE.MeshBasicMaterial({ color: '#34d399', wireframe: true, transparent: true, opacity: 0.8, clippingPlanes });
    } else {
      return new THREE.MeshStandardMaterial({ color: '#1a1817', roughness: 0.7, metalness: 0.8, flatShading: true, clippingPlanes });
    }
  }, [isBlueprint, clippingPlanes]);

  const jointMaterial = useMemo(() => {
    if (isBlueprint) {
      return new THREE.MeshBasicMaterial({ color: '#ff007f', wireframe: true, clippingPlanes });
    } else {
      return new THREE.MeshStandardMaterial({ color: '#444444', roughness: 0.3, metalness: 0.9, clippingPlanes });
    }
  }, [isBlueprint, clippingPlanes]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    // Each leg has a slight phase offset based on its index to create a crawling/idling effect
    const phase = index * (Math.PI / 4); 
    
    if (legGroup.current) {
      // The base joint (Coxa) swivels slightly
      legGroup.current.rotation.y = rotationBase[1] + Math.sin(time * 2 + phase) * 0.1;
    }
    if (femurRef.current) {
      // Femur lifts up and down
      femurRef.current.rotation.x = rotationBase[0] + Math.cos(time * 2 + phase) * 0.2;
    }
    if (tibiaRef.current) {
      // Tibia extends and retracts
      tibiaRef.current.rotation.x = Math.sin(time * 2 + phase - Math.PI/4) * 0.2;
    }
  });

  return (
    <group ref={legGroup} position={position}>
      {/* Coxa (Base joint connected to body) */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <primitive object={jointMaterial} attach="material" />
      </mesh>
      
      {/* Femur Group */}
      <group ref={femurRef} position={[0, 0, 0]}>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.1, 0.2, 3, 8]} />
          <primitive object={material} attach="material" />
        </mesh>
        
        {/* Knee Joint */}
        <mesh position={[0, 3, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <primitive object={jointMaterial} attach="material" />
        </mesh>

        {/* Tibia Group */}
        <group ref={tibiaRef} position={[0, 3, 0]} rotation={[0, 0, Math.PI / 2]}> {/* Pointing out and down */}
          <mesh position={[0, -2, 0]}>
            <cylinderGeometry args={[0.2, 0.05, 4, 8]} />
            <primitive object={material} attach="material" />
          </mesh>
          
          {/* Tarsus (Foot spike) */}
          <mesh position={[0, -4.5, 0]}>
            <coneGeometry args={[0.08, 1, 8]} />
            <primitive object={jointMaterial} attach="material" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function SpiderPart({ isBlueprint, clippingPlanes }: { isBlueprint: boolean, clippingPlanes: THREE.Plane[] }) {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const abdomenRef = useRef<THREE.Group>(null);
  
  // Materials
  const shellMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#34d399', wireframe: true, clippingPlanes });
    return new THREE.MeshStandardMaterial({ color: '#1a1817', roughness: 0.6, metalness: 0.8, flatShading: true, clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  const abdomenMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#8b5cf6', wireframe: true, clippingPlanes }); // Purple wireframe abdomen
    return new THREE.MeshPhysicalMaterial({ 
      color: '#ff0033', 
      transmission: 0.95,
      thickness: 2.0,
      roughness: 0.2,
      ior: 1.6,
      emissive: '#aa0000',
      emissiveIntensity: 0.5,
      clippingPlanes 
    });
  }, [isBlueprint, clippingPlanes]);

  const eyeMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ff007f', wireframe: true, clippingPlanes });
    return new THREE.MeshStandardMaterial({ color: '#ff0000', emissive: '#ff0000', emissiveIntensity: 5, clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  useFrame((state) => {
    const offset = scroll.offset; 
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Enter animation around offset 0.5
      const localOffset = Math.max(0, (offset - 0.5) * 2);
      const scale = THREE.MathUtils.lerp(0.001, 1, Math.min(1, localOffset * 2)); 
      groupRef.current.scale.set(scale, scale, scale);
      groupRef.current.visible = offset > 0.45;
      
      // Floating/Idle bobbing
      groupRef.current.position.y = Math.sin(time) * 0.2;
    }

    if (abdomenRef.current) {
      // Abdomen pulsates like a glowing sac
      const pulse = 1 + Math.sin(time * 3) * 0.02;
      abdomenRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -3]}>
      
      {/* Cephalothorax (Front Body) */}
      <mesh position={[0, 0, 1]}>
        <boxGeometry args={[2, 1, 3]} />
        <primitive object={shellMat} attach="material" />
        {isBlueprint && <Edges scale={1.01} threshold={15} color="#00ffff" />}
      </mesh>

      {/* Abdomen (Back Body) */}
      <group ref={abdomenRef} position={[0, 0.5, -2]}>
        <mesh>
          <sphereGeometry args={[2, 32, 32]} />
          <primitive object={abdomenMat} attach="material" />
        </mesh>
      </group>

      {/* 8 Glowing Eyes (arranged in a spider cluster) */}
      <group position={[0, 0.2, 2.6]}>
        {/* Top row */}
        <mesh position={[-0.4, 0.3, 0]}><sphereGeometry args={[0.1, 8, 8]} /><primitive object={eyeMat} attach="material" /></mesh>
        <mesh position={[0.4, 0.3, 0]}><sphereGeometry args={[0.1, 8, 8]} /><primitive object={eyeMat} attach="material" /></mesh>
        {/* Middle row (Main eyes) */}
        <mesh position={[-0.2, 0, 0.1]}><sphereGeometry args={[0.15, 8, 8]} /><primitive object={eyeMat} attach="material" /></mesh>
        <mesh position={[0.2, 0, 0.1]}><sphereGeometry args={[0.15, 8, 8]} /><primitive object={eyeMat} attach="material" /></mesh>
        {/* Bottom row */}
        <mesh position={[-0.5, -0.2, -0.1]}><sphereGeometry args={[0.08, 8, 8]} /><primitive object={eyeMat} attach="material" /></mesh>
        <mesh position={[0.5, -0.2, -0.1]}><sphereGeometry args={[0.08, 8, 8]} /><primitive object={eyeMat} attach="material" /></mesh>
        <mesh position={[-0.2, -0.2, 0]}><sphereGeometry args={[0.08, 8, 8]} /><primitive object={eyeMat} attach="material" /></mesh>
        <mesh position={[0.2, -0.2, 0]}><sphereGeometry args={[0.08, 8, 8]} /><primitive object={eyeMat} attach="material" /></mesh>
      </group>

      {/* 8 Articulated Legs */}
      {/* Right Side Legs */}
      <SpiderLeg index={0} isBlueprint={isBlueprint} clippingPlanes={clippingPlanes} position={[1.2, 0, 1.5]} rotationBase={[Math.PI/6, -Math.PI/6, 0]} />
      <SpiderLeg index={1} isBlueprint={isBlueprint} clippingPlanes={clippingPlanes} position={[1.2, 0, 0.5]} rotationBase={[Math.PI/4, 0, 0]} />
      <SpiderLeg index={2} isBlueprint={isBlueprint} clippingPlanes={clippingPlanes} position={[1.2, 0, -0.5]} rotationBase={[Math.PI/4, Math.PI/6, 0]} />
      <SpiderLeg index={3} isBlueprint={isBlueprint} clippingPlanes={clippingPlanes} position={[1.2, 0, -1.5]} rotationBase={[Math.PI/6, Math.PI/4, 0]} />
      
      {/* Left Side Legs */}
      <SpiderLeg index={4} isBlueprint={isBlueprint} clippingPlanes={clippingPlanes} position={[-1.2, 0, 1.5]} rotationBase={[Math.PI/6, Math.PI/6, 0]} />
      <SpiderLeg index={5} isBlueprint={isBlueprint} clippingPlanes={clippingPlanes} position={[-1.2, 0, 0.5]} rotationBase={[Math.PI/4, 0, 0]} />
      <SpiderLeg index={6} isBlueprint={isBlueprint} clippingPlanes={clippingPlanes} position={[-1.2, 0, -0.5]} rotationBase={[Math.PI/4, -Math.PI/6, 0]} />
      <SpiderLeg index={7} isBlueprint={isBlueprint} clippingPlanes={clippingPlanes} position={[-1.2, 0, -1.5]} rotationBase={[Math.PI/6, -Math.PI/4, 0]} />
      
    </group>
  );
}

// Master component managing the medium shift
export function TheWeaver() {
  const { viewport } = useThree();
  const planeBlueprint = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);
  const planeMachine = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  
  useFrame((state) => {
    const mouseX = (state.pointer.x * viewport.width) / 2;
    planeBlueprint.constant = mouseX;
    planeMachine.constant = -mouseX;
  });

  return (
    <group position={[0, -2, -5]}>
      {/* Left side: The Neon Technical Drawing */}
      <SpiderPart isBlueprint={true} clippingPlanes={[planeBlueprint]} />
      
      {/* Right side: The Photorealistic Dark Metal Machine */}
      <SpiderPart isBlueprint={false} clippingPlanes={[planeMachine]} />
    </group>
  );
}
