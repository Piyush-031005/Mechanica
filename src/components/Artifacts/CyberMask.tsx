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
  const wingLeftRef = useRef<THREE.Group>(null);
  const wingRightRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const d = dRef.current;
    const pulse = 1 + explosion * 2;

    if (eyeRef.current) {
      eyeRef.current.scale.setScalar(THREE.MathUtils.lerp(pulse, pulse * 0.5, d));
    }
    
    if (haloRef.current) {
      haloRef.current.rotation.z = time * 0.1;
      haloRef.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 4, 0, d);
      haloRef.current.rotation.y = THREE.MathUtils.lerp(0, 0, d);
      haloRef.current.scale.setScalar(THREE.MathUtils.lerp(pulse, pulse * 1.5, d));
    }

    if (wingLeftRef.current && wingRightRef.current) {
      // Smooth elegant breathing motion
      const breathe = Math.sin(time) * 0.05;
      
      // Dismantle mathematically unfolding
      wingLeftRef.current.rotation.y = THREE.MathUtils.lerp(Math.PI / 6 + breathe, 0, d);
      wingLeftRef.current.position.x = THREE.MathUtils.lerp(0, -2, d);
      
      wingRightRef.current.rotation.y = THREE.MathUtils.lerp(-Math.PI / 6 - breathe, 0, d);
      wingRightRef.current.position.x = THREE.MathUtils.lerp(0, 2, d);
    }
  });

  const solidMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#020202', 
    metalness: 0.9, 
    roughness: 0.1,
    clippingPlanes,
    side: THREE.DoubleSide
  }), [clippingPlanes]);
  
  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: '#00ccff', 
    wireframe: true, 
    transparent: true, 
    opacity: 0.5,
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
        <sphereGeometry args={[0.8, 64, 64]} />
        <primitive object={eyeMat} attach="material" />
      </mesh>

      {/* The Celestial Halos */}
      <group ref={haloRef}>
        <mesh>
          <torusGeometry args={[2.5, 0.02, 32, 128]} />
          <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3, 0.02, 32, 128]} />
          <primitive object={wireMat} attach="material" />
        </mesh>
      </group>

      {/* Left Plate (Sweeping Butterfly/Chariot Arcs) */}
      <group ref={wingLeftRef}>
        <mesh position={[-1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <ringGeometry args={[1.5, 3.5, 64, 1, 0, Math.PI]} />
          <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
        </mesh>
        <mesh position={[-2.5, 1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <ringGeometry args={[0.5, 2, 64, 1, 0, Math.PI]} />
          <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
        </mesh>
      </group>

      {/* Right Plate (Sweeping Butterfly/Chariot Arcs) */}
      <group ref={wingRightRef}>
        <mesh position={[1.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <ringGeometry args={[1.5, 3.5, 64, 1, 0, Math.PI]} />
          <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
        </mesh>
        <mesh position={[2.5, 1, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <ringGeometry args={[0.5, 2, 64, 1, 0, Math.PI]} />
          <primitive object={isBlueprint ? wireMat : solidMat} attach="material" />
        </mesh>
      </group>
    </group>
  );
}
