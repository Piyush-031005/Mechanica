"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import Lenis from "lenis";

export function CameraController() {
  const lenisRef = useRef<Lenis | null>(null);
  const scrollProgress = useRef(0);
  const noiseTime = useRef(0);

  // Define a cinematic spline path for the camera
  const cameraPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 5),          // Start (above/away)
      new THREE.Vector3(3, 1, -2),         // Pan right, approaching flower
      new THREE.Vector3(0, 0, -6),         // Close up on flower
      new THREE.Vector3(-4, -1, -12),      // Swing left around flower
      new THREE.Vector3(2, 2, -25),        // Weave through first pillars right
      new THREE.Vector3(-2, -1, -35),      // Look at Dragonfly
      new THREE.Vector3(0, 1, -45),        // Weave through pillars center
      new THREE.Vector3(4, -1, -48),       // Approach Owl from side
      new THREE.Vector3(0, 0, -55)         // Look at Eye
    ]);
  }, []);

  // Define a secondary spline for where the camera should LOOK
  const lookAtPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, -10),        // Look at Flower
      new THREE.Vector3(0, 0, -10),        // Keep looking at Flower
      new THREE.Vector3(0, 0, -10),        // Keep looking at Flower
      new THREE.Vector3(0, 0, -35),        // Shift focus to Dragonfly area
      new THREE.Vector3(0, 0, -35),        // Look at Dragonfly
      new THREE.Vector3(0, 0, -50),        // Shift focus to Owl
      new THREE.Vector3(0, 0, -50),        // Look at Owl
      new THREE.Vector3(0, 0, -60),        // Shift focus to The Eye
      new THREE.Vector3(0, 0, -60)         // Look at The Eye
    ]);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.05,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", (e: any) => {
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

    noiseTime.current += delta * 0.5;
    const breatheX = Math.sin(noiseTime.current * 0.5) * 0.05;
    const breatheY = Math.cos(noiseTime.current * 0.4) * 0.05;

    // Get position on spline based on scroll progress (0 to 1)
    const currentProg = scrollProgress.current;
    
    const targetPos = cameraPath.getPointAt(currentProg);
    const lookAtTarget = lookAtPath.getPointAt(currentProg);
    
    // Add breathing to position
    targetPos.x += breatheX;
    targetPos.y += breatheY;

    // Lerp camera position
    state.camera.position.lerp(targetPos, 0.05);
    
    // Lerp lookAt by manually calculating target quaternion (smoother than lookAt lerping vectors sometimes)
    // For simplicity we will lerp the lookAt vector and use lookAt directly.
    const currentLookAt = new THREE.Vector3();
    state.camera.getWorldDirection(currentLookAt);
    currentLookAt.add(state.camera.position); // convert direction to target point
    
    currentLookAt.lerp(lookAtTarget, 0.05);
    state.camera.lookAt(currentLookAt);
  });

  return null;
}
