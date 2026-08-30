"use client";

import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function Effects() {
  const infectionLevel = useStore((state) => state.infectionLevel);

  return (
    <EffectComposer multisampling={8}>
      {/* Cinematic Lens Depth - Extreme macro when infected */}
      <DepthOfField 
        focusDistance={0.02 - (infectionLevel * 0.01)} 
        focalLength={0.05 + (infectionLevel * 0.05)} 
        bokehScale={2 + infectionLevel * 5} 
        height={480} 
      />

      {/* Clean, premium bloom for physical light scattering */}
      <Bloom 
        luminanceThreshold={0.6 - (infectionLevel * 0.3)} 
        luminanceSmoothing={0.9} 
        intensity={0.5 + infectionLevel * 1.5} 
        mipmapBlur 
      />

      {/* Aberration strictly used for organic infection distortion */}
      <ChromaticAberration 
        offset={new THREE.Vector2(0.0005 + (infectionLevel * 0.005), 0.0005 + (infectionLevel * 0.005))} 
      />

      {/* Deep photographic vignette */}
      <Vignette eskil={false} offset={0.1} darkness={1.0 + (infectionLevel * 0.5)} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  );
}
