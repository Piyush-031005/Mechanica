"use client";

import { useRef } from "react";
import { EffectComposer, Noise, Bloom, ChromaticAberration, Glitch } from "@react-three/postprocessing";
import { BlendFunction, GlitchMode } from "postprocessing";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function Effects() {
  const explosion = useStore((state) => state.explosion);
  const glitchRef = useRef<any>(null);

  useFrame(() => {
    if (glitchRef.current) {
      // Control glitch mode dynamically based on explosion
      if (explosion > 0.5) {
        glitchRef.current.mode = GlitchMode.CONSTANT_WILD;
      } else if (explosion > 0.1) {
        glitchRef.current.mode = GlitchMode.SPORADIC;
      } else {
        glitchRef.current.mode = GlitchMode.DISABLED;
      }
    }
  });

  return (
    <EffectComposer multisampling={8}>
      {/* Heavy Film Grain for CAD feel */}
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.04} />

      {/* Smooth Bloom for the glowing elements without blowing them out */}
      <Bloom 
        luminanceThreshold={1.2} 
        luminanceSmoothing={0.9} 
        intensity={1.5} 
        mipmapBlur 
      />

      {/* Dynamic Glitch Effect */}
      <Glitch 
        ref={glitchRef}
        delay={new THREE.Vector2(1.5, 3.5)} // min, max delay
        duration={new THREE.Vector2(0.1, 0.3)} // min, max duration
        strength={new THREE.Vector2(0.1, 0.5)} // min, max strength
      />

      {/* Subtle Chromatic Aberration for premium digital lens effect */}
      <ChromaticAberration 
        offset={new THREE.Vector2(0.001, 0.001)} 
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  );
}
