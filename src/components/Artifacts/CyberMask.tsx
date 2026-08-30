"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

export function CyberMask() {
  const isMutated = useStore((state) => state.isDismantled);
  const infectionLevel = useStore((state) => state.infectionLevel);
  const setInfectionLevel = useStore((state) => state.setInfectionLevel);
  const mutateProgress = useRef(0);
  const localInfection = useRef(0);
  
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const instancedStrand1 = useRef<THREE.InstancedMesh>(null);
  const instancedStrand2 = useRef<THREE.InstancedMesh>(null);
  const instancedRungs = useRef<THREE.InstancedMesh>(null);
  
  const numPairs = 80; // Doubled the resolution for a finer structure
  
  const { positions1, positions2, rungs } = useMemo(() => {
    const p1 = [];
    const p2 = [];
    const r = [];
    for (let i = 0; i < numPairs; i++) {
      const t = (i / numPairs) * Math.PI * 8; // More twists
      const radius = 1.2;
      const y = (i - numPairs / 2) * 0.15; // Closer together
      
      const x1 = Math.cos(t) * radius;
      const z1 = Math.sin(t) * radius;
      
      const x2 = Math.cos(t + Math.PI) * radius;
      const z2 = Math.sin(t + Math.PI) * radius;

      p1.push(new THREE.Vector3(x1, y, z1));
      p2.push(new THREE.Vector3(x2, y, z2));
      r.push({ p1: new THREE.Vector3(x1, y, z1), p2: new THREE.Vector3(x2, y, z2) });
    }
    return { positions1: p1, positions2: p2, rungs: r };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const mouse = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    mutateProgress.current = THREE.MathUtils.lerp(mutateProgress.current, isMutated ? 1 : 0, 0.05);
    const m = mutateProgress.current;

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.05 + (m * time * 0.5);
      groupRef.current.position.y = Math.sin(time * 0.2) * 0.5;
    }
    
    // Animate the bioluminescent core moving up and down the structure
    if (coreRef.current) {
      coreRef.current.position.y = Math.sin(time * 0.5) * 5;
      coreRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.2 + infectionLevel * 2);
    }

    const boneIvory = new THREE.Color('#d1c7b7');
    const driedCrimson = new THREE.Color('#8b0000');
    
    let maxProximity = 0;

    for (let i = 0; i < numPairs; i++) {
      const p1 = positions1[i];
      const p2 = positions2[i];
      const rung = rungs[i];

      const cursorTarget = new THREE.Vector3(mouse.current.x * 5, mouse.current.y * 5, 5);
      const distToCursor1 = p1.distanceTo(cursorTarget);
      
      const reaction1 = Math.max(0, 1 - distToCursor1 / 4) * (1 - m);
      if (reaction1 > maxProximity) maxProximity = reaction1;
      
      dummy.position.copy(p1);
      dummy.position.z += reaction1 * 1.5;
      dummy.scale.setScalar(1 + reaction1 * 2);
      dummy.updateMatrix();
      instancedStrand1.current!.setMatrixAt(i, dummy.matrix);
      instancedStrand1.current!.setColorAt(i, new THREE.Color().lerpColors(boneIvory, driedCrimson, m + reaction1 + infectionLevel));

      dummy.position.copy(p2);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      instancedStrand2.current!.setMatrixAt(i, dummy.matrix);
      instancedStrand2.current!.setColorAt(i, new THREE.Color().lerpColors(boneIvory, driedCrimson, m + infectionLevel));

      const distance = rung.p1.distanceTo(rung.p2);
      const center = new THREE.Vector3().addVectors(rung.p1, rung.p2).multiplyScalar(0.5);
      const direction = new THREE.Vector3().subVectors(rung.p2, rung.p1).normalize();
      dummy.position.copy(center);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      dummy.scale.set(1, distance, 1);
      dummy.updateMatrix();
      instancedRungs.current!.setMatrixAt(i, dummy.matrix);
      
      const rungColor = new THREE.Color().lerpColors(boneIvory, new THREE.Color('#1a1a1a'), m);
      instancedRungs.current!.setColorAt(i, rungColor);
    }
    
    instancedStrand1.current!.instanceMatrix.needsUpdate = true;
    instancedStrand1.current!.instanceColor!.needsUpdate = true;
    instancedStrand2.current!.instanceMatrix.needsUpdate = true;
    instancedStrand2.current!.instanceColor!.needsUpdate = true;
    instancedRungs.current!.instanceMatrix.needsUpdate = true;
    instancedRungs.current!.instanceColor!.needsUpdate = true;

    if (maxProximity > 0.1) {
      localInfection.current = THREE.MathUtils.lerp(localInfection.current, 1, delta * 2);
    } else {
      localInfection.current = THREE.MathUtils.lerp(localInfection.current, 0, delta * 0.2);
    }
    setInfectionLevel(localInfection.current);
  });

  const boneProps = {
    roughness: 0.7,
    metalness: 0.1,
    transmission: 0.2, 
    thickness: 0.2,
    clearcoat: 0.05,
    envMapIntensity: 0.5
  };

  return (
    <group ref={groupRef}>
      {/* Central Bioluminescent Core Energy */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color="#ff2a00" transparent opacity={0.6 + infectionLevel} />
      </mesh>

      <instancedMesh ref={instancedStrand1} args={[undefined, undefined, numPairs]}>
        {/* Extremely delicate bone structures */}
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshPhysicalMaterial {...boneProps} />
      </instancedMesh>

      <instancedMesh ref={instancedStrand2} args={[undefined, undefined, numPairs]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshPhysicalMaterial {...boneProps} />
      </instancedMesh>

      <instancedMesh ref={instancedRungs} args={[undefined, undefined, numPairs]}>
        {/* Hair-thin connecting tissue */}
        <cylinderGeometry args={[0.015, 0.015, 1, 8]} />
        <meshPhysicalMaterial {...boneProps} transmission={0.5} transparent opacity={0.8} />
      </instancedMesh>
    </group>
  );
}
