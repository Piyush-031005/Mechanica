"use client";

import { EffectComposer, Noise, Bloom, ChromaticAberration, Scanline, DepthOfField, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

export function Effects() {
  return (
    <EffectComposer multisampling={8}>
      {/* Cinematic Lens Depth */}
      <DepthOfField 
        focusDistance={0.02} 
        focalLength={0.05} 
        bokehScale={2} 
        height={480} 
      />

      {/* Cinematic Film Grain */}
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.02} />

      {/* Holographic Scanline for that tech feel */}
      <Scanline blendFunction={BlendFunction.OVERLAY} density={1.5} opacity={0.05} />

      {/* Subtle bloom, only on extremely bright (emissive) surfaces */}
      <Bloom 
        luminanceThreshold={0.5} 
        luminanceSmoothing={0.9} 
        intensity={0.4} 
        mipmapBlur 
      />

      {/* Premium digital lens aberration */}
      <ChromaticAberration 
        offset={new THREE.Vector2(0.0005, 0.0005)} 
        radialModulation={false}
        modulationOffset={0}
      />

      {/* Deep Space Vignette to focus the eye */}
      <Vignette eskil={false} offset={0.1} darkness={1.1} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  );
}
