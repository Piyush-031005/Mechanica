"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Noise, Vignette, ChromaticAberration, DepthOfField, Bloom } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function Effects() {
  const chromRef = useRef<any>(null);

  useFrame(() => {
    if (chromRef.current) {
      // Get velocity from store (absolute value)
      const velocity = Math.abs(useStore.getState().scrollVelocity);
      
      // Calculate a distortion amount based on velocity. Max out at some value.
      // Velocity might be e.g. 0 to 50
      const distortion = Math.min(0.05, 0.001 + velocity * 0.002);
      
      // Lerp the offset for smooth transition
      chromRef.current.offset.x = THREE.MathUtils.lerp(chromRef.current.offset.x, distortion, 0.1);
      chromRef.current.offset.y = THREE.MathUtils.lerp(chromRef.current.offset.y, distortion, 0.1);
    }
  });

  return (
    <EffectComposer multisampling={4}>
      {/* Subtle paper grain noise */}
      <Noise premultiply blendFunction={BlendFunction.MULTIPLY} opacity={0.1} />
      
      {/* Restored crisp bloom for the red/green glowing circuits */}
      <Bloom 
        luminanceThreshold={0.5} 
        luminanceSmoothing={0.9} 
        intensity={1.0} 
      />
      
      {/* Clean subtle vignette */}
      <Vignette eskil={false} offset={0.1} darkness={0.8} />
      
      {/* Velocity-Reactive Chromatic Aberration */}
      <ChromaticAberration 
        ref={chromRef}
        offset={new THREE.Vector2(0.001, 0.001)}
      />
    </EffectComposer>
  );
}
