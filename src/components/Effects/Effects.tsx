"use client";

import { EffectComposer, Noise, Vignette, ChromaticAberration, DepthOfField } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

export function Effects() {
  return (
    <EffectComposer disableNormalPass multisampling={4}>
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
      
      {/* Slight color separation on the edges for a cinematic lens look */}
      <ChromaticAberration 
        blendFunction={BlendFunction.NORMAL} 
        offset={new THREE.Vector2(0.001, 0.001)} 
        radialModulation={true}
        modulationOffset={0.5}
      />
    </EffectComposer>
  );
}
