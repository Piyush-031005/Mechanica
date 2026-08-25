"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, Edges } from "@react-three/drei";
import * as THREE from "three";

function CompassPart({ isSketch, clippingPlanes }: { isSketch: boolean, clippingPlanes: THREE.Plane[] }) {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  
  const outerRingRef = useRef<THREE.Mesh>(null);
  const midRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const needleRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const offset = scroll.offset; 
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // 0.5 to 1.0 maps to 0 to 1 for this object
      const localOffset = Math.max(0, (offset - 0.5) * 2);
      
      // Scale from 0 to 1 as it comes in
      const scale = THREE.MathUtils.lerp(0.001, 1, Math.min(1, localOffset * 2)); 
      groupRef.current.scale.set(scale, scale, scale);
      
      // Hide completely if offset < 0.45 to save rendering
      groupRef.current.visible = offset > 0.45;

      // Complex kinematics
      if (outerRingRef.current) {
        outerRingRef.current.rotation.x = time * 0.2 + (localOffset * Math.PI);
        outerRingRef.current.rotation.y = time * 0.1;
      }
      if (midRingRef.current) {
        midRingRef.current.rotation.y = time * -0.3 + (localOffset * Math.PI * 2);
        midRingRef.current.rotation.z = time * 0.15;
      }
      if (innerRingRef.current) {
        innerRingRef.current.rotation.x = time * 0.4;
        innerRingRef.current.rotation.z = time * -0.2 - (localOffset * Math.PI * 4);
      }
      if (needleRef.current) {
        // Ticking motion
        const tick = Math.floor(time * 2) * (Math.PI / 12);
        needleRef.current.rotation.z = THREE.MathUtils.lerp(needleRef.current.rotation.z, tick, 0.1);
        needleRef.current.rotation.x = localOffset * Math.PI;
      }
      if (coreRef.current) {
        coreRef.current.rotation.y = time * 2;
      }
    }
  });

  const sketchMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#2c2825', wireframe: true, clippingPlanes }), [clippingPlanes]);
  const inkEdges = isSketch ? '#2c2825' : '#a31a1a';
  const brassMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#c4a64d', metalness: 0.9, roughness: 0.3, clearcoat: 0.5, clippingPlanes }), [clippingPlanes]);
  const goldEdges = isSketch ? '#a31a1a' : '#ffe180';

  return (
    <group ref={groupRef}>
      {/* 3D Blueprint Axes */}
      <axesHelper args={[6]} material={new THREE.LineBasicMaterial({ clippingPlanes, transparent: true, opacity: 0.2 })} />
      
      {/* Outer Ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[4.5, 0.15, 16, 100]} />
        {isSketch ? <primitive object={sketchMat} attach="material" /> : <primitive object={brassMat} attach="material" />}
        <Edges threshold={15}>
          <lineBasicMaterial attach="material" color={goldEdges} clippingPlanes={clippingPlanes} />
        </Edges>
      </mesh>

      {/* Middle Ring */}
      <mesh ref={midRingRef}>
        <torusGeometry args={[3.2, 0.1, 16, 100]} />
        {isSketch ? <primitive object={sketchMat} attach="material" /> : <primitive object={brassMat} attach="material" />}
        <Edges threshold={15}>
          <lineBasicMaterial attach="material" color={inkEdges} clippingPlanes={clippingPlanes} />
        </Edges>
      </mesh>

      {/* Inner Ring */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[2.0, 0.08, 16, 100]} />
        {isSketch ? <primitive object={sketchMat} attach="material" /> : <primitive object={brassMat} attach="material" />}
        <Edges threshold={15}>
          <lineBasicMaterial attach="material" color={goldEdges} clippingPlanes={clippingPlanes} />
        </Edges>
      </mesh>

      {/* Ticking Needle */}
      <mesh ref={needleRef}>
        <cylinderGeometry args={[0.05, 0.01, 6.0, 8]} />
        {isSketch ? <primitive object={sketchMat} attach="material" /> : <primitive object={brassMat} attach="material" />}
        <Edges threshold={15}>
          <lineBasicMaterial attach="material" color={inkEdges} clippingPlanes={clippingPlanes} />
        </Edges>
      </mesh>
      
      {/* Central Time Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.5, 0]} />
        {isSketch ? (
          <meshBasicMaterial color="#f0eadd" transparent opacity={0.8} clippingPlanes={clippingPlanes} />
        ) : (
          <meshPhysicalMaterial transmission={1} thickness={1.5} roughness={0.1} color="#ffe180" clippingPlanes={clippingPlanes} />
        )}
        <Edges threshold={15}>
           <lineBasicMaterial attach="material" color={inkEdges} clippingPlanes={clippingPlanes} />
        </Edges>
      </mesh>
    </group>
  );
}

// Master component managing the medium shift
export function ChronoCompass() {
  const { viewport } = useThree();
  const planeSketch = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);
  const planeReality = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  
  useFrame((state) => {
    const mouseX = (state.pointer.x * viewport.width) / 2;
    planeSketch.constant = mouseX;
    planeReality.constant = -mouseX;
  });

  return (
    <group position={[0, 0, -2]}>
      <CompassPart isSketch={true} clippingPlanes={[planeSketch]} />
      <CompassPart isSketch={false} clippingPlanes={[planeReality]} />
    </group>
  );
}
