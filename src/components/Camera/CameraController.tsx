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

  // ARTIFACT POSITIONS:
  // Engine:    [0,  -2, -8]
  // Dragonfly: [0, -28, -50]  (Y animated via useFrame)
  // Owl:       [0, -55, -90]
  const cameraPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 6, 12),          // 0.0 — Start: looking INTO the scene from above
      new THREE.Vector3(18, 2, 5),          // 0.1 — Swing wide right, Engine visible at left
      new THREE.Vector3(20, -2, -4),        // 0.2 — Right orbit of Engine, very close
      new THREE.Vector3(14, -6, -14),       // 0.3 — Come down from the right, passing Engine
      new THREE.Vector3(-16, -4, -14),      // 0.4 — Swing to left side of Engine
      new THREE.Vector3(-12, -10, -22),     // 0.5 — Pull back left, descending
      new THREE.Vector3(0, -16, -35),       // 0.6 — Center descent corridor
      new THREE.Vector3(8, -24, -44),       // 0.7 — Dragonfly coming into view
      new THREE.Vector3(0, -28, -40),       // 0.8 — Front view of Dragonfly
      new THREE.Vector3(-6, -32, -52),      // 0.9 — Side sweep of Dragonfly wings
      new THREE.Vector3(0, -42, -70),       // 0.95 — Descent into the dark
      new THREE.Vector3(0, -55, -80),       // 1.0 — Face to face with the Gyroscope Eye
    ]);
  }, []);

  const lookAtPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -2, -8),         // Look at Engine
      new THREE.Vector3(0, -2, -8),         // Still on Engine
      new THREE.Vector3(0, -2, -8),         // Close orbit right
      new THREE.Vector3(0, -2, -8),         // Passing beneath Engine
      new THREE.Vector3(0, -2, -8),         // Left orbit
      new THREE.Vector3(0, -2, -8),         // Final Engine look
      new THREE.Vector3(0, -28, -50),       // Shift gaze to Dragonfly
      new THREE.Vector3(0, -28, -50),       // Approach Dragonfly
      new THREE.Vector3(0, -28, -50),       // Front view
      new THREE.Vector3(0, -28, -50),       // Wing sweep
      new THREE.Vector3(0, -55, -90),       // Begin looking at Owl
      new THREE.Vector3(0, -55, -90),       // Stare into the Eye
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
