"use client";
import { useEffect, useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, Float } from "@react-three/drei";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import * as THREE from "three";
import Lenis from "lenis";
import IntroSequence from "@/components/IntroSequence";

// ─── COMPLETE 23-ALIEN DATASET ─────────────────────────
const ALIENS = [
  { id: "01", name: "DIAMONDHEAD",  color: "#00e5ff", file: "diamondhead_classic__low_poly__ben_10.glb" },
  { id: "02", name: "FOUR ARMS",    color: "#e31f1f", file: "fourarms_ben_10_os.glb", manualScale: 35000, manualY: -3 },
  { id: "03", name: "XLR8",         color: "#00e676", file: "xlr8_young.glb", manualScale: 0.001, manualY: -3 },
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

  const { computedScale, computedY } = useMemo(() => {
    clone.updateMatrixWorld(true);
    let finalScale = 1;
    let finalY = 0;

    if (alien.manualScale) {
      finalScale = alien.manualScale;
      finalY = alien.yOffset || 0;
    } else {
      const box = new THREE.Box3();
      let validBoundsFound = false;

      clone.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh && mesh.geometry) {
          mesh.geometry.computeBoundingBox();
          if (mesh.geometry.boundingBox) {
             const meshBox = mesh.geometry.boundingBox.clone();
             meshBox.applyMatrix4(mesh.matrixWorld);
             
             // Calculate size of this specific mesh's bounding box
             const meshSize = new THREE.Vector3();
             meshBox.getSize(meshSize);

             // Filter out infinite/broken bounding boxes (common in exported SkinnedMeshes)
             if (!meshBox.isEmpty() && meshBox.min.x > -10000 && meshBox.max.x < 10000 && meshSize.length() < 500) {
                box.union(meshBox);
                validBoundsFound = true;
             }
          }
        }
      });
      
      const size = new THREE.Vector3();
      box.getSize(size);
      
      // If we didn't find ANY valid bounds (or size is 0), fallback to 1
      const h = (!validBoundsFound || size.y === 0) ? 1 : size.y;
      
      finalScale = 6 / h;
      
      const center = new THREE.Vector3();
      box.getCenter(center);
      finalY = -center.y * finalScale;
      
      console.log(`[Scaler] ${alien.name}: validBounds=${validBoundsFound}, sizeY=${size.y}, h=${h}, scale=${finalScale}, y=${finalY}`);
    }
    
    // If manual override exists, ignore computed bounds entirely for that axis
    const s = alien.manualScale !== undefined ? alien.manualScale : finalScale;
    const y = alien.manualY !== undefined ? alien.manualY : finalY;
    
    return { computedScale: s, computedY: y };
  }, [clone, alien]);

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
  }, [clone, alien]);

  useFrame((state, dt) => {
    if (ref.current) {
      // Very slow rotation
      ref.current.rotation.y += dt * 0.2;
      
      // Calculate local progress for this specific alien's segment
      const segmentSize = 1 / ALIENS.length;
      const startProgress = index * segmentSize;
      const endProgress = (index + 1) * segmentSize;
      const currentScroll = scrollYProgress.get();
      
      // Normalize progress within this alien's segment (0 to 1)
      let localProgress = (currentScroll - startProgress) / segmentSize;
      localProgress = THREE.MathUtils.clamp(localProgress, -1, 1);

      // Scale: start tiny deep in the background, become MASSIVE when active
      const distance = Math.abs(localProgress); // 0 when perfectly centered, 1 when off edge
      
      const targetScale = distance > 0.8 ? 0.01 : THREE.MathUtils.lerp(4.0, 0.5, distance);
      ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Y Position: As you scroll past, it rises and falls
      const targetY = -localProgress * 15; // Moves heavily on Y axis
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY - 2, 0.1);
    }
  });

  return (
    <group ref={ref} visible={active === index}>
      <primitive object={clone} scale={computedScale} position-y={computedY} />
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
    </>
  );
}

import { MotionValue } from "framer-motion";

// ─── THE STRETCHING WEB ────────────────────────────────
function DescentWeb({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const smoothProgress = useSpring(scrollYProgress, { damping: 15, stiffness: 60 });
  
  // We use strokeDashoffset to "draw" the web downwards as you scroll
  const strokeDashoffset = useTransform(smoothProgress, [0, 1], ["1000px", "0px"]);

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
          stroke="rgba(255,0,0,0.3)" strokeWidth="0.5" fill="none"
          strokeDasharray="1000"
          style={{ strokeDashoffset }}
        />
        <motion.path 
          d="M30,0 Q50,150 30,300 T30,1000" 
          stroke="rgba(255,0,0,0.5)" strokeWidth="0.8" fill="none"
          strokeDasharray="1000"
          style={{ strokeDashoffset }}
        />
        <motion.path 
          d="M30,0 Q20,100 30,200 T30,1000" 
          stroke="rgba(255,0,0,0.2)" strokeWidth="0.3" fill="none"
          strokeDasharray="1000"
          style={{ strokeDashoffset }}
        />
        
        {/* The Mechanical Spider crawling down */}
        <motion.g style={{ y: useTransform(smoothProgress, [0, 1], [0, 950]) }}>
          <circle cx="30" cy="20" r="4" fill="#000" stroke="#ff0000" strokeWidth="1.5" filter="url(#glow)"/>
          <circle cx="30" cy="14" r="2" fill="#ff0000" />
          {/* Spider Legs */}
          <path d="M26,18 L18,12 L14,16" stroke="#ff0000" strokeWidth="1" fill="none" />
          <path d="M34,18 L42,12 L46,16" stroke="#ff0000" strokeWidth="1" fill="none" />
          <path d="M25,20 L15,22 L10,28" stroke="#ff0000" strokeWidth="1" fill="none" />
          <path d="M35,20 L45,22 L50,28" stroke="#ff0000" strokeWidth="1" fill="none" />
          <path d="M26,22 L18,30 L16,38" stroke="#ff0000" strokeWidth="1" fill="none" />
          <path d="M34,22 L42,30 L44,38" stroke="#ff0000" strokeWidth="1" fill="none" />
          <path d="M28,24 L24,34 L22,42" stroke="#ff0000" strokeWidth="1" fill="none" />
          <path d="M32,24 L36,34 L38,42" stroke="#ff0000" strokeWidth="1" fill="none" />
        </motion.g>
      </svg>
    </div>
  );
}

import { HeroSection } from "../components/Sections/HeroSection";
import { LoreSection } from "../components/Sections/LoreSection";
import { Footer } from "../components/Sections/Footer";
import { AnomalySection } from "../components/Sections/AnomalySection";

// ─── MAIN PAGE (THE PLUNGE ARCHITECTURE) ───────────────
export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  const plungeRef = useRef<HTMLDivElement>(null);

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

  const { scrollYProgress } = useScroll({
    target: plungeRef,
    offset: ["start start", "end end"]
  });

  // removed mounted check to fix framer motion ref hydration
  const bebas = { fontFamily: "'Bebas Neue', sans-serif" };
  const mono  = { fontFamily: "'Space Mono', monospace" };
  const tag   = { ...mono, letterSpacing: ".3em", textTransform: "uppercase" as const };

  return (
    <>
      {!introFinished && <IntroSequence onComplete={() => setIntroFinished(true)} />}

      {/* BACKGROUND NOISE & SPIDER-VERSE HALFTONE */}
      <div style={{ 
        position:"fixed", inset:0, zIndex: 0,
        backgroundImage: `
          radial-gradient(circle at center, transparent 0, #050505 85%),
          repeating-radial-gradient(circle at center, transparent 0, transparent 40px, rgba(255, 0, 85, 0.08) 40px, rgba(255, 0, 85, 0.08) 41px),
          repeating-conic-gradient(from 0deg at center, transparent 0deg, transparent 15deg, rgba(255, 0, 85, 0.08) 15deg, rgba(255, 0, 85, 0.08) 16deg)
        `,
        backgroundColor: "#050505"
      }} />
      <div style={{ 
        position:"fixed", inset:0, opacity:0.15, pointerEvents:"none", zIndex: 998, 
        backgroundImage: "radial-gradient(#ff0055 1px, transparent 1px), radial-gradient(#00aaff 1px, transparent 1px)",
        backgroundSize: "20px 20px", backgroundPosition: "0 0, 10px 10px"
      }} />
      <div style={{ position:"fixed", inset:0, opacity:0.04, pointerEvents:"none", zIndex: 999, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <HeroSection />
      <LoreSection />

      {/* ANOMALY SECTION (Interactive Artifacts) */}
      <AnomalySection />

      {/* THE DESCENT CONTAINER (2300vh for 23 aliens) */}
      <div ref={plungeRef} style={{ position: "relative", zIndex: 3, width: "100%", height: `${ALIENS.length * 100}vh` }}>
        
        {/* STICKY 3D CANVAS FOR PLUNGE */}
        <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%", zIndex: 1, pointerEvents: "none" }}>
          <Canvas gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.5, alpha: true }}>
            <PlungeScene scrollYProgress={scrollYProgress} />
          </Canvas>
        </div>

        {/* THE WEB - Moved inside the container so it visually stretches down */}
        <DescentWeb scrollYProgress={scrollYProgress} />

        {ALIENS.map((alien, i) => (
          <div key={alien.id} style={{ position: "absolute", top: `${i * 100}vh`, height: "100vh", width: "100%", display: "flex", pointerEvents: "none", mixBlendMode: "screen", padding: "40px" }}>
            
            {/* Tech Border Frame */}
            <div style={{ position: "absolute", inset: "40px", border: "1px solid rgba(255,255,255,0.1)", zIndex: 0 }} />
            
            {/* Corner Accents */}
            <div style={{ position: "absolute", top: "35px", left: "35px", width: "20px", height: "20px", borderTop: "2px solid " + alien.color, borderLeft: "2px solid " + alien.color }} />
            <div style={{ position: "absolute", bottom: "35px", right: "35px", width: "20px", height: "20px", borderBottom: "2px solid " + alien.color, borderRight: "2px solid " + alien.color }} />

            {/* Left Vertical HUD */}
            <div style={{ position: "absolute", left: "60px", top: "50%", transform: "translateY(-50%) rotate(180deg)", writingMode: "vertical-rl", display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ ...tag, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>BIOMETRIC SCAN // SYSTEM ACTIVE</div>
              <div style={{ width: "2px", height: "60px", background: alien.color, boxShadow: `0 0 10px ${alien.color}` }} />
            </div>

            {/* Top Right HUD */}
            <div style={{ position: "absolute", top: "60px", right: "60px", textAlign: "right" }}>
              <div style={{ ...tag, color: alien.color, fontSize: 14 }}>SUBJECT DATA // [{alien.id}]</div>
              <div style={{ ...mono, color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: "5px" }}>LOC: 45.221 - SECTOR 7</div>
            </div>

            {/* Bottom Alien Designation */}
            <div style={{ position: "absolute", bottom: "60px", left: "60px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ width: "40px", height: "2px", background: alien.color }} />
                <motion.h1 
                  style={{ 
                    ...bebas, 
                    fontSize: "4vw", 
                    lineHeight: 1, 
                    color: "#fff", 
                    margin: 0, 
                    letterSpacing: "0.05em",
                    textShadow: `0 0 20px ${alien.color}`
                  }}
                >
                  {alien.name}
                </motion.h1>
              </div>
              <div style={{ ...tag, color: "rgba(255,255,255,0.6)", fontSize: 12, paddingLeft: "55px" }}>
                ALIEN DNA SIGNATURE MATCH // CONFIRMED
              </div>
            </div>

            {/* Center Reticle */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.1, zIndex: -1 }}>
              <svg width="200" height="200" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#fff" strokeWidth="0.5" strokeDasharray="2 4" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" strokeWidth="0.5" />
                <path d="M50 0 L50 100 M0 50 L100 50" stroke="#fff" strokeWidth="0.2" />
              </svg>
            </div>

          </div>
        ))}
      </div>

      <Footer />

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
