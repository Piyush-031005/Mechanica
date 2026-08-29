"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

export function CyberMask() {
  const scroll = useScroll();
  const explosion = useStore((state) => state.explosion);
  const isDismantled = useStore((state) => state.isDismantled);
  const dismantleProgress = useRef(0);
  
  const groupRef = useRef<THREE.Group>(null);
  const laserRef = useRef<THREE.Mesh>(null);
  
  // Create planes for clipping
  const planeBlueprint = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  const planeMachine = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const offset = scroll.offset; 
    
    // MRI scanner sweeping
    const yPos = Math.sin(time * 1.5) * 4; 
    planeBlueprint.constant = yPos;
    planeMachine.constant = -yPos;
    if (laserRef.current) {
      laserRef.current.position.y = yPos;
    }

    dismantleProgress.current = THREE.MathUtils.lerp(
      dismantleProgress.current, 
      isDismantled ? 1 : 0, 
      0.05
    );
    const d = dismantleProgress.current;

    if (groupRef.current) {
      const localOffset = Math.min(1, offset * 4);
      
      // Floating motion
      groupRef.current.position.y = Math.sin(time) * 0.2;
      
      // Smooth majestic rotation unless dismantled
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        Math.sin(time * 0.5) * 0.3 + localOffset * Math.PI * 4,
        0, 
        d
      );
      
      if (offset > 0.25) {
        const flyby = (offset - 0.25) * 4; 
        const scale = THREE.MathUtils.lerp(1, 15, flyby);
        groupRef.current.scale.set(scale, scale, scale);
        groupRef.current.position.z = THREE.MathUtils.lerp(-5, 10, flyby);
        groupRef.current.visible = flyby < 0.8;
      } else {
        // Expand and lock forward when dismantled
        const s = THREE.MathUtils.lerp(1, 1.2, d);
        groupRef.current.scale.set(s, s, s);
        groupRef.current.position.z = -5;
        groupRef.current.visible = true;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <MaskHalf isBlueprint={true} clippingPlanes={[planeBlueprint]} dRef={dismantleProgress} explosion={explosion} />
      <MaskHalf isBlueprint={false} clippingPlanes={[planeMachine]} dRef={dismantleProgress} explosion={explosion} />
      
      {/* MRI Laser */}
      <mesh ref={laserRef} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
        <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function MaskHalf({ isBlueprint, clippingPlanes, dRef, explosion }: { isBlueprint: boolean, clippingPlanes: THREE.Plane[], dRef: React.MutableRefObject<number>, explosion: number }) {
  const eyeRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Group>(null);
  const wingLeftRef = useRef<THREE.Mesh>(null);
  const wingRightRef = useRef<THREE.Mesh>(null);
  const crownRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const d = dRef.current;
    const pulse = 1 + explosion * 2;

    if (eyeRef.current) {
      eyeRef.current.scale.setScalar(THREE.MathUtils.lerp(pulse, pulse * 0.5, d));
    }
    
    if (haloRef.current) {
      haloRef.current.rotation.z = time * 0.2;
      haloRef.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 4, 0, d);
      haloRef.current.rotation.y = THREE.MathUtils.lerp(0, 0, d);
      haloRef.current.scale.setScalar(THREE.MathUtils.lerp(pulse, pulse * 1.5, d));
    }

    if (wingLeftRef.current && wingRightRef.current && crownRef.current) {
      // Wings flare out majesticly, then fold perfectly flat into a blueprint plane on dismantle
      const flap = Math.sin(time * 2) * 0.05;
      
      // Unfold mathematically
      wingLeftRef.current.rotation.y = THREE.MathUtils.lerp(Math.PI / 4 + flap, 0, d);
      wingLeftRef.current.position.x = THREE.MathUtils.lerp(-1.2, -4, d);
      wingLeftRef.current.rotation.z = THREE.MathUtils.lerp(-0.2, 0, d);
      
      wingRightRef.current.rotation.y = THREE.MathUtils.lerp(-Math.PI / 4 - flap, 0, d);
      wingRightRef.current.position.x = THREE.MathUtils.lerp(1.2, 4, d);
      wingRightRef.current.rotation.z = THREE.MathUtils.lerp(0.2, 0, d);

      crownRef.current.position.y = THREE.MathUtils.lerp(2.2, 4, d);
      crownRef.current.rotation.x = THREE.MathUtils.lerp(0.2, 0, d);
    }
  });

  const solidMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#050505', 
    metalness: 1, 
    roughness: 0.2,
    clippingPlanes,
    side: THREE.DoubleSide
  }), [clippingPlanes]);
  
  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#00ccff', 
    wireframe: true, 
    transparent: true, 
    opacity: 0.6,
    clippingPlanes 
  }), [clippingPlanes]);

  const eyeMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ff00aa', wireframe: true, clippingPlanes });
    return new THREE.MeshBasicMaterial({ color: '#ffffff', clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  return (
    <group>
      {/* The Central Eye (God core) */}
      <mesh ref={eyeRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <primitive object={eyeMat} attach="material" />
      </mesh>

      {/* The Celestial Halos */}
      <group ref={haloRef}>
        <mesh>
          <torusGeometry args={[2.5, 0.05, 16, 64]} />
          <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3, 0.02, 16, 64]} />
          <primitive object={wireMat} attach="material" />
        </mesh>
      </group>

      {/* Left Plate (Geometric Wing) */}
      <mesh ref={wingLeftRef}>
        {/* Diamond/Hexagon shape */}
        <coneGeometry args={[1.5, 4, 3]} />
        <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
      </mesh>

      {/* Right Plate (Geometric Wing) */}
      <mesh ref={wingRightRef} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[1.5, 4, 3]} />
        <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
      </mesh>
      
      {/* The Crown */}
      <mesh ref={crownRef}>
        <coneGeometry args={[0.8, 2.5, 4]} />
        <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
      </mesh>
    </group>
  );
}
