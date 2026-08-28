"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, Edges } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

const VERTEBRAE_COUNT = 150;

function SpinePart({ isBlueprint, clippingPlanes }: { isBlueprint: boolean, clippingPlanes: THREE.Plane[] }) {
  const scroll = useScroll();
  const explosion = useStore((state) => state.explosion);
  
  const groupRef = useRef<THREE.Group>(null);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const discsRef = useRef<THREE.InstancedMesh>(null);

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 5, -15),
      new THREE.Vector3(-2, 2, -10),
      new THREE.Vector3(3, -2, -5),
      new THREE.Vector3(-1, -6, 0),
      new THREE.Vector3(2, -10, 5),
    ], false, "centripetal", 0.5);
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const scatterVectors = useMemo(() => {
    const data = [];
    for(let i=0; i<VERTEBRAE_COUNT; i++) {
      data.push(new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60
      ));
    }
    return data;
  }, []);

  useFrame((state) => {
    const offset = scroll.offset; 
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      const localOffset = Math.max(0, (offset - 0.75) * 4);
      const scale = THREE.MathUtils.lerp(0.001, 1, Math.min(1, localOffset)); 
      groupRef.current.scale.set(scale, scale, scale);
      groupRef.current.visible = offset > 0.7 && offset < 0.95;
    }

    if (instancedMeshRef.current && discsRef.current) {
      curve.points[1].x = -2 + Math.sin(time * 0.5) * 3;
      curve.points[2].x = 3 + Math.cos(time * 0.4) * 4;
      curve.points[3].x = -1 + Math.sin(time * 0.6) * 3;
      curve.updateArcLengths();

      for (let i = 0; i < VERTEBRAE_COUNT; i++) {
        const t = i / (VERTEBRAE_COUNT - 1);
        
        const slitherWave = Math.sin(t * 10 - time * 2) * 0.1;
        const adjustedT = Math.max(0, Math.min(1, t + slitherWave));
        
        const position = curve.getPointAt(adjustedT);
        const tangent = curve.getTangentAt(adjustedT).normalize();
        
        const up = new THREE.Vector3(0, 1, 0);
        const twistAngle = time * 0.5 + t * Math.PI * 4;
        up.applyAxisAngle(tangent, twistAngle);
        
        // Shatter Effect
        const scatter = scatterVectors[i];
        const finalX = position.x + scatter.x * explosion;
        const finalY = position.y + scatter.y * explosion;
        const finalZ = position.z + scatter.z * explosion;
        
        dummy.position.set(finalX, finalY, finalZ);
        dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
        
        // Wild rotation during explosion
        dummy.rotateOnWorldAxis(tangent, twistAngle + (explosion * i * 0.1));
        
        const scaleFactor = Math.sin(t * Math.PI);
        const thickness = 0.5 + scaleFactor * 0.5;
        
        dummy.scale.set(thickness, 0.4, thickness);
        dummy.updateMatrix();
        instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
        
        dummy.scale.set(thickness * 1.2, 0.1, thickness * 1.2);
        dummy.translateY(0.2);
        dummy.updateMatrix();
        discsRef.current.setMatrixAt(i, dummy.matrix);
      }
      
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
      discsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  // Materials
  const vertebraeMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#ff007f', wireframe: true, clippingPlanes });
    return new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.8, metalness: 0.9, flatShading: true, clippingPlanes });
  }, [isBlueprint, clippingPlanes]);

  const discMat = useMemo(() => {
    if (isBlueprint) return new THREE.MeshBasicMaterial({ color: '#34d399', wireframe: true, transparent: true, opacity: 0.5, clippingPlanes });
    return new THREE.MeshPhysicalMaterial({ 
      color: '#ff3300', // Red hot glowing discs
      transmission: 0.9,
      thickness: 0.5,
      roughness: 0.2,
      emissive: '#ff0000',
      emissiveIntensity: 2,
      clippingPlanes 
    });
  }, [isBlueprint, clippingPlanes]);

  return (
    <group ref={groupRef} position={[0, 4, -8]}>
      {/* Interlocking Metal Vertebrae */}
      <instancedMesh ref={instancedMeshRef} args={[null as any, null as any, VERTEBRAE_COUNT]}>
        <cylinderGeometry args={[1, 0.8, 1, 6]} />
        <primitive object={vertebraeMat} attach="material" />
      </instancedMesh>

      {/* Glowing Energy Discs between vertebrae */}
      <instancedMesh ref={discsRef} args={[null as any, null as any, VERTEBRAE_COUNT]}>
        <torusGeometry args={[0.9, 0.2, 16, 32]} />
        <primitive object={discMat} attach="material" />
      </instancedMesh>
    </group>
  );
}

// Master component managing the medium shift
export function TheSpine() {
  const { viewport } = useThree();
  const planeBlueprint = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);
  const planeMachine = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  
  useFrame((state) => {
    const mouseX = (state.pointer.x * viewport.width) / 2;
    planeBlueprint.constant = mouseX;
    planeMachine.constant = -mouseX;
  });

  return (
    <group position={[0, -2, 0]}>
      {/* Left side: Neon Technical Drawing */}
      <SpinePart isBlueprint={true} clippingPlanes={[planeBlueprint]} />
      
      {/* Right side: Dark Metal & Exhaust */}
      <SpinePart isBlueprint={false} clippingPlanes={[planeMachine]} />
    </group>
  );
}
