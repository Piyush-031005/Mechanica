"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import Lenis from "lenis";

export function CameraController() {
  const lenisRef = useRef<Lenis | null>(null);
  const scrollProgress = useRef(0);
  const noiseTime = useRef(0);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.05, // Super smooth
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", (e: any) => {
      // e.progress goes from 0 to 1
      scrollProgress.current = e.progress;
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  useFrame((state, delta) => {
    if (lenisRef.current) {
      lenisRef.current.raf(state.clock.elapsedTime * 1000);
    }

    // 1. Cinematic Drift & Breathing (Noise)
    noiseTime.current += delta * 0.5;
    const breatheX = Math.sin(noiseTime.current * 0.5) * 0.05;
    const breatheY = Math.cos(noiseTime.current * 0.4) * 0.05;

    // 2. Map scroll progress to a global camera path.
    // For now, simply move the camera through z-space based on scroll.
    // Progress goes 0 -> 1. Let's map it to Z from 5 to -50.
    const targetZ = 5 - scrollProgress.current * 55;
    
    // We add the breathing on top
    const targetX = breatheX;
    const targetY = breatheY;

    // Lerp the camera towards the target position for extra buttery smoothness
    state.camera.position.lerp(
      new THREE.Vector3(targetX, targetY, targetZ),
      0.05
    );
    
    // Camera always looks somewhat forward but we can add micro-shakes
    const lookTarget = new THREE.Vector3(0, 0, targetZ - 10);
    state.camera.lookAt(lookTarget);
  });

  return null;
}
