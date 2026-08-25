"use client";

import { EffectComposer, Noise, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

export function Effects() {
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

      {/* Subtle Chromatic Aberration for premium digital lens effect */}
      <ChromaticAberration 
        blendFunction={BlendFunction.NORMAL} 
        offset={new THREE.Vector2(0.001, 0.001)} 
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  );
}
