"use client";

import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

export function Effects() {
  return (
    <EffectComposer disableNormalPass multisampling={4}>
      {/* Film grain noise for the documentary archive feel */}
      <Noise premultiply blendFunction={BlendFunction.ADD} opacity={0.3} />
      
      {/* Subtle bloom to make the glowing cyan blueprint lines pop */}
      <Bloom 
        luminanceThreshold={0.2} 
        luminanceSmoothing={0.9} 
        intensity={1.5} 
        mipmapBlur 
      />
      
      {/* Darken the edges to focus the eye on the center artifact */}
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
      
      {/* Slight color separation on the edges for a cinematic lens look */}
      <ChromaticAberration 
        blendFunction={BlendFunction.NORMAL} 
        offset={new THREE.Vector2(0.002, 0.002)} 
        radialModulation={true}
        modulationOffset={0.5}
      />
    </EffectComposer>
  );
}
