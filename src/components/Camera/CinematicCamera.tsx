import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";

export function CinematicCamera() {
  const mouse = useRef({ x: 0, y: 0, velocity: 0 });
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastMoveTime = useRef(Date.now());
  const idleTime = useRef(0);
  
  const cameraState = useRef<"OBSERVANT" | "FEARFUL" | "MEDITATIVE">("OBSERVANT");

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = -(event.clientY / window.innerHeight) * 2 + 1;
      
      const dx = nx - lastMouse.current.x;
      const dy = ny - lastMouse.current.y;
      const velocity = Math.sqrt(dx * dx + dy * dy);
      
      mouse.current.x = nx;
      mouse.current.y = ny;
      mouse.current.velocity = velocity;
      
      lastMouse.current.x = nx;
      lastMouse.current.y = ny;
      lastMoveTime.current = Date.now();
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    // Time Engine / Idle Psychology
    const timeSinceLastMove = (Date.now() - lastMoveTime.current) / 1000;
    
    if (mouse.current.velocity > 0.05) {
      cameraState.current = "FEARFUL"; 
    } else if (timeSinceLastMove > 5) {
      cameraState.current = "MEDITATIVE";
    } else {
      cameraState.current = "OBSERVANT"; 
    }

    // Parallax Orbit Target
    let targetX = mouse.current.x * 4;
    let targetY = 2 + mouse.current.y * 2;
    let targetZ = 12;

    if (cameraState.current === "MEDITATIVE") {
      idleTime.current += delta;
      targetX = Math.sin(idleTime.current * 0.2) * 6;
      targetY = 2 + Math.cos(idleTime.current * 0.15) * 4;
      targetZ = 12 + Math.sin(idleTime.current * 0.1) * 3;
    } else if (cameraState.current === "FEARFUL") {
      targetZ += 3;
    }

    // Physical Laws: Inertia and Mass
    const springSpeed = cameraState.current === "FEARFUL" ? 3.0 : 1.5;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, delta * springSpeed);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, delta * springSpeed);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, delta * springSpeed);
    
    // Always observe the Symbiote Core
    const lookTarget = new THREE.Vector3(0, 2, 0);
    if (cameraState.current === "MEDITATIVE") {
      lookTarget.x = Math.sin(idleTime.current * 0.3) * 0.5;
      lookTarget.y = 2 + Math.cos(idleTime.current * 0.3) * 0.5;
    }
    state.camera.lookAt(lookTarget);
    
    mouse.current.velocity = THREE.MathUtils.lerp(mouse.current.velocity, 0, 0.1);
  });

  return null;
}
