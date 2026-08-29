"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll, Text } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function CorePart({ isBlueprint, clippingPlanes }: { isBlueprint: boolean, clippingPlanes: THREE.Plane[] }) {
  const scroll = useScroll();
  const explosion = useStore((state) => state.explosion);
  const isDismantled = useStore((state) => state.isDismantled);
  const dismantleProgress = useRef(0);
  
  const groupRef = useRef<THREE.Group>(null);
  const pupilRef = useRef<THREE.Mesh>(null);
  const irisRef = useRef<THREE.Group>(null);
  const clockRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const offset = scroll.offset; 
    const time = state.clock.elapsedTime;
    
    dismantleProgress.current = THREE.MathUtils.lerp(dismantleProgress.current, isDismantled ? 1 : 0, 0.1);
    const d = dismantleProgress.current;

    if (groupRef.current) {
      // Enter animation
      const localOffset = Math.max(0, (offset - 0.7) * 4);
      const scale = THREE.MathUtils.lerp(0.001, 1, Math.min(1, localOffset)); 
      const explodeScale = 1 + explosion * 2; 
      
      groupRef.current.scale.setScalar(scale * explodeScale);
      groupRef.current.visible = offset > 0.65;
      
      // Floating motion (flattens on dismantle)
      groupRef.current.position.y = THREE.MathUtils.lerp(Math.sin(time * 0.5) * 0.5, 0, d);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(0, Math.PI / 4, d);
    }

    const speedMult = 1 + explosion * 20;

    if (pupilRef.current) {
      const pulse = 1 + Math.sin(time * 5) * 0.05 + (explosion * 3);
      pupilRef.current.scale.set(pulse, pulse, pulse);
    }
    
    if (irisRef.current) {
      irisRef.current.rotation.z = time * 0.5 * speedMult;
      // Dilation effect
      const dilation = THREE.MathUtils.lerp(1, 1.5, d);
      irisRef.current.scale.setScalar(dilation);
    }

    if (clockRef.current) {
      clockRef.current.rotation.z = -time * 0.2 * speedMult;
      const clockScale = 1 + explosion * 2;
      clockRef.current.scale.setScalar(clockScale);
    }
  });

  const pupilMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ffffff', wireframe: true, clippingPlanes });
    return new THREE.MeshBasicMaterial({ color: '#000000', clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  const irisMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ffffff', clippingPlanes, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    return new THREE.MeshBasicMaterial({ color: '#ff0033', clippingPlanes, side: THREE.DoubleSide });
  }, [isBlueprint, clippingPlanes]);

  const clockMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({ color: isBlueprint ? '#ffffff' : '#ff0033', clippingPlanes, side: THREE.DoubleSide });
  }, [isBlueprint, clippingPlanes]);

  return (
    <group ref={groupRef} position={[0, -2, -8]}>
      {/* Central Pupil */}
      <mesh ref={pupilRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <primitive object={pupilMat} attach="material" />
      </mesh>

      {/* Iris Rings (Stark graphic overlap) */}
      <group ref={irisRef}>
        <mesh position={[0, 0, 0.1]}>
          <ringGeometry args={[1.6, 2.2, 64, 1, 0, Math.PI * 1.5]} />
          <primitive object={irisMat} attach="material" />
        </mesh>
        <mesh position={[0, 0, -0.1]} rotation={[0, 0, Math.PI]}>
          <ringGeometry args={[2.5, 3.5, 64, 1, 0, Math.PI * 1.2]} />
          <primitive object={irisMat} attach="material" />
        </mesh>
      </group>
      
      {/* The Red Clockwork Outer Boundary */}
      <group ref={clockRef} rotation={[0, 0, 0]}>
        <mesh>
          <ringGeometry args={[5, 5.05, 64]} />
          <primitive object={clockMat} attach="material" />
        </mesh>
        <mesh>
          <ringGeometry args={[6, 6.02, 64]} />
          <primitive object={clockMat} attach="material" />
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
                color={isBlueprint ? "#ffffff" : "#ff0033"}
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
    </group>
  );
}

export function TheCore() {
  const laserRef = useRef<THREE.Mesh>(null);
  
  const planeBlueprint = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  const planeMachine = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  
  useFrame((state) => {
    const yPos = Math.sin(state.clock.elapsedTime * 2) * 4; 
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
      
      {/* Scanner Line */}
      <mesh ref={laserRef} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}
