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

  // Define a cinematic spline path for the camera
  const cameraPath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 5),          // Start (above/away)
      new THREE.Vector3(3, 1, -2),         // Pan right, approaching flower
      new THREE.Vector3(0, 0, -6),         // Close up on flower
      new THREE.Vector3(-4, -1, -12),      // Swing left around flower
      new THREE.Vector3(0, 1, -25),        // Approach Dragonfly
      new THREE.Vector3(-2, -1, -35),      // Look at Dragonfly
      new THREE.Vector3(0, 0, -42),        // Reach the edge of the drop
      new THREE.Vector3(0, -10, -45),      // Start diving down
      new THREE.Vector3(0, -30, -45),      // Falling past Owl
      new THREE.Vector3(0, -60, -45)       // Deep into the abyss
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
      new THREE.Vector3(0, 0, -35),        // Keep looking at Dragonfly
      new THREE.Vector3(0, -20, -45),      // Look down into the drop
      new THREE.Vector3(0, -50, -45),      // Look at Owl during drop
      new THREE.Vector3(0, -60, -45),      // Keep looking down
      new THREE.Vector3(0, -100, -45)      // Look deep down
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
    
    // Send to HUD via store
    useStore.getState().setCameraPos(state.camera.position.z, state.camera.position.y);
  });

  return null;
}
