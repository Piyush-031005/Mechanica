"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import Lenis from "lenis";
import { useStore } from "@/store/useStore";

export function CameraController() {
  const lenisRef = useRef<Lenis | null>(null);
  const scrollProgress = useRef(0);

  useEffect(() => {
    // Ultra-smooth lenis for a cinematic feel
    const lenis = new Lenis({
      lerp: 0.05,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", (e: any) => {
      scrollProgress.current = e.progress;
      useStore.getState().setScrollVelocity(e.velocity);
      useStore.getState().setScrollDepth(e.progress);
    });

    return () => { lenis.destroy(); };
  }, []);

  useFrame((state, delta) => {
    if (lenisRef.current) {
      lenisRef.current.raf(state.clock.elapsedTime * 1000);
    }

    // Camera smoothly orbits the central object based on scroll depth
    const progress = scrollProgress.current;
    
    // Radius goes from 15 to 8 as you scroll down (zooming in)
    const radius = THREE.MathUtils.lerp(15, 8, progress);
    
    // Angle goes from 0 to PI (180 degree orbit)
    const angle = progress * Math.PI;

    const targetX = Math.sin(angle) * radius;
    const targetZ = Math.cos(angle) * radius;
    const targetY = THREE.MathUtils.lerp(2, -2, progress);

    // Smooth lerp for the camera
    state.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.05);

    // Always look at the center
    const currentLookAt = new THREE.Vector3();
    state.camera.getWorldDirection(currentLookAt);
    currentLookAt.add(state.camera.position);
    currentLookAt.lerp(new THREE.Vector3(0, 0, 0), 0.1);
    state.camera.lookAt(currentLookAt);
  });

  return null;
}
