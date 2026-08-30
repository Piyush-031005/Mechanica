import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";

export function CinematicCamera() {
  const scrollProgress = useStore((state) => state.scrollProgress);
  
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
    
    // Determine Camera Emotion
    if (mouse.current.velocity > 0.05) {
      cameraState.current = "FEARFUL"; // Visitor moving erratically, camera pulls back/stiffens
    } else if (timeSinceLastMove > 5) {
      cameraState.current = "MEDITATIVE"; // Visitor stopped. The world takes over.
    } else {
      cameraState.current = "OBSERVANT"; // Visitor exploring slowly. Camera follows.
    }

    // Calculate Target Position based on Emotion
    let targetX = mouse.current.x * 2;
    let targetY = mouse.current.y * 2;
    let targetZ = 15 - scrollProgress; // Base scroll travel

    if (cameraState.current === "MEDITATIVE") {
      // The world breathes and drifts autonomously
      idleTime.current += delta;
      targetX = Math.sin(idleTime.current * 0.2) * 5;
      targetY = Math.cos(idleTime.current * 0.15) * 3;
      targetZ += Math.sin(idleTime.current * 0.1) * 2;
    } else if (cameraState.current === "FEARFUL") {
      // Pull back defensively
      targetZ += 2;
    }

    // Physical Laws: Inertia and Mass (Dampened spring interpolation)
    const springSpeed = cameraState.current === "FEARFUL" ? 3.0 : 1.0; // Snaps back if fearful, drifts if observant
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, delta * springSpeed);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, delta * springSpeed);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, delta * springSpeed);
    
    // Look at the origin, or slightly shift focus based on idle state
    const lookTarget = new THREE.Vector3(0, 0, -scrollProgress);
    if (cameraState.current === "MEDITATIVE") {
      lookTarget.x = Math.sin(idleTime.current * 0.3);
      lookTarget.y = Math.cos(idleTime.current * 0.3);
    }
    state.camera.lookAt(lookTarget);
    
    // Decay velocity
    mouse.current.velocity = THREE.MathUtils.lerp(mouse.current.velocity, 0, 0.1);
  });

  return null;
}
