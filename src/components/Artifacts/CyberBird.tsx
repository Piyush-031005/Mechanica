"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, Edges } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

const FEATHER_COUNT = 400;

function BirdPart({ isBlueprint, clippingPlanes }: { isBlueprint: boolean, clippingPlanes: THREE.Plane[] }) {
  const scroll = useScroll();
  const explosion = useStore((state) => state.explosion);
  
  const groupRef = useRef<THREE.Group>(null);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.InstancedMesh>(null);

  // Pre-calculate feather positions (V-shape / wings)
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const feathers = useMemo(() => {
    const data = [];
    for (let i = 0; i < FEATHER_COUNT; i++) {
      const isRightWing = i % 2 === 0;
      const wingIndex = Math.floor(i / 2);
      const totalPerWing = FEATHER_COUNT / 2;
      
      const t = Math.pow(wingIndex / totalPerWing, 0.8); // 0 to 1 along the wing, pushed outwards
      
      // Arc shape for the majestic wings
      const x = (isRightWing ? 1 : -1) * (0.5 + t * 8);
      const z = -Math.pow(t, 2) * 4; // Sweeping back
      const y = Math.sin(t * Math.PI) * 2; // Arching up
      
      // Calculate a randomized scatter vector for the explosion
      const scatter = new THREE.Vector3(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50
      );
      
      data.push({ x, y, z, t, isRightWing, scatter });
    }
    return data;
  }, []);

  const tails = useMemo(() => {
    const data = [];
    for(let i=0; i<30; i++) {
      const t = i / 30;
      const scatter = new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      data.push({
        x: (Math.random() - 0.5) * 0.5,
        y: -t * 2,
        z: 1 + t * 4,
        t,
        scatter
      });
    }
    return data;
  }, []);

  useFrame((state) => {
    const offset = scroll.offset; 
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Enter animation around offset 0.2 (Start of page 4-5)
      const localOffset = Math.max(0, (offset - 0.2) * 4);
      const scale = THREE.MathUtils.lerp(0.001, 1, Math.min(1, localOffset)); 
      groupRef.current.scale.set(scale, scale, scale);
      groupRef.current.visible = offset > 0.15 && offset < 0.55;
      
      // Gentle hovering of the entire creature
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.5 - 1;
    }

    if (coreRef.current) {
      coreRef.current.rotation.x = time * 0.2 + (explosion * 5);
      coreRef.current.rotation.y = time * 0.3 + (explosion * 5);
      const coreScale = 1 + explosion * 3;
      coreRef.current.scale.set(coreScale, coreScale, coreScale);
    }

    // Majestic Instanced Flapping for Wings
    if (instancedMeshRef.current) {
      feathers.forEach((feather, i) => {
        const flapAmplitude = 0.5 + feather.t * 2.5;
        const flap = Math.sin(time * 2 - feather.t * 2) * flapAmplitude;
        
        // Explosion scatter
        const scatterX = feather.x + feather.scatter.x * explosion;
        const scatterY = feather.y + flap + feather.scatter.y * explosion;
        const scatterZ = feather.z + feather.scatter.z * explosion;
        
        dummy.position.set(scatterX, scatterY, scatterZ);
        
        // Orient feather to point outwards and angle with the flap
        dummy.rotation.set(
          flap * 0.2 + (explosion * Math.random() * Math.PI * 2), 
          feather.isRightWing ? -0.2 : 0.2 + (explosion * Math.random() * Math.PI * 2), 
          (feather.isRightWing ? -Math.PI/2 : Math.PI/2) + flap * 0.3
        );
        
        const scaleBase = (1.0 - feather.t * 0.7);
        dummy.scale.set(scaleBase * 0.2, scaleBase * 3, scaleBase * 0.05);
        
        dummy.updateMatrix();
        instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Tail swimming motion
    if (tailRef.current) {
      tails.forEach((tail, i) => {
        const swish = Math.sin(time * 3 - tail.t * 5) * (0.1 + tail.t);
        
        const scatterX = tail.x + swish + tail.scatter.x * explosion;
        const scatterY = tail.y + tail.scatter.y * explosion;
        const scatterZ = tail.z + tail.scatter.z * explosion;
        
        dummy.position.set(scatterX, scatterY, scatterZ);
        dummy.rotation.set(-0.2 + (explosion * 2), swish * 0.5, explosion * 2);
        dummy.scale.set(0.1, 2, 0.1);
        dummy.updateMatrix();
        tailRef.current!.setMatrixAt(i, dummy.matrix);
      });
      tailRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const material = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#34d399', wireframe: true, transparent: true, opacity: 0.8, clippingPlanes });
    return new THREE.MeshPhysicalMaterial({ 
      color: '#ffffff', 
      transmission: 0.95,
      thickness: 1.5,
      roughness: 0.1,
      ior: 1.5,
      clearcoat: 1,
      clippingPlanes 
    });
  }, [isBlueprint, clippingPlanes]);

  const coreMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ff007f', wireframe: true, clippingPlanes });
    return new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#00ffff', emissiveIntensity: 2, clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  return (
    <group ref={groupRef} position={[0, -1, -8]}>
      {/* Central Core (The Heart) */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <octahedronGeometry args={[0.8, 0]} />
        <primitive object={coreMat} attach="material" />
        {isBlueprint && <Edges scale={1.1} threshold={15} color="#00ffff" />}
      </mesh>

      {/* The Wings (Instanced Feathers) */}
      <instancedMesh ref={instancedMeshRef} args={[null as any, null as any, FEATHER_COUNT]}>
        <coneGeometry args={[1, 1, 4]} />
        <primitive object={material} attach="material" />
      </instancedMesh>

      {/* The Tail */}
      <instancedMesh ref={tailRef} args={[null as any, null as any, 30]}>
        <coneGeometry args={[1, 1, 4]} />
        <primitive object={material} attach="material" />
      </instancedMesh>
    </group>
  );
}

// Master component managing the medium shift
export function CyberBird() {
  const { viewport } = useThree();
  const planeBlueprint = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);
  const planeMachine = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  
  useFrame((state) => {
    const mouseX = (state.pointer.x * viewport.width) / 2;
    planeBlueprint.constant = mouseX;
    planeMachine.constant = -mouseX;
  });

  return (
    <group position={[0, 0, -5]}>
      <BirdPart isBlueprint={true} clippingPlanes={[planeBlueprint]} />
      <BirdPart isBlueprint={false} clippingPlanes={[planeMachine]} />
    </group>
  );
}
