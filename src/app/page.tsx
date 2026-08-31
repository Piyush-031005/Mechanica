"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, Float } from "@react-three/drei";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import * as THREE from "three";
import Lenis from "lenis";

// ─── COMPLETE 23-ALIEN DATASET ─────────────────────────
const ALIENS = [
  { id: "01", name: "DIAMONDHEAD",  color: "#00e5ff", file: "diamondhead_classic__low_poly__ben_10.glb" },
  { id: "02", name: "FOUR ARMS",    color: "#e31f1f", file: "fourarms_ben_10_os.glb" },
  { id: "03", name: "XLR8",         color: "#00e676", file: "xlr8_young.glb" },
  { id: "04", name: "SWAMPFIRE",    color: "#ff6d00", file: "swampfire_ben_10.glb" },
  { id: "05", name: "CANNONBOLT",   color: "#ffd600", file: "canonbolt_ben_10.glb" },
  { id: "06", name: "JETRAY",       color: "#aa00ff", file: "jetray_-_ben_10_rigged.glb" },
  { id: "07", name: "WILDMUTT",     color: "#ff8f00", file: "wildmutt_ben_10_vilgax_attacks_fan_model.glb" },
  { id: "08", name: "SPIDERMONKEY", color: "#4fc3f7", file: "spidermonkey.glb" },
  { id: "09", name: "AMPHIBIAN",    color: "#00b0ff", file: "amphibian_-_ben10.glb" },
  { id: "10", name: "ARMODRILLO",   color: "#ffb300", file: "armodrillo.glb" },
  { id: "11", name: "WAY BIG",      color: "#ff1744", file: "ben10-way_big-model-alien_force.glb" },
  { id: "12", name: "WILDVINE",     color: "#76ff03", file: "ben10_wildvine.glb" },
  { id: "13", name: "BIG CHILL",    color: "#00e5ff", file: "ben_10_xenodrome-_big_chill_fan_model.glb" },
  { id: "14", name: "EYE GUY",      color: "#fbc02d", file: "eye_guy_ben_10_vilgax_attacks_fan_model.glb" },
  { id: "15", name: "GHOSTFREAK",   color: "#9e9e9e", file: "ghostfreak_ben_10_vilgax_attacks_fan_model.glb" },
  { id: "16", name: "GOOP",         color: "#64dd17", file: "goop_vilgax_attacks_fbx.glb" },
  { id: "17", name: "GRAY MATTER",  color: "#8bc34a", file: "gray_matter_os.glb" },
  { id: "18", name: "NRG",          color: "#d50000", file: "nrg.glb" },
  { id: "19", name: "RIPJAWS",      color: "#00bfa5", file: "ripjaws_ben_10.glb" },
  { id: "20", name: "STINKFLY",     color: "#aeea00", file: "stinkfly.glb" },
  { id: "21", name: "ULT. SWAMPFIRE",color: "#3e2723", file: "ultimate_swampfire.glb" },
  { id: "22", name: "UPGRADE",      color: "#c6ff00", file: "upgrade_-_ben_10_classic.glb" },
  { id: "23", name: "BIG CHILL ALT",color: "#18ffff", file: "ben_10_xenodrome-_big_chill_fan_model (1).glb" },
];

// Preload first few to avoid initial stutter
ALIENS.slice(0, 4).forEach(a => useGLTF.preload(`/modals/${a.file}`));

// ─── ALIEN MESH ────────────────────────────────────────
function AlienMesh({ alien, index, active, scrollYProgress }: { alien: any, index: number, active: number, scrollYProgress: any }) {
  // Only load the GLTF if it's the active one, or immediately adjacent
  const shouldMount = Math.abs(active - index) <= 1;
  
  if (!shouldMount) return null;
  return (
    <Suspense fallback={null}>
      <AlienModel alien={alien} index={index} active={active} scrollYProgress={scrollYProgress} />
    </Suspense>
  );
}

function AlienModel({ alien, index, active, scrollYProgress }: { alien: any, index: number, active: number, scrollYProgress: any }) {
  const { scene } = useGLTF(`/modals/${alien.file}`);
  const ref = useRef<THREE.Group>(null);
  const clone = useRef<THREE.Group>(scene.clone()).current;

  // Apply dramatic materials
  useEffect(() => {
    const c = new THREE.Color(alien.color);
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        const mat = mesh.material as any;
        if (mat?.emissive) mat.emissive = c.clone().multiplyScalar(0.4);
        if (mat?.roughness !== undefined) mat.roughness = 0.3; // Shiny and dramatic
      }
    });
  }, [clone, alien.color]);

  useFrame((state, dt) => {
    if (ref.current) {
      // Very slow rotation
      ref.current.rotation.y += dt * 0.2;
      
      // Calculate local progress for this specific alien's segment
      // The total scroll space is divided into 23 segments.
      const segmentSize = 1 / ALIENS.length;
      const startProgress = index * segmentSize;
      const endProgress = (index + 1) * segmentSize;
      const currentScroll = scrollYProgress.get();
      
      // Normalize progress within this alien's segment (0 to 1)
      let localProgress = (currentScroll - startProgress) / segmentSize;
      localProgress = THREE.MathUtils.clamp(localProgress, -1, 1);

      // Scale: start tiny deep in the background, become MASSIVE when active
      // Base scale will be large (e.g. 3.0), we modulate it based on distance from center
      const distance = Math.abs(localProgress); // 0 when perfectly centered, 1 when off edge
      
      const targetScale = distance > 0.8 ? 0.01 : THREE.MathUtils.lerp(4.0, 0.5, distance);
      ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Y Position: As you scroll past, it rises and falls
      const targetY = -localProgress * 15; // Moves heavily on Y axis
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY - 2, 0.1); // -2 is base offset
    }
  });

  return (
    <group ref={ref} visible={active === index}>
      <primitive object={clone} />
    </group>
  );
}

// ─── PLUNGE SCENE (Manages memory and active state) ────
function PlungeScene({ scrollYProgress }: { scrollYProgress: any }) {
  const [active, setActive] = useState(0);
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 10); // Pulled back to see massive scale
  }, [camera]);

  useFrame(() => {
    const currentScroll = scrollYProgress.get();
    const newActive = Math.min(ALIENS.length - 1, Math.floor(currentScroll * ALIENS.length));
    if (newActive !== active) {
      setActive(newActive);
    }
  });

  const currentAlien = ALIENS[active];

  return (
    <>
      <ambientLight intensity={0.1} />
      {/* Dynamic Dramatic Lighting */}
      <directionalLight position={[0, 10, -5]} intensity={1.5} color={currentAlien.color} />
      <directionalLight position={[-10, -10, 10]} intensity={2.0} color="#ffffff" />
      <pointLight position={[0, -2, 5]} intensity={50} color={currentAlien.color} distance={20} decay={2} />
      
      {ALIENS.map((alien, i) => (
        <AlienMesh key={alien.id} alien={alien} index={i} active={active} scrollYProgress={scrollYProgress} />
      ))}

      <ContactShadows position={[0, -6, 0]} opacity={0.8} scale={30} blur={4} color={currentAlien.color} />
      <Environment preset="city" />
    </>
  );
}

// ─── THE STRETCHING WEB ────────────────────────────────
function DescentWeb() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });
  
  // Stretch the line down as you scroll
  const scaleY = useTransform(smoothProgress, [0, 1], [0.1, 1]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 1, height: "100%", background: "rgba(255,255,255,0.05)", position: "relative" }}>
        <motion.div 
          style={{ 
            width: 2, height: "100%", background: "#fff", 
            boxShadow: "0 0 20px #fff, 0 0 40px #fff",
            transformOrigin: "top center",
            scaleY: scaleY
          }} 
        />
      </div>
    </div>
  );
}

// ─── MAIN PAGE (THE PLUNGE ARCHITECTURE) ───────────────
export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const lenis = new Lenis({
      duration: 1.5, // Heavier, more cinematic feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  if (!mounted) return null;

  const bebas = { fontFamily: "'Bebas Neue', sans-serif" };
  const mono  = { fontFamily: "'Space Mono', monospace" };
  const { scrollYProgress } = useScroll(); // Add this line here to pass to PlungeScene

  return (
    <>
      {/* BACKGROUND NOISE & GRADIENT */}
      <div style={{ position:"fixed", inset:0, background: "#020202", zIndex: 0 }} />
      <div style={{ position:"fixed", inset:0, opacity:0.06, pointerEvents:"none", zIndex: 999, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* THE WEB */}
      <DescentWeb />

      {/* FIXED 3D CANVAS */}
      <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none" }}>
        <Canvas gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.5 }}>
          <PlungeScene scrollYProgress={scrollYProgress} />
        </Canvas>
      </div>

      {/* THE DESCENT CONTAINER (2300vh for 23 aliens) */}
      <div style={{ position: "relative", zIndex: 3, width: "100%", height: `${ALIENS.length * 100}vh` }}>
        
        {/* Phase 3: Typographic Overlays will go here */}
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
          <h1 style={{ ...bebas, fontSize: "8vw", color: "#fff", opacity: 0.1 }}>THE PLUNGE IS READY</h1>
          <p style={{ ...mono, fontSize: "1vw", color: "#fff", opacity: 0.1 }}>Scroll to descend</p>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100%; background: #020202; overflow-x: hidden; }
        ::selection { background: #fff; color: #000; }
        html.lenis { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto; }
        .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
        .lenis.lenis-stopped { overflow: hidden; }
        .lenis.lenis-scrolling iframe { pointer-events: none; }
      `}</style>
    </>
  );
}
