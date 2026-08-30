import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useEffect } from "react";

export function CinematicCamera() {
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    // Physical Laws: Inertia and Mass
    const targetX = mouse.current.x * 3;
    const targetY = mouse.current.y * 3;
    
    // Dampened spring interpolation
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, delta * 1.5);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, delta * 1.5);
    
    // Subtle rotation inertia
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}
