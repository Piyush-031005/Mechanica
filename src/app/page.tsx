"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, Float } from "@react-three/drei";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import * as THREE from "three";
import Lenis from "lenis";

// ─── ALIEN DATA (Tuned for precise centering & scaling) ──
const ALIENS = [
  { name: "DIAMONDHEAD", power: "Crystal Physiology", planet: "Petropia",  color: "#00e5ff", model: "/modals/diamondhead_classic__low_poly__ben_10.glb",         scale: 1.2, y: -2.5 },
  { name: "FOUR ARMS",   power: "Enhanced Strength",  planet: "Khoros",    color: "#e31f1f", model: "/modals/fourarms_ben_10_os.glb",                             scale: 0.95,y: -2.0 },
  { name: "XLR8",        power: "Mach 5 Velocity",    planet: "Kinet",     color: "#00e676", model: "/modals/xlr8_young.glb",                                     scale: 1.15,y: -2.5 },
  { name: "SWAMPFIRE",   power: "Pyro-Plant Control", planet: "Methanos",  color: "#ff6d00", model: "/modals/swampfire_ben_10.glb",                               scale: 1.1, y: -2.2 },
  { name: "CANNONBOLT",  power: "Armodrillo Shell",   planet: "Arburia",   color: "#ffd600", model: "/modals/canonbolt_ben_10.glb",                               scale: 1.2, y: -2.5 },
  { name: "JETRAY",      power: "Mach 10 Flight",     planet: "Aeropela",  color: "#aa00ff", model: "/modals/jetray_-_ben_10_rigged.glb",                         scale: 0.95,y: -2.0 },
  { name: "WILDMUTT",    power: "Hyperactive Senses", planet: "Vulpin",    color: "#ff8f00", model: "/modals/wildmutt_ben_10_vilgax_attacks_fan_model.glb",       scale: 1.1, y: -1.8 },
  { name: "SPIDERMONKEY",power: "Web Silk Swings",    planet: "Arachna",   color: "#4fc3f7", model: "/modals/spidermonkey.glb",                                   scale: 1.1, y: -2.2 },
];

ALIENS.forEach(a => useGLTF.preload(a.model));

// ─── 3D MODEL COMPONENT ─────────────────────────────────
function AlienMesh({ alien, scrollY }: { alien: typeof ALIENS[0]; scrollY: any }) {
  const { scene } = useGLTF(alien.model);
  const ref = useRef<THREE.Group>(null);
  
  // Clone to avoid mutation issues across renders
  const clone = useRef<THREE.Group>(scene.clone()).current;

  // Apply materials
  useEffect(() => {
    const c = new THREE.Color(alien.color);
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        const mat = mesh.material as any;
        if (mat?.emissive) mat.emissive = c.clone().multiplyScalar(0.2);
        if (mat?.roughness !== undefined) mat.roughness = Math.min(mat.roughness ?? .5, .6);
      }
    });
  }, [clone, alien.color]);

  // Rotate based on scroll & time
  useFrame((state, dt) => {
    if (ref.current) {
      // Base slow rotation
      ref.current.rotation.y += dt * 0.15;
      
      // Parallax effect: model moves slightly down as you scroll down
      // using the framer-motion scrollY motion value (read manually in RAF)
      const sy = scrollY.get();
      const targetY = alien.y - (sy * 0.002);
      // Smooth interpolation for Y position
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.1);
    }
  });

  return (
    <Float speed={1.5} floatIntensity={0.5} rotationIntensity={0.2}>
      <group ref={ref} scale={alien.scale} position={[0, alien.y, 0]}>
        <primitive object={clone} />
      </group>
    </Float>
  );
}

// ─── GLOBAL 3D SCENE ────────────────────────────────────
function GlobalScene({ activeAlien, scrollY }: { activeAlien: number; scrollY: any }) {
  const alien = ALIENS[activeAlien];
  const { camera } = useThree();

  // Subtle camera pan based on mouse/scroll could go here, 
  // but for now we keep it fixed and let the model do the parallax.
  useEffect(() => {
    camera.position.set(0, 0, 8);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.15} />
      {/* Dynamic directional lighting matching the alien's color */}
      <directionalLight position={[5, 10, 5]} intensity={3.5} color={alien.color} />
      <directionalLight position={[-5, -5, -5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, 5, 0]} intensity={45} color={alien.color} distance={20} decay={2} />
      <pointLight position={[0, -2, 4]} intensity={20} color={alien.color} distance={15} decay={2} />
      
      <AlienMesh alien={alien} scrollY={scrollY} />
      
      <ContactShadows position={[0, -3.5, 0]} opacity={0.7} scale={15} blur={3} color="#000000" />
      <Environment preset="night" />
    </>
  );
}

// ─── MAIN PAGE (SCROLLYTELLING ARCHITECTURE) ────────────
export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(0);
  const alien = ALIENS[active];
  const { scrollY } = useScroll(); // Track scroll for 3D parallax

  // Smooth Scrolling setup (Lenis)
  useEffect(() => {
    setMounted(true);
    const lenis = new Lenis({
      duration: 1.2,
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
    
    // Cleanup
    return () => lenis.destroy();
  }, []);

  // Custom Cursor
  const curDot = useRef<HTMLDivElement>(null);
  const curRing = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const m = (e: MouseEvent) => {
      if (curDot.current) { curDot.current.style.left = e.clientX + "px"; curDot.current.style.top = e.clientY + "px"; }
      setTimeout(() => { if (curRing.current) { curRing.current.style.left = e.clientX + "px"; curRing.current.style.top = e.clientY + "px"; } }, 80);
    };
    window.addEventListener("mousemove", m);
    return () => window.removeEventListener("mousemove", m);
  }, []);

  if (!mounted) return null;

  const bebas = { fontFamily: "'Bebas Neue', sans-serif" };
  const mono  = { fontFamily: "'Space Mono', monospace" };
  const tag   = { ...mono, fontSize: 10, letterSpacing: ".3em", textTransform: "uppercase" as const };

  return (
    <>
      {/* --- CUSTOM CURSOR --- */}
      <div ref={curDot}  style={{ position:"fixed", width:8,  height:8,  borderRadius:"50%", background: alien.color, pointerEvents:"none", zIndex:99999, transform:"translate(-50%,-50%)", mixBlendMode:"screen", transition:"background .4s ease" }} />
      <div ref={curRing} style={{ position:"fixed", width:40, height:40, borderRadius:"50%", border:`1px solid ${alien.color}66`, pointerEvents:"none", zIndex:99998, transform:"translate(-50%,-50%)", transition:"border-color .4s ease" }} />

      {/* --- NOISE OVERLAY --- */}
      <div style={{ position:"fixed", inset:0, opacity:0.04, pointerEvents:"none", zIndex:9997, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* --- GLOBAL FIXED 3D CANVAS --- */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "#040405" }}>
        {/* Cinematic Vignette */}
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at center, transparent 30%, #040405 100%)", zIndex: 1, pointerEvents:"none" }} />
        {/* Glow bleeding from bottom */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"40vh", background:`linear-gradient(to top, ${alien.color}11, transparent)`, zIndex: 1, pointerEvents:"none", transition:"background 1s ease" }} />
        
        <Canvas gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
          <Suspense fallback={null}>
            <GlobalScene activeAlien={active} scrollY={scrollY} />
          </Suspense>
        </Canvas>
      </div>

      {/* --- FIXED NAV --- */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, padding:"32px 56px", display:"flex", justifyContent:"space-between", alignItems:"center", mixBlendMode: "difference" }}>
        <span style={{ ...bebas, fontSize:24, letterSpacing:".2em", color: "#fff" }}>MECHANICA</span>
        <div style={{ display:"flex", gap:48 }}>
          {["Nexus", "Vault", "System"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ ...tag, color:"#fff", textDecoration:"none", opacity: 0.6 }}>{l}</a>
          ))}
        </div>
      </nav>

      {/* --- SCROLLING CONTENT OVERLAY --- */}
      <div style={{ position: "relative", zIndex: 10, width: "100%" }}>
        
        {/* 1. HERO SCENE */}
        <section id="nexus" style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 6%", pointerEvents: "none" }}>
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }}
            style={{ maxWidth: 800 }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
              <div style={{ width:40, height:1, background: alien.color, transition:"background 0.5s" }} />
              <span style={{ ...tag, color: alien.color, transition:"color 0.5s" }}>Protocol: Integration</span>
            </div>
            
            <h1 style={{ ...bebas, fontSize: "clamp(80px, 11vw, 200px)", lineHeight: 0.85, color: "#fff", margin: 0, letterSpacing: "-0.02em", textShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
              ALIEN<br/>
              <span style={{ color: alien.color, transition:"color 0.5s" }}>INSTINCT</span>
            </h1>
            
            <p style={{ ...mono, fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.5)", maxWidth: 420, marginTop: 40, pointerEvents: "auto" }}>
              The intersection of Peter Parker's nervous system and Galvanic Mechamorph technology. 
              A living, breathing universe engineered for absolute dominance.
            </p>
          </motion.div>
        </section>

        {/* 2. SPACER FOR CINEMATIC SCROLLING */}
        <section style={{ height: "40vh", pointerEvents: "none" }} />

        {/* 3. THE VAULT (ROSTER) */}
        <section id="vault" style={{ minHeight: "100vh", padding: "10vh 6%", display: "flex", alignItems: "center" }}>
          {/* We place the roster on the left, letting the 3D model shine on the right */}
          <div style={{ width: "45%", display: "flex", flexDirection: "column", gap: 0 }}>
            <h2 style={{ ...bebas, fontSize: 60, color: "#fff", marginBottom: 60, opacity: 0.2 }}>THE VAULT</h2>
            
            {ALIENS.map((a, i) => {
              const isActive = active === i;
              return (
                <button 
                  key={a.name} 
                  onMouseEnter={() => setActive(i)}
                  style={{ 
                    background: "transparent", border: "none", borderTop: "1px solid rgba(255,255,255,0.05)",
                    padding: "32px 0", textAlign: "left", cursor: "none", position: "relative",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    opacity: isActive ? 1 : 0.3,
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                    <span style={{ ...mono, fontSize: 12, color: isActive ? a.color : "#fff", transition:"color 0.4s" }}>
                      0{i+1}
                    </span>
                    <div>
                      <div style={{ ...bebas, fontSize: isActive ? 48 : 32, letterSpacing: ".02em", color: "#fff", transition: "all 0.4s", transform: isActive ? "translateX(20px)" : "none" }}>
                        {a.name}
                      </div>
                      <div style={{ ...tag, color: isActive ? a.color : "rgba(255,255,255,0.5)", marginTop: 8, transition: "all 0.4s", transform: isActive ? "translateX(20px)" : "none", opacity: isActive ? 1 : 0 }}>
                        {a.power}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. SPACER */}
        <section style={{ height: "30vh", pointerEvents: "none" }} />

        {/* 5. SYSTEM MANIFEST */}
        <section id="system" style={{ minHeight: "100vh", padding: "10vh 6%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <div style={{ ...tag, color: alien.color, marginBottom: 40, transition:"color 0.5s" }}>System Architecture</div>
          
          <h2 style={{ ...bebas, fontSize: "clamp(60px, 8vw, 120px)", lineHeight: 0.9, color: "#fff", maxWidth: 1000, mixBlendMode: "difference" }}>
            WE DON'T BUILD WEBSITES. WE ENGINEER <span style={{ color: alien.color, transition:"color 0.5s" }}>LIVING UNIVERSES</span>.
          </h2>
          
          <p style={{ ...mono, fontSize: 14, color: "rgba(255,255,255,0.4)", maxWidth: 500, lineHeight: 1.8, marginTop: 60 }}>
            Every interaction is calculated. Every movement is a reaction.
            The Mechanica engine uses raw extraterrestrial code to render reality in real-time.
          </p>

          <div style={{ display: "flex", gap: 40, marginTop: 100 }}>
             {([["11ms", "Reaction Time"], ["8.2B", "Poly Count"], ["∞", "Adaptability"]]).map(([v, l]) => (
               <div key={l} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                 <span style={{ ...bebas, fontSize: 48, color: "#fff" }}>{v}</span>
                 <span style={{ ...tag, color: "rgba(255,255,255,0.3)" }}>{l}</span>
               </div>
             ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "40px 6%", display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ ...bebas, fontSize: 18, color: "rgba(255,255,255,0.2)" }}>MECHANICA</span>
          <span style={{ ...tag, color: "rgba(255,255,255,0.2)" }}>AWWWARDS NOMINEE</span>
        </footer>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { 
          width: 100%; min-height: 100%;
          background: #040405; color: #fff; 
          cursor: none; -webkit-font-smoothing: antialiased; 
        }
        button, a { cursor: none; }
        ::selection { background: ${alien.color}44; color: #fff; }
        /* Lenis required CSS */
        html.lenis { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto; }
        .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
        .lenis.lenis-stopped { overflow: hidden; }
        .lenis.lenis-scrolling iframe { pointer-events: none; }
      `}</style>
    </>
  );
}
