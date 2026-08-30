"use client";

import { EffectComposer, Noise, Bloom, ChromaticAberration, Scanline, DepthOfField, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function Effects() {
  const infectionLevel = useStore((state) => state.infectionLevel);

  return (
    <EffectComposer multisampling={8}>
      {/* Infection distorts the focal length and depth */}
      <DepthOfField 
        focusDistance={0.02 - (infectionLevel * 0.01)} 
        focalLength={0.05 + (infectionLevel * 0.05)} 
        bokehScale={2 + infectionLevel * 5} 
        height={480} 
      />

      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.02 + (infectionLevel * 0.05)} />

      <Scanline blendFunction={BlendFunction.OVERLAY} density={1.5} opacity={0.05 + (infectionLevel * 0.1)} />

      <Bloom 
        luminanceThreshold={0.5 - (infectionLevel * 0.3)} 
        luminanceSmoothing={0.9} 
        intensity={0.4 + infectionLevel} 
        mipmapBlur 
      />

      {/* Extreme aberration during infection */}
      <ChromaticAberration 
        offset={new THREE.Vector2(0.0005 + (infectionLevel * 0.005), 0.0005 + (infectionLevel * 0.005))} 
        radialModulation={false}
        modulationOffset={0}
      />

      <Vignette eskil={false} offset={0.1} darkness={1.1 + (infectionLevel * 0.5)} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  );
}
