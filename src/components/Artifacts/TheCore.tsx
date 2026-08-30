"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

export function TheCore() {
  const isMutated = useStore((state) => state.isDismantled);
  const explosion = useStore((state) => state.explosion);
  const mutateProgress = useRef(0);
  
  const groupRef = useRef<THREE.Group>(null);
  const dialRef = useRef<THREE.Group>(null);
  const webRef = useRef<THREE.LineSegments>(null);

  const dialMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const webMatRef = useRef<THREE.LineBasicMaterial>(null);

  // Omnitrix Hourglass (two triangles)
  const hourglassGeo = useMemo(() => {
    const shape = new THREE.Shape();
    // Top triangle
    shape.moveTo(-1, 1);
    shape.lineTo(1, 1);
    shape.lineTo(0.2, 0);
    shape.lineTo(-0.2, 0);
    // Bottom triangle
    shape.lineTo(-1, -1);
    shape.lineTo(1, -1);
    shape.lineTo(0.2, 0);
    shape.lineTo(-0.2, 0);
    return new THREE.ShapeGeometry(shape);
  }, []);

  // Spider Web Background Grid
  const webGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radials = 16;
    const rings = 5;
    const maxRadius = 4;

    for (let i = 0; i < radials; i++) {
      const angle = (i / radials) * Math.PI * 2;
      points.push(new THREE.Vector3(0, 0, 0));
      points.push(new THREE.Vector3(Math.cos(angle) * maxRadius, Math.sin(angle) * maxRadius, -0.1));
    }
    for (let r = 1; r <= rings; r++) {
      const radius = (r / rings) * maxRadius;
      for (let i = 0; i < radials; i++) {
        const a1 = (i / radials) * Math.PI * 2;
        const a2 = ((i + 1) / radials) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(a1) * radius, Math.sin(a1) * radius, -0.1));
        points.push(new THREE.Vector3(Math.cos(a2) * radius, Math.sin(a2) * radius, -0.1));
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    mutateProgress.current = THREE.MathUtils.lerp(mutateProgress.current, isMutated ? 1 : 0, 0.1);
    const m = mutateProgress.current;

    if (groupRef.current) {
      const explodeScale = 1 + explosion * 2; 
      
      // Snaps to perfect head-on view on mutation
      groupRef.current.position.y = THREE.MathUtils.lerp(Math.sin(time * 0.5) * 0.5, 0, m);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(Math.PI / 6, 0, m);
      
      const s = THREE.MathUtils.lerp(1, 1.2, m) * explodeScale;
      groupRef.current.scale.set(s, s, s);
    }

    const speedMult = 1 + explosion * 20;

    if (dialRef.current) {
      // The dial spins and locks into place
      dialRef.current.rotation.z = time * (0.5 + m) * speedMult;
      const dilation = THREE.MathUtils.lerp(1, 1.5, m);
      dialRef.current.scale.setScalar(dilation);
    }

    if (webRef.current) {
      // Webs throb when mutated
      webRef.current.rotation.z = -time * 0.1;
      webRef.current.scale.z = THREE.MathUtils.lerp(1, 5 + Math.sin(time * 10) * 4, m);
    }

    if (dialMatRef.current) {
      dialMatRef.current.color.lerpColors(
        new THREE.Color('#39ff14'), // Alien Green
        new THREE.Color('#ff0033'), // Symbiote Red
        m
      );
    }
    if (webMatRef.current) {
      webMatRef.current.color.lerpColors(
        new THREE.Color('#39ff14'),
        new THREE.Color('#050505'), // Black webs
        m
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -8]}>
      
      {/* Background Web Matrix */}
      <lineSegments ref={webRef} geometry={webGeometry}>
        <lineBasicMaterial ref={webMatRef} color="#39ff14" transparent opacity={0.5} />
      </lineSegments>

      {/* The Omnitrix / Symbiote Dial */}
      <group ref={dialRef}>
        {/* Outer Ring */}
        <mesh>
          <ringGeometry args={[2.5, 3.5, 64]} />
          <meshBasicMaterial ref={dialMatRef} color="#39ff14" side={THREE.DoubleSide} />
        </mesh>
        
        {/* Inner Hourglass */}
        <mesh geometry={hourglassGeo} scale={2.4}>
          <meshBasicMaterial color="#000000" />
        </mesh>

        <Html position={[4, 0, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{ color: isMutated ? '#ff0033' : '#39ff14', fontFamily: 'monospace', fontSize: '12px', width: '200px', borderBottom: '1px solid currentColor', paddingBottom: '4px', textAlign: 'left', fontWeight: 'bold' }}>
            {isMutated ? 'SYMBIOTE INCUBATOR' : 'OMNI-CORE MATRIX'}
          </div>
        </Html>
      </group>

      {/* Technical Labels */}
      <Html position={[-4, -3, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ color: isMutated ? '#050505' : '#39ff14', fontFamily: 'monospace', fontSize: '10px', width: '150px', borderTop: '1px solid currentColor', paddingTop: '4px', textAlign: 'right' }}>
          {isMutated ? 'VENOMOUS THREADS' : 'ENERGY CONDUITS'}
        </div>
      </Html>
    </group>
  );
}
