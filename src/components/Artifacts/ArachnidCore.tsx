"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

export function ArachnidCore() {
  const scroll = useScroll();
  const explosion = useStore((state) => state.explosion);
  const isDismantled = useStore((state) => state.isDismantled);
  const dismantleProgress = useRef(0);
  
  const groupRef = useRef<THREE.Group>(null);
  const webRef = useRef<THREE.LineSegments>(null);
  
  // 8 Leg references for animation
  const legRefs = useRef<THREE.Group[]>([]);

  // Clipping planes for the Reality Split effect
  const planeBlueprint = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  const planeMachine = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

  // Procedural Web Generation (Ultra-fine deliberate lines)
  const webGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radials = 32; // Doubled density for crazier web
    const spirals = 40; // Doubled density
    const maxRadius = 15;

    // Radial Threads
    for (let i = 0; i < radials; i++) {
      const angle = (i / radials) * Math.PI * 2;
      points.push(new THREE.Vector3(0, 0, 0));
      points.push(new THREE.Vector3(Math.cos(angle) * maxRadius, Math.sin(angle) * maxRadius, 0));
    }

    // Spiral Threads
    for (let s = 1; s <= spirals; s++) {
      const r = (s / spirals) * maxRadius;
      for (let i = 0; i < radials; i++) {
        const a1 = (i / radials) * Math.PI * 2;
        const a2 = ((i + 1) / radials) * Math.PI * 2;
        
        // Sagging effect (web droops in Z axis slightly to create a 3D bowl shape)
        const sag = Math.sin(r * 0.5) * 2 * (1 - r/maxRadius);
        
        points.push(new THREE.Vector3(Math.cos(a1) * r, Math.sin(a1) * r, sag));
        points.push(new THREE.Vector3(Math.cos(a2) * r, Math.sin(a2) * r, sag));
      }
    }
    
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const offset = scroll.offset;
    
    // MRI scanner sweeping (controlling the split)
    const scanY = Math.sin(time * 1.5) * 8; 
    planeBlueprint.constant = scanY;
    planeMachine.constant = -scanY;

    // Smooth transition for dismantle
    dismantleProgress.current = THREE.MathUtils.lerp(
      dismantleProgress.current, 
      isDismantled ? 1 : 0, 
      0.08
    );
    const d = dismantleProgress.current;
    const pulse = 1 + explosion * 2;

    if (groupRef.current) {
      if (offset > 0.75) {
        const flyby = (offset - 0.75) * 4; 
        const scale = THREE.MathUtils.lerp(1, 15, flyby);
        groupRef.current.scale.setScalar(scale);
        groupRef.current.position.z = THREE.MathUtils.lerp(-5, 10, flyby);
        groupRef.current.visible = flyby < 0.8;
      } else if (offset > 0.25) {
        const entry = Math.min(1, (offset - 0.25) * 4);
        groupRef.current.scale.setScalar(1);
        groupRef.current.position.z = THREE.MathUtils.lerp(-30, -5, entry);
        groupRef.current.visible = true;
      } else {
        groupRef.current.visible = false;
      }

      // Rotate entire structure majestically
      groupRef.current.rotation.z = time * 0.05;
      
      // On dismantle, snap to perfectly flat front-facing schematic
      groupRef.current.rotation.x = THREE.MathUtils.lerp(Math.sin(time * 0.2) * 0.2, 0, d);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(Math.sin(time * 0.3) * 0.2, 0, d);
    }

    // Animate the 3D Web (Flattens on dismantle)
    if (webRef.current) {
      const positions = webGeometry.attributes.position.array as Float32Array;
      for(let i=0; i<positions.length; i+=3) {
        // Original Z was stored in the geometry, but we mutate it here for the snap effect
        // We know Z is the 3rd element. We will scale Z down to 0 on dismantle.
        // To be safe, we just scale the entire web mesh's Z axis.
      }
      webRef.current.scale.z = THREE.MathUtils.lerp(1, 0, d);
    }

    // Animate Spider Legs (Breathing -> Snapping open)
    legRefs.current.forEach((leg, index) => {
      if (!leg) return;
      const isLeft = index < 4;
      
      // Organic breathing twitch
      const twitch = Math.sin(time * 4 + index) * 0.1 * pulse;
      
      // Base curled position
      const curlZ = isLeft ? 1.5 : -1.5;
      
      // On dismantle, legs snap out violently flat
      const flatZ = isLeft ? 0.2 : -0.2;
      
      leg.rotation.z = THREE.MathUtils.lerp(curlZ + twitch, flatZ, d);
      leg.rotation.x = THREE.MathUtils.lerp(twitch * 0.5, 0, d);
    });
  });

  // Stark Graphic Materials (Nuclear Red & Bright White)
  const machineMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#ff0033', // Nuclear Red
    clippingPlanes: [planeMachine],
    side: THREE.DoubleSide
  }), [planeMachine]);

  const blueprintMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#ffffff', // Bright White
    wireframe: true,
    clippingPlanes: [planeBlueprint],
    side: THREE.DoubleSide
  }), [planeBlueprint]);
  
  const webMat = useMemo(() => new THREE.LineBasicMaterial({ 
    color: '#ffffff', 
    transparent: true, 
    opacity: 0.3 
  }), []);

  return (
    <group ref={groupRef}>
      {/* Massive 3D Web */}
      <lineSegments ref={webRef} geometry={webGeometry} material={webMat} />

      {/* The Arachnid Body */}
      <group>
        {/* Abdomen */}
        <mesh position={[0, -1, 0]}>
          <capsuleGeometry args={[0.8, 1.5, 16, 32]} />
          <primitive object={machineMat} attach="material" />
        </mesh>
        <mesh position={[0, -1, 0]}>
          <capsuleGeometry args={[0.8, 1.5, 16, 32]} />
          <primitive object={blueprintMat} attach="material" />
        </mesh>

        {/* Head / Thorax */}
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <primitive object={machineMat} attach="material" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <primitive object={blueprintMat} attach="material" />
        </mesh>

        {/* 8 Mechanical Legs */}
        {[...Array(8)].map((_, i) => {
          const isLeft = i < 4;
          const yPos = 1 - (i % 4) * 0.6; // Spread along thorax
          const xDir = isLeft ? -1 : 1;
          
          return (
            <group 
              key={i} 
              position={[0.5 * xDir, yPos, 0]} 
              rotation={[0, 0, isLeft ? Math.PI : 0]}
            >
              <group 
                ref={(el) => {
                  if (el) legRefs.current[i] = el;
                }}
                rotation={[0, 0, 1.5]}
              >
                {/* Femur (Sharper) */}
                <mesh position={[1.5, 0, 0]}>
                  <boxGeometry args={[3, 0.05, 0.05]} />
                  <primitive object={isLeft ? blueprintMat : machineMat} attach="material" />
                </mesh>
                
                {/* Tibia (Longer, sharper, aggressive) */}
                <group position={[3, 0, 0]} rotation={[0, 0, -2.5]}>
                  <mesh position={[3, 0, 0]}>
                    <coneGeometry args={[0.05, 6, 4]} />
                    <primitive object={isLeft ? blueprintMat : machineMat} attach="material" />
                  </mesh>
                </group>
              </group>
            </group>
          );
        })}

        {/* Aggressive Pedipalps (Fangs) */}
        <group position={[0, 1.8, 0]}>
          <mesh position={[-0.3, 0.5, 0]} rotation={[0, 0, 0.5]}>
            <coneGeometry args={[0.1, 1.5, 4]} />
            <primitive object={blueprintMat} attach="material" />
          </mesh>
          <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, -0.5]}>
            <coneGeometry args={[0.1, 1.5, 4]} />
            <primitive object={machineMat} attach="material" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
