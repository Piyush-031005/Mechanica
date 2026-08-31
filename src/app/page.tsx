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
ALIENS.slice(0, 3).forEach(a => useGLTF.preload(`/modals/${a.file}`));

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

  return (
    <>
      {/* BACKGROUND NOISE & GRADIENT */}
      <div style={{ position:"fixed", inset:0, background: "#020202", zIndex: 0 }} />
      <div style={{ position:"fixed", inset:0, opacity:0.06, pointerEvents:"none", zIndex: 999, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* THE WEB */}
      <DescentWeb />

      {/* FIXED 3D CANVAS (Placeholder for Phase 2) */}
      <div style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none" }}>
        {/* Phase 2: Massive 3D rendering will go here */}
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
