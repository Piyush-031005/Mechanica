"use client";

import { EffectComposer, Noise, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

export function Effects() {
  return (
    <EffectComposer multisampling={8}>
      {/* Heavy Film Grain for CAD feel */}
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.06} />

      {/* Intense Bloom for the glowing point cloud */}
      <Bloom 
        luminanceThreshold={0.5} 
        luminanceSmoothing={0.9} 
        intensity={2.5} 
        mipmapBlur 
      />

      {/* Chromatic Aberration for digital glitch/lens effect */}
      <ChromaticAberration 
        blendFunction={BlendFunction.NORMAL} 
        offset={new THREE.Vector2(0.002, 0.002)} 
        radialModulation={false}
        modulationOffset={0}
      />
    </EffectComposer>
  );
}
