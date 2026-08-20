"use client";

import { Grid, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function GridSystem() {
  const gridRef = useRef<any>(null);

  useFrame((state) => {
    if (gridRef.current) {
      // Slight movement to the grid if we wanted to animate it infinitely
      // gridRef.current.position.z = (state.clock.elapsedTime * 0.5) % 1;
    }
  });

  return (
    <group position={[0, -2, 0]}>
      {/* 
        The Blueprint Floor 
        Using drei's Grid component for a technical drafting table look 
      */}
      <Grid
        ref={gridRef}
        args={[100, 100]} // Large plane
        cellSize={1} // Primary squares
        cellThickness={1} // Thickness of primary lines
        cellColor="#003344" // Deep cyan/blue
        sectionSize={5} // Major grid squares (every 5 cells)
        sectionThickness={1.5}
        sectionColor="#00ffff" // Glowing bright cyan
        fadeDistance={50}
        fadeStrength={1.5}
        infiniteGrid
      />
      
      {/* 
        Ambient dust/particles 
        Adds to the volumetric/dusty archive atmosphere
      */}
      <Sparkles 
        count={500} 
        scale={20} 
        size={2} 
        speed={0.2} 
        opacity={0.3} 
        color="#00ffff" 
        position={[0, 5, 0]} 
      />
    </group>
  );
}
