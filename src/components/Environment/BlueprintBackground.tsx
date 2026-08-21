"use client";

import { useRef } from "react";
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

// A premium, clean shader — deep blue paper with subtle grain and faint star-field
const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uTheme; // 0.0=CYANOTYPE, 1.0=DRAFT, 2.0=CYBER

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    vec2 uv = vUv;
    vec2 c = uv - 0.5;
    float dist = length(c);

    // ── THEME COLORS ──────────────────────────────────────────────
    vec3 bgColor;
    vec3 lineColor;
    float lineOpacity;

    if (uTheme < 0.5) {
      // CYANOTYPE — Prussian blue photographic paper
      vec3 deep = vec3(0.0, 0.035, 0.12);
      vec3 mid  = vec3(0.0, 0.06, 0.22);
      bgColor = mix(deep, mid, smoothstep(0.0, 0.8, 1.0 - dist));
      // Add subtle paper grain
      float grain = smoothNoise(uv * 400.0) * 0.015;
      bgColor += grain;
      lineColor = vec3(0.4, 0.75, 1.0);
      lineOpacity = 0.06;
    } else if (uTheme < 1.5) {
      // DRAFT — aged engineering paper, warm cream
      vec3 paper = vec3(0.94, 0.91, 0.83);
      vec3 edge  = vec3(0.82, 0.79, 0.71);
      bgColor = mix(paper, edge, smoothstep(0.0, 1.0, dist));
      float grain = smoothNoise(uv * 300.0) * 0.02 - 0.01;
      bgColor += grain;
      lineColor = vec3(0.2, 0.2, 0.25);
      lineOpacity = 0.07;
    } else {
      // CYBER — deep void black
      vec3 void_ = vec3(0.02, 0.02, 0.025);
      vec3 deep  = vec3(0.0, 0.0, 0.0);
      bgColor = mix(void_, deep, smoothstep(0.0, 1.0, dist));
      lineColor = vec3(0.0, 0.8, 1.0);
      lineOpacity = 0.05;
    }

    // ── SUBTLE GRID LINES (barely visible) ────────────────────────
    // Fine grid
    float gx = abs(fract(uv.x * 30.0 - 0.5) - 0.5);
    float gy = abs(fract(uv.y * 30.0 - 0.5) - 0.5);
    float fineLine = 1.0 - smoothstep(0.0, 0.025, min(gx, gy));

    // Major grid every 6 cells
    float mx = abs(fract(uv.x * 5.0 - 0.5) - 0.5);
    float my = abs(fract(uv.y * 5.0 - 0.5) - 0.5);
    float majorLine = 1.0 - smoothstep(0.0, 0.015, min(mx, my));

    bgColor = mix(bgColor, lineColor, fineLine * lineOpacity);
    bgColor = mix(bgColor, lineColor, majorLine * lineOpacity * 2.0);

    // ── STAR FIELD (tiny scattered dots for CYANOTYPE / CYBER) ────
    if (uTheme < 0.5 || uTheme > 1.5) {
      // Scatter stars across the background
      vec2 cell = floor(uv * 80.0);
      vec2 cellUv = fract(uv * 80.0);
      float star = hash(cell + vec2(17.3, 43.1));
      if (star > 0.97) { // Only ~3% of cells have a star
        float starDist = length(cellUv - 0.5);
        float starBrightness = (1.0 - smoothstep(0.0, 0.2, starDist)) * (star - 0.97) * 30.0;
        bgColor += lineColor * starBrightness * 0.6;
      }
    }

    // ── VIGNETTE ──────────────────────────────────────────────────
    float vignette = 1.0 - smoothstep(0.3, 0.9, dist);
    bgColor *= mix(0.65, 1.0, vignette);

    gl_FragColor = vec4(bgColor, 1.0);
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
      const target = getThemeValue(activeTheme);
      materialRef.current.uniforms.uTheme.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uTheme.value,
        target,
        0.03
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
