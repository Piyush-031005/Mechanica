"use client";

import { EffectComposer, Noise, Vignette, ChromaticAberration, DepthOfField } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

export function Effects() {
  return (
    <EffectComposer disableNormalPass multisampling={4}>
      {/* Film grain noise for the documentary archive feel */}
      <Noise premultiply blendFunction={BlendFunction.ADD} opacity={0.4} />
      
      {/* 
        Macro-lens Depth of Field (DoF).
        We focus at a specific distance to blur the distant architecture 
        and the objects right in front of the lens.
      */}
      <DepthOfField 
        focusDistance={0.02} // Focus point
        focalLength={0.02}   // Lens focal length
        bokehScale={2}       // Blur intensity
      />
      
      {/* Darken the edges to focus the eye on the center artifact */}
      <Vignette eskil={false} offset={0.2} darkness={1.3} />
      
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
