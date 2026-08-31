"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, Float } from "@react-three/drei";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import * as THREE from "three";
import Lenis from "lenis";
import IntroSequence from "@/components/IntroSequence";

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

  // Apply dramatic materials and normalize sizes robustly
  useEffect(() => {
    // 1. Ultra-Robust Normalize Size & Center
    // updateMatrixWorld is crucial before calculating manual bounds
    clone.updateMatrixWorld(true);
    
    const box = new THREE.Box3();
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry) {
        mesh.geometry.computeBoundingBox();
        if (mesh.geometry.boundingBox) {
           const meshBox = mesh.geometry.boundingBox.clone();
           meshBox.applyMatrix4(mesh.matrixWorld);
           // Only union if the bounding box is valid and not infinite
           if (!meshBox.isEmpty() && meshBox.min.x > -10000) {
              box.union(meshBox);
           }
        }
      }
    });
    
    const size = new THREE.Vector3();
    box.getSize(size);
    
    // Fallback if size is 0
    const finalSize = size.y === 0 ? 1 : size.y;
    
    // We want every alien to be exactly 6 units tall.
    const scaleFactor = 6 / finalSize;
    clone.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
    // Center it
    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.sub(center.multiplyScalar(scaleFactor));

    // 2. Apply Materials
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
  const smoothProgress = useSpring(scrollYProgress, { damping: 15, stiffness: 60 });
  
  // We use strokeDashoffset to "draw" the web downwards as you scroll
  const strokeDashoffset = useTransform(smoothProgress, [0, 1], [1000, 0]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", display: "flex", justifyContent: "center" }}>
      <svg width="60" height="100%" viewBox="0 0 60 1000" preserveAspectRatio="none" style={{ overflow: "visible", opacity: 0.8 }}>
        <defs>
          <linearGradient id="webGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,1)" />
            <stop offset="20%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
          </linearGradient>
          <filter id="glow">
             <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
             <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
             </feMerge>
          </filter>
        </defs>
        
        {/* Main tension strand */}
        <motion.line 
          x1="30" y1="0" x2="30" y2="1000" 
          stroke="url(#webGlow)" strokeWidth="1.5" 
          strokeDasharray="1000"
          style={{ strokeDashoffset }}
          filter="url(#glow)"
        />
        
        {/* Fraying organic strands mimicking a spider web */}
        <motion.path 
          d="M30,0 Q10,250 30,500 T30,1000" 
          stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none"
          strokeDasharray="1000"
          style={{ strokeDashoffset }}
        />
        <motion.path 
          d="M30,0 Q50,150 30,300 T30,1000" 
          stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" fill="none"
          strokeDasharray="1000"
          style={{ strokeDashoffset }}
        />
        <motion.path 
          d="M30,0 Q20,100 30,200 T30,1000" 
          stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" fill="none"
          strokeDasharray="1000"
          style={{ strokeDashoffset }}
        />
      </svg>
    </div>
  );
}

// ─── MAIN PAGE (THE PLUNGE ARCHITECTURE) ───────────────
export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

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
    
    lenisRef.current = lenis;
    lenis.stop(); // Lock scroll initially

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    if (introFinished && lenisRef.current) {
      lenisRef.current.start(); // Unlock scroll when intro finishes
    }
  }, [introFinished]);

  const { scrollYProgress } = useScroll(); // Add this line here to pass to PlungeScene

  if (!mounted) return null;

  const bebas = { fontFamily: "'Bebas Neue', sans-serif" };
  const mono  = { fontFamily: "'Space Mono', monospace" };
  const tag   = { ...mono, letterSpacing: ".3em", textTransform: "uppercase" as const };

  return (
    <>
      {!introFinished && <IntroSequence onComplete={() => setIntroFinished(true)} />}

      {/* BACKGROUND NOISE & SPIDER-VERSE HALFTONE */}
      <div style={{ position:"fixed", inset:0, background: "#050505", zIndex: 0 }} />
      <div style={{ 
        position:"fixed", inset:0, opacity:0.15, pointerEvents:"none", zIndex: 998, 
        backgroundImage: "radial-gradient(#ff0055 1px, transparent 1px), radial-gradient(#00aaff 1px, transparent 1px)",
        backgroundSize: "20px 20px", backgroundPosition: "0 0, 10px 10px"
      }} />
      <div style={{ position:"fixed", inset:0, opacity:0.04, pointerEvents:"none", zIndex: 999, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* THE WEB */}
      <DescentWeb />

      {/* FIXED 3D CANVAS */}
      <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none" }}>
        <Canvas gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.5, alpha: true }}>
          <PlungeScene scrollYProgress={scrollYProgress} />
        </Canvas>
      </div>

      {/* THE DESCENT CONTAINER (2300vh for 23 aliens) */}
      <div style={{ position: "relative", zIndex: 3, width: "100%", height: `${ALIENS.length * 100}vh`, pointerEvents: "none" }}>
        
        {ALIENS.map((alien, i) => (
          <div key={alien.id} style={{ position: "absolute", top: `${i * 100}vh`, height: "100vh", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", mixBlendMode: "difference" }}>
            
            <motion.h1 
              style={{ 
                ...bebas, 
                fontSize: "clamp(100px, 18vw, 300px)", 
                lineHeight: 0.85, 
                color: "#fff", 
                margin: 0, 
                letterSpacing: "-0.02em", 
                whiteSpace: "nowrap",
                // SPIDER-VERSE GLITCH EFFECT
                textShadow: "4px 4px 0 #ff0055, -4px -4px 0 #00aaff"
              }}
            >
              {alien.name}
            </motion.h1>

            <motion.div style={{ ...tag, color: alien.color, marginTop: 24, fontSize: 16, background: "#000", padding: "4px 12px", border: "1px solid " + alien.color }}>
              SUBJECT // {alien.id}
            </motion.div>

          </div>
        ))}
        
        {/* Intro Hint */}
        <div style={{ position: "absolute", top: "80vh", width: "100%", textAlign: "center" }}>
          <p style={{ ...mono, fontSize: 12, color: "#ff0055", letterSpacing: 4, textTransform: "uppercase" }}>Initiate Descent</p>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; min-height: 100%; background: #000000; overflow-x: hidden; }
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
