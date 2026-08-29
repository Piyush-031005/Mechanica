"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll, Text, Edges } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

const PARTICLE_COUNT = 3000;
const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function CorePart({ isBlueprint, clippingPlanes }: { isBlueprint: boolean, clippingPlanes: THREE.Plane[] }) {
  const scroll = useScroll();
  const explosion = useStore((state) => state.explosion);
  
  const groupRef = useRef<THREE.Group>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const diskRef = useRef<THREE.InstancedMesh>(null);
  const clockRef = useRef<THREE.Group>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Precompute random particle parameters for the intense blue accretion disk
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 2 + Math.random() * 5;
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 0.5 + 0.5) * (15 / radius); 
      // Swirling tornado effect
      const yOffset = (Math.random() - 0.5) * (radius * 0.5);
      
      data.push({ radius, angle, speed, yOffset });
    }
    return data;
  }, []);

  useFrame((state) => {
    const offset = scroll.offset; 
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Enter animation
      const localOffset = Math.max(0, (offset - 0.7) * 4);
      const scale = THREE.MathUtils.lerp(0.001, 1, Math.min(1, localOffset)); 
      const explodeScale = 1 + explosion * 2; 
      
      groupRef.current.scale.set(scale * explodeScale, scale * explodeScale, scale * explodeScale);
      groupRef.current.visible = offset > 0.65;
      
      // Floating motion
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.5;
    }

    const speedMult = 1 + explosion * 20;

    if (sunRef.current) {
      sunRef.current.rotation.y = time * 2 * speedMult;
      const pulse = 1 + Math.sin(time * 20) * 0.05 + (explosion * 3);
      sunRef.current.scale.set(pulse, pulse, pulse);
    }
    
    // The Red Roman Numeral Clock
    if (clockRef.current) {
      clockRef.current.rotation.z = -time * 0.1 * speedMult;
      const clockScale = 1 + explosion * 2;
      clockRef.current.scale.set(clockScale, clockScale, clockScale);
    }

    // Swirling Blue Accretion Disk Simulation
    if (diskRef.current) {
      particles.forEach((p, i) => {
        const currentAngle = p.angle + time * p.speed * speedMult;
        
        const scatterX = explosion > 0 ? (Math.random() - 0.5) * explosion * 50 : 0;
        const scatterY = explosion > 0 ? (Math.random() - 0.5) * explosion * 50 : 0;
        const scatterZ = explosion > 0 ? (Math.random() - 0.5) * explosion * 50 : 0;
        
        // Fluid spiral math
        const x = Math.cos(currentAngle) * p.radius;
        const z = Math.sin(currentAngle) * p.radius;
        const y = p.yOffset + Math.sin(currentAngle * 3 + time) * 0.5; // Wave motion
        
        dummy.position.set(x + scatterX, y + scatterY, z + scatterZ);
        dummy.rotation.y = -currentAngle;
        
        const s = 1 + explosion * 2;
        // Elongated particles for speed effect
        dummy.scale.set(s * 0.1, s * 0.1, s * 1.5);
        dummy.updateMatrix();
        
        diskRef.current!.setMatrixAt(i, dummy.matrix);
      });
      diskRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const sunMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true, transparent: true, opacity: 0.8, clippingPlanes });
    return new THREE.MeshStandardMaterial({ color: '#000000', roughness: 0, clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  const diskMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#0044ff', transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, clippingPlanes }); 
    return new THREE.MeshBasicMaterial({ color: '#00ccff', transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, clippingPlanes }); 
  }, [isBlueprint, clippingPlanes]);

  return (
    <group ref={groupRef} position={[0, -2, -8]}>
      {/* Central Black Hole Singularity */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <primitive object={sunMat} attach="material" />
      </mesh>
      
      {/* The Red Clockwork Ring */}
      <group ref={clockRef} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[5, 5.05, 64]} />
          <meshBasicMaterial color={isBlueprint ? "#ffffff" : "#ff0000"} clippingPlanes={clippingPlanes} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <ringGeometry args={[6, 6.02, 64]} />
          <meshBasicMaterial color={isBlueprint ? "#ffffff" : "#ff0000"} clippingPlanes={clippingPlanes} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Roman Numerals */}
        {ROMAN_NUMERALS.map((num, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const r = 5.5;
          const x = Math.cos(angle - Math.PI/2 + Math.PI/12) * r; // +Math.PI/12 to align 12 at top properly based on math
          const y = Math.sin(angle - Math.PI/2 + Math.PI/12) * r;
          
          return (
            <group key={i} position={[x, y, 0]} rotation={[0, 0, angle + Math.PI/12]}>
              <Text
                color={isBlueprint ? "#ffffff" : "#ff0000"}
                fontSize={0.6}
                maxWidth={2}
                lineHeight={1}
                letterSpacing={0.02}
                textAlign="center"
                font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                anchorX="center"
                anchorY="middle"
                material-clippingPlanes={clippingPlanes}
              >
                {num}
              </Text>
            </group>
          );
        })}
      </group>

      {/* Swirling Blue Accretion Disk */}
      <instancedMesh ref={diskRef} args={[undefined as any, undefined as any, PARTICLE_COUNT]} rotation={[Math.PI / 6, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={diskMat} attach="material" />
      </instancedMesh>
    </group>
  );
}

export function TheCore() {
  const laserRef = useRef<THREE.Mesh>(null);
  
  const planeBlueprint = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  const planeMachine = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  
  useFrame((state) => {
    const yPos = Math.sin(state.clock.elapsedTime * 2) * 3; 
    planeBlueprint.constant = yPos;
    planeMachine.constant = -yPos;
    
    if (laserRef.current) {
      laserRef.current.position.y = yPos;
    }
  });

  return (
    <group position={[0, 0, -3]}>
      <CorePart isBlueprint={true} clippingPlanes={[planeBlueprint]} />
      <CorePart isBlueprint={false} clippingPlanes={[planeMachine]} />
      
      <mesh ref={laserRef} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
