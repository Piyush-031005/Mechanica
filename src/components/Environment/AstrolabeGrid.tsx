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

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Slow majestic rotation of the entire system
      groupRef.current.rotation.y = time * 0.02;
      groupRef.current.rotation.x = Math.sin(time * 0.01) * 0.1;
      
      // Slight parallax to mouse
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

    const nodePositions: THREE.Vector3[] = [];

    if (nodesRef.current) {
      nodeData.forEach((node, i) => {
        const ring = ringData[node.ringIndex];
        const currentAngle = node.angle + time * node.speed;
        
        // Calculate world position on the tilted ring
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

    // Update connecting lines
    if (linesRef.current) {
      const positions = linesRef.current.geometry.attributes.position.array as Float32Array;
      let lineIndex = 0;
      
      // Connect each node to the next 2 closest nodes to form a web
      for (let i = 0; i < NODE_COUNT; i++) {
        const p1 = nodePositions[i];
        
        // Find a nearby node
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
        <torusGeometry args={[1, 1, 16, 100]} />
        <meshBasicMaterial color="#34d399" transparent opacity={0.15} wireframe />
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
