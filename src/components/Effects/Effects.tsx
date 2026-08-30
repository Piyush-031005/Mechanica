"use client";

import { EffectComposer, Noise, Bloom, ChromaticAberration, Scanline } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

export function Effects() {
  return (
    <EffectComposer multisampling={8}>
      {/* Clean Blueprint Grain */}
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.03} />

      {/* Holographic Scanline for that tech feel */}
      <Scanline blendFunction={BlendFunction.OVERLAY} density={1.5} opacity={0.05} />

      {/* Very subtle bloom, NO blowouts */}
      <Bloom 
        luminanceThreshold={0.5} 
        luminanceSmoothing={0.9} 
        intensity={0.4} 
        mipmapBlur 
      />

      {/* Premium lens effect, no screen breaking */}
      <ChromaticAberration 
        offset={new THREE.Vector2(0.0005, 0.0005)} 
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  );
}
