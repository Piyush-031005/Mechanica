"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Noise, DepthOfField, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function Effects() {
  return (
    <EffectComposer multisampling={8}>
      {/* Subtle physical texture */}
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.04} />

      {/* Cinematic lens focus on the central object */}
      <DepthOfField 
        focusDistance={0.0} 
        focalLength={0.02} 
        bokehScale={2} 
        height={480} 
      />

      {/* Frame the object nicely */}
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
    </EffectComposer>
  );
}
