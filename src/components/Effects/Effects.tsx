"use client";

import { EffectComposer, Noise, DepthOfField, Bloom } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export function Effects() {
  return (
    <EffectComposer multisampling={8}>
      {/* Subtle physical texture */}
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.03} />

      {/* Cinematic lens focus on the central object */}
      <DepthOfField 
        focusDistance={0.0} 
        focalLength={0.02} 
        bokehScale={2} 
        height={480} 
      />

      {/* Bloom to make the Crimson emissive core glow */}
      <Bloom 
        luminanceThreshold={1.2} 
        luminanceSmoothing={0.9} 
        intensity={1.5} 
        mipmapBlur 
      />
    </EffectComposer>
  );
}
