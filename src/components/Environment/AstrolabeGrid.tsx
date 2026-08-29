"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const RING_COUNT = 8;
const NODE_COUNT = 40;

export function AstrolabeGrid() {
  const groupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.InstancedMesh>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Precompute ring data
  const ringData = useMemo(() => {
    const data = [];
    for (let i = 0; i < RING_COUNT; i++) {
      data.push({
        radius: 10 + i * 5 + Math.random() * 2,
        speed: (Math.random() - 0.5) * 0.2,
        tiltX: (Math.random() - 0.5) * Math.PI,
        tiltY: (Math.random() - 0.5) * Math.PI,
        thickness: 0.02 + Math.random() * 0.05
      });
    }
    return data;
  }, []);

  // Precompute node data (floating intersection points)
  const nodeData = useMemo(() => {
    const data = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const ringIndex = Math.floor(Math.random() * RING_COUNT);
      data.push({
        ringIndex,
        angle: Math.random() * Math.PI * 2,
        speed: ringData[ringIndex].speed * 1.5,
        size: 0.1 + Math.random() * 0.3
      });
    }
    return data;
  }, [ringData]);

  // Generate lines connecting nodes
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(NODE_COUNT * 3 * 2); // pairs of points
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // Precompute geometric squares (Constellation aesthetic)
  const squareData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 20; i++) {
      data.push({
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 40,
        z: (Math.random() - 0.5) * 20 - 10,
        size: Math.random() > 0.8 ? 3 : 1, // Some are massive
        speed: (Math.random() - 0.5) * 0.1
      });
    }
    return data;
  }, []);

  const squaresRef = useRef<THREE.InstancedMesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.02;
      groupRef.current.rotation.x = Math.sin(time * 0.01) * 0.1;
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, (state.pointer.x * 2), 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, (state.pointer.y * 2), 0.05);
    }

    if (ringsRef.current) {
      ringData.forEach((ring, i) => {
        dummy.position.set(0, 0, 0);
        dummy.rotation.set(ring.tiltX + time * ring.speed, ring.tiltY + time * ring.speed, 0);
        dummy.scale.set(ring.radius, ring.radius, ring.thickness);
        dummy.updateMatrix();
        ringsRef.current!.setMatrixAt(i, dummy.matrix);
      });
      ringsRef.current.instanceMatrix.needsUpdate = true;
    }

    if (squaresRef.current) {
      squareData.forEach((sq, i) => {
        dummy.position.set(sq.x, sq.y, sq.z);
        // Squares rotate in locked 90 degree increments or slowly
        dummy.rotation.set(0, 0, time * sq.speed);
        dummy.scale.set(sq.size, sq.size, 0.1);
        dummy.updateMatrix();
        squaresRef.current!.setMatrixAt(i, dummy.matrix);
      });
      squaresRef.current.instanceMatrix.needsUpdate = true;
    }

    const nodePositions: THREE.Vector3[] = [];

    if (nodesRef.current) {
      nodeData.forEach((node, i) => {
        const ring = ringData[node.ringIndex];
        const currentAngle = node.angle + time * node.speed;
        
        const x = Math.cos(currentAngle) * ring.radius;
        const y = Math.sin(currentAngle) * ring.radius;
        
        const pos = new THREE.Vector3(x, y, 0);
        const euler = new THREE.Euler(ring.tiltX + time * ring.speed, ring.tiltY + time * ring.speed, 0);
        pos.applyEuler(euler);
        
        nodePositions.push(pos);

        dummy.position.copy(pos);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(node.size, node.size, node.size);
        dummy.updateMatrix();
        nodesRef.current!.setMatrixAt(i, dummy.matrix);
      });
      nodesRef.current.instanceMatrix.needsUpdate = true;
    }

    if (linesRef.current) {
      const positions = linesRef.current.geometry.attributes.position.array as Float32Array;
      let lineIndex = 0;
      for (let i = 0; i < NODE_COUNT; i++) {
        const p1 = nodePositions[i];
        const p2 = nodePositions[(i + 1) % NODE_COUNT];
        
        positions[lineIndex++] = p1.x;
        positions[lineIndex++] = p1.y;
        positions[lineIndex++] = p1.z;
        
        positions[lineIndex++] = p2.x;
        positions[lineIndex++] = p2.y;
        positions[lineIndex++] = p2.z;
      }
      linesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -25]}>
      <instancedMesh ref={ringsRef} args={[undefined as any, undefined as any, RING_COUNT]}>
        <torusGeometry args={[1, 0.005, 8, 100]} />
        <meshBasicMaterial color="#34d399" transparent opacity={0.4} />
      </instancedMesh>
      
      {/* Constellation Squares (Blue) */}
      <instancedMesh ref={squaresRef} args={[undefined as any, undefined as any, 20]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#0044ff" transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </instancedMesh>

      <instancedMesh ref={nodesRef} args={[undefined as any, undefined as any, NODE_COUNT]}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </instancedMesh>

      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </lineSegments>
    </group>
  );
}
