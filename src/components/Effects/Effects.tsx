"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Noise, Vignette, ChromaticAberration, Bloom } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export function Effects() {
  const chromRef = useRef<any>(null);

  useFrame(() => {
    if (chromRef.current) {
      const velocity = Math.abs(useStore.getState().scrollVelocity);
      // Very subtle CA — only kicks in meaningfully when scrolling fast
      // Max offset 0.003 (was 0.05 — that's what caused the rainbow noise problem!)
      const distortion = Math.min(0.003, 0.0002 + velocity * 0.0001);
      chromRef.current.offset.x = THREE.MathUtils.lerp(chromRef.current.offset.x, distortion, 0.08);
      chromRef.current.offset.y = THREE.MathUtils.lerp(chromRef.current.offset.y, distortion * 0.5, 0.08);
    }
  });

  return (
    <EffectComposer multisampling={8}>
      {/* 
        Very fine grain — blueprint paper texture
        Using SOFT_LIGHT to mix gently without darkening the scene
      */}
      <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.04} />

      {/* 
        Bloom tuned for the glowing cores: 
        High luminanceThreshold means only the very bright emissive spots bloom.
        The gear rings (non-emissive) do NOT bloom — keeping lines crisp.
        Only the core spheres and eye pupils glow.
      */}
      <Bloom
        luminanceThreshold={0.7}
        luminanceSmoothing={0.4}
        intensity={1.8}
        mipmapBlur
      />

      {/* 
        Vignette: Pulls focus to center of screen where the hero object lives.
        darkness 0.7 — noticeable but not crushing.
      */}
      <Vignette eskil={false} offset={0.15} darkness={0.7} />

      {/* 
        Chromatic Aberration: Velocity-reactive, now capped at 0.003 (was 0.05).
        At 0.05 it was causing the rainbow colored shapes (the core bug).
        Now it's a whisper-thin lens fringe effect when scrolling.
      */}
      <ChromaticAberration
        ref={chromRef}
        offset={new THREE.Vector2(0.0002, 0.0002)}
      />
    </EffectComposer>
  );
}
