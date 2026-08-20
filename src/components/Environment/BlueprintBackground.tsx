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
    
    // Calculate distance from center for radial gradient
    float dist = length(centeredUv);
    
    // Vintage Prussian Blue Theme
    // Deep center: #0A1B2A, Outer edges: #020C17
    vec3 colorLight = vec3(0.04, 0.11, 0.16); // Center (lighter Prussian)
    vec3 colorDark = vec3(0.01, 0.05, 0.09);  // Edges (very dark Prussian)
    
    // Radial mix
    vec3 baseColor = mix(colorLight, colorDark, smoothstep(0.0, 1.2, dist));
    
    // Add procedural paper noise (vintage grain)
    float n = noise(uv * 800.0 + uTime * 0.05);
    baseColor += n * 0.04;
    
    // Subtle vignette
    baseColor *= smoothstep(1.0, 0.3, dist);

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
