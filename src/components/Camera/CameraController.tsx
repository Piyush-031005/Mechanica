"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import Lenis from "lenis";
import { useStore } from "@/store/useStore";

export function CameraController() {
  const lenisRef = useRef<Lenis | null>(null);
  const scrollProgress = useRef(0);
  const noiseTime = useRef(0);

  // REVISED CAMERA PATH: Designed specifically for the new hero objects
  // Engine is at [0, 0, -10], Dragonfly at [0, -35, -15], Owl at [0, -55, -15]
  const cameraPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 4, 8),           // 0.0 — Start above, looking down into the scene
      new THREE.Vector3(5, 2, 0),           // 0.1 — Swing right, Engine comes into view
      new THREE.Vector3(10, 0, -5),         // 0.2 — Orbit right side of Engine
      new THREE.Vector3(5, -2, -14),        // 0.3 — Close approach to Engine core
      new THREE.Vector3(-8, -1, -12),       // 0.4 — Swing left, orbit the other side
      new THREE.Vector3(-4, -5, -18),       // 0.5 — Begin descent below Engine
      new THREE.Vector3(0, -18, -15),       // 0.6 — Descending — Dragonfly coming
      new THREE.Vector3(-5, -30, -12),      // 0.7 — Side view of Dragonfly
      new THREE.Vector3(3, -40, -16),       // 0.8 — Close up on Dragonfly wings
      new THREE.Vector3(0, -50, -14),       // 0.9 — Descent to Owl
      new THREE.Vector3(0, -60, -12),       // 1.0 — Face the Gyroscope Eye
    ]);
  }, []);

  const lookAtPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, -10),         // Look at Engine from above
      new THREE.Vector3(0, 0, -10),         // Still looking at Engine
      new THREE.Vector3(0, 0, -10),         // Orbit view
      new THREE.Vector3(0, 0, -10),         // Close up on Engine
      new THREE.Vector3(0, 0, -10),         // Left orbit, engine still centre
      new THREE.Vector3(0, -10, -15),       // Transition gaze downward
      new THREE.Vector3(0, -35, -15),       // Fix gaze on Dragonfly
      new THREE.Vector3(0, -35, -15),       // Dragonfly in focus
      new THREE.Vector3(0, -35, -15),       // Wing close-up
      new THREE.Vector3(0, -55, -15),       // Shift to Owl
      new THREE.Vector3(0, -55, -15),       // Stare into the Gyroscope
    ]);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.04,        // Slightly smoother lerp for cinematic feel
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", (e: any) => {
      scrollProgress.current = e.progress;
      useStore.getState().setScrollVelocity(e.velocity);
    });

    return () => { lenis.destroy(); };
  }, []);

  useFrame((state, delta) => {
    if (lenisRef.current) {
      lenisRef.current.raf(state.clock.elapsedTime * 1000);
    }

    noiseTime.current += delta * 0.4;
    // Subtle breathing — less than before so the camera feels stable
    const breatheX = Math.sin(noiseTime.current * 0.7) * 0.06;
    const breatheY = Math.cos(noiseTime.current * 0.5) * 0.04;

    const p = Math.max(0, Math.min(1, scrollProgress.current));
    const targetPos = cameraPath.getPointAt(p);
    const lookTarget = lookAtPath.getPointAt(p);

    targetPos.x += breatheX;
    targetPos.y += breatheY;

    // Smooth camera position
    state.camera.position.lerp(targetPos, 0.04);

    // Smooth lookAt
    const currentLookAt = new THREE.Vector3();
    state.camera.getWorldDirection(currentLookAt);
    currentLookAt.add(state.camera.position);
    currentLookAt.lerp(lookTarget, 0.04);
    state.camera.lookAt(currentLookAt);

    useStore.getState().setCameraPos(state.camera.position.z, state.camera.position.y);
  });

  return null;
}
