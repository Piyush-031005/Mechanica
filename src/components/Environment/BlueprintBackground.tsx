"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ScreenQuad } from "@react-three/drei";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Deep indigo to cyan radial gradient with noise and vignette
const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;

  // Simple pseudo-random noise function
  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  // 2D Noise
  float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    
    float res = mix(
      mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
      mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
    return res*res;
  }

  void main() {
    // Center UV
    vec2 uv = vUv;
    vec2 centeredUv = uv - 0.5;
    
    // Calculate distance from center for vignette
    float dist = length(centeredUv);
    
    // Stark White Background Theme
    vec3 colorLight = vec3(0.98, 0.98, 0.98); // Off-white/paper
    vec3 colorDark = vec3(0.85, 0.85, 0.85);  // Slight vignette edge
    
    // Radial mix
    vec3 baseColor = mix(colorLight, colorDark, smoothstep(0.0, 1.2, dist));
    
    // Add procedural paper noise (very subtle grain)
    float n = noise(uv * 800.0 + uTime * 0.05);
    baseColor -= n * 0.02; // Subtract to make grain dark
    
    // Draw rigid esoteric grid lines (circuit traces)
    float grid1 = abs(fract(uv.x * 20.0) - 0.5);
    float grid2 = abs(fract(uv.y * 20.0) - 0.5);
    
    // Sharp grid lines
    float lineThickness = 0.02;
    if (grid1 < lineThickness || grid2 < lineThickness) {
      // Sometimes make the lines red or green based on noise/time to mimic circuits
      float accentNoise = noise(uv * 5.0 + uTime * 0.1);
      if (accentNoise > 0.8) {
        baseColor = mix(baseColor, vec3(0.8, 0.0, 0.0), 0.5); // Crimson Red accent
      } else if (accentNoise < -0.8) {
        baseColor = mix(baseColor, vec3(0.0, 0.6, 0.0), 0.5); // Emerald Green accent
      } else {
        baseColor = mix(baseColor, vec3(0.1, 0.1, 0.1), 0.15); // Black/Grey circuit line
      }
    }
    
    // Subtle vignette
    baseColor *= smoothstep(1.2, 0.1, dist) * 0.3 + 0.7;

    gl_FragColor = vec4(baseColor, 1.0);
  }
`;

export function BlueprintBackground() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 }
        }}
        depthWrite={false}
        depthTest={false}
      />
    </ScreenQuad>
  );
}
