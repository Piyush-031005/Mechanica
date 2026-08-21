"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ScreenQuad } from "@react-three/drei";
import { useStore } from "@/store/useStore";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uTheme; // 0.0 = CYANOTYPE, 1.0 = DRAFT, 2.0 = CYBER

  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

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
    vec2 uv = vUv;
    vec2 centeredUv = uv - 0.5;
    float dist = length(centeredUv);
    
    vec3 baseColor;
    vec3 gridColor;
    float gridOpacity = 1.0;
    float n = noise(uv * 800.0 + uTime * 0.05);

    if (uTheme < 0.5) {
      // THEME 0: CYANOTYPE (Deep Blue background, White Grid)
      vec3 colorLight = vec3(0.0, 0.1, 0.4); // Royal blue
      vec3 colorDark = vec3(0.0, 0.02, 0.15); // Dark blue edge
      baseColor = mix(colorLight, colorDark, smoothstep(0.0, 1.2, dist));
      baseColor += n * 0.05; // Light grain
      gridColor = vec3(1.0, 1.0, 1.0); // Pure white grid
      gridOpacity = 0.5;
    } else if (uTheme < 1.5) {
      // THEME 1: DRAFT (Off-white paper, Dark Pencil Grid)
      vec3 colorLight = vec3(0.98, 0.96, 0.92); // Cream paper
      vec3 colorDark = vec3(0.85, 0.82, 0.75); // Darker parchment edge
      baseColor = mix(colorLight, colorDark, smoothstep(0.0, 1.2, dist));
      baseColor -= n * 0.03; // Dark grain
      gridColor = vec3(0.1, 0.1, 0.1); // Charcoal grid
      gridOpacity = 0.8;
    } else {
      // THEME 2: CYBER (Pitch Black, RGB Neon Grid)
      vec3 colorLight = vec3(0.05, 0.05, 0.05);
      vec3 colorDark = vec3(0.0, 0.0, 0.0);
      baseColor = mix(colorLight, colorDark, smoothstep(0.0, 1.2, dist));
      // Halftone dot effect
      float dotSize = 150.0;
      float d = length(fract(uv * dotSize) - 0.5);
      if (d > 0.4) baseColor -= vec3(0.03); 
      gridColor = vec3(0.0, 1.0, 0.8); // Cyan grid
      gridOpacity = 1.0;
    }
    
    // Draw rigid esoteric grid lines
    float grid1 = abs(fract(uv.x * 20.0) - 0.5);
    float grid2 = abs(fract(uv.y * 20.0) - 0.5);
    float grid3 = abs(fract((uv.x + uv.y) * 10.0) - 0.5); // Diagonal
    
    float lineThickness = 0.015;
    if (grid1 < lineThickness || grid2 < lineThickness) {
      if (uTheme > 1.5) { // Cyber mode has glitchy RGB lines
        float accentNoise = noise(uv * 5.0 + uTime * 0.1);
        if (accentNoise > 0.7) {
          baseColor = vec3(1.0, 0.0, 1.0); // Magenta accent
        } else {
          baseColor = gridColor;
        }
      } else {
        baseColor = mix(baseColor, gridColor, gridOpacity);
      }
    }

    if (uTheme < 1.5 && grid3 < 0.005) {
       // Subtle diagonal construction lines for Cyanotype/Draft
       baseColor = mix(baseColor, gridColor, gridOpacity * 0.3);
    }
    
    // Vignette
    baseColor *= smoothstep(1.5, 0.2, dist) * 0.5 + 0.5;

    gl_FragColor = vec4(baseColor, 1.0);
  }
`;

export function BlueprintBackground() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const activeTheme = useStore((state) => state.activeTheme);

  const getThemeValue = (theme: string) => {
    if (theme === "CYANOTYPE") return 0.0;
    if (theme === "DRAFT") return 1.0;
    if (theme === "CYBER") return 2.0;
    return 0.0;
  };

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Smoothly transition theme uniform
      const target = getThemeValue(activeTheme);
      materialRef.current.uniforms.uTheme.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uTheme.value,
        target,
        0.05
      );
    }
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uTheme: { value: 0.0 }
        }}
        depthWrite={false}
        depthTest={false}
      />
    </ScreenQuad>
  );
}
