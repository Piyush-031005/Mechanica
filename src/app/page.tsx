"use client";
import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// ─── ALIEN DATA ───────────────────────────────────────────
const ALIENS = [
  { name: "DIAMONDHEAD", power: "Crystal Physiology", planet: "Petropia",  color: "#00e5ff", model: "/modals/diamondhead_classic__low_poly__ben_10.glb",         scale: 1.1 },
  { name: "FOUR ARMS",   power: "Enhanced Strength",  planet: "Khoros",    color: "#e31f1f", model: "/modals/fourarms_ben_10_os.glb",                             scale: 0.9 },
  { name: "XLR8",        power: "Mach 5 Velocity",    planet: "Kinet",     color: "#00e676", model: "/modals/xlr8_young.glb",                                     scale: 1.0 },
  { name: "SWAMPFIRE",   power: "Pyro-Plant Control", planet: "Methanos",  color: "#ff6d00", model: "/modals/swampfire_ben_10.glb",                               scale: 1.0 },
  { name: "CANNONBOLT",  power: "Armodrillo Shell",   planet: "Arburia",   color: "#ffd600", model: "/modals/canonbolt_ben_10.glb",                               scale: 1.1 },
  { name: "JETRAY",      power: "Mach 10 Flight",     planet: "Aeropela",  color: "#aa00ff", model: "/modals/jetray_-_ben_10_rigged.glb",                         scale: 0.9 },
  { name: "WILDMUTT",    power: "Hyperactive Senses", planet: "Vulpin",    color: "#ff8f00", model: "/modals/wildmutt_ben_10_vilgax_attacks_fan_model.glb",       scale: 1.0 },
  { name: "SPIDERMONKEY",power: "Web Silk Swings",    planet: "Arachna",   color: "#4fc3f7", model: "/modals/spidermonkey.glb",                                   scale: 1.0 },
];

// ─── AUTO-PRELOAD ALL MODELS (avoid waterfall loading) ──
ALIENS.forEach(a => useGLTF.preload(a.model));

// ─── SINGLE MODEL (used in hero AND selector) ────────────
function AlienMesh({ url, scale, color }: { url: string; scale: number; color: string }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);
  const clone = useRef<THREE.Group>(scene.clone()).current;

  useEffect(() => {
    const c = new THREE.Color(color);
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        const mat = mesh.material as any;
        if (mat?.emissive) mat.emissive = c.clone().multiplyScalar(0.15);
        if (mat?.roughness !== undefined) mat.roughness = Math.min(mat.roughness ?? .5, .75);
      }
    });
  }, [clone, color]);

  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.28; });

  return (
    <Float speed={0.8} floatIntensity={0.3} rotationIntensity={0}>
      <group ref={ref} scale={scale} position={[0, -0.3, 0]}>
        <primitive object={clone} />
      </group>
    </Float>
  );
}

// ─── HERO CANVAS (right-side, properly framed) ───────────
function HeroScene({ alien }: { alien: typeof ALIENS[0] }) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 9], fov: 34 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[4, 6, 4]}   intensity={2.5} color={alien.color} />
        <directionalLight position={[-5, -3, -4]} intensity={0.6} color="#ffffff" />
        <pointLight position={[0, 5, 2]} intensity={35} color={alien.color} distance={18} decay={2} />
        <pointLight position={[0, -2, 5]} intensity={15} color={alien.color} distance={12} decay={2} />
        <AlienMesh url={alien.model} scale={alien.scale} color={alien.color} />
        <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2} />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}

// ─── SELECTOR CANVAS (alien roster, single shared canvas) ─
function SelectorScene({ alien }: { alien: typeof ALIENS[0] }) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 8], fov: 40 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.15} />
        <directionalLight position={[5, 8, 5]}   intensity={3}   color={alien.color} />
        <directionalLight position={[-4, -3, -4]} intensity={0.5} color="#ffffff" />
        <pointLight position={[0, 7, 0]}  intensity={55} color={alien.color} distance={22} decay={2} />
        <pointLight position={[0, -1, 5]} intensity={22} color={alien.color} distance={14} decay={2} />
        <AlienMesh url={alien.model} scale={alien.scale * 1.1} color={alien.color} />
        <ContactShadows position={[0, -2.8, 0]} opacity={0.65} scale={12} blur={2.5} />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}

// ─── SPIDER WEB CANVAS HOOK ──────────────────────────────
function useWebCanvas(ref: React.RefObject<HTMLCanvasElement | null>, color: string) {
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    const m = { x: c.width / 2, y: c.height / 2 };
    const pts = Array.from({ length: 50 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45,
    }));
    const mm = (e: MouseEvent) => { m.x = e.clientX; m.y = e.clientY; };
    window.addEventListener("mousemove", mm);
    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 120) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = `rgba(255,255,255,${(1-d/120)*.1})`; ctx.lineWidth = .4; ctx.stroke(); }
        }
        const d = Math.hypot(pts[i].x - m.x, pts[i].y - m.y);
        if (d < 160) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(m.x, m.y); ctx.strokeStyle = color + Math.floor((1-d/160)*70).toString(16).padStart(2,"0"); ctx.lineWidth = .7; ctx.stroke(); }
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    const ro = new ResizeObserver(resize); ro.observe(c);
    return () => { cancelAnimationFrame(id); window.removeEventListener("mousemove", mm); ro.disconnect(); };
  }, [ref, color]);
}

// ─── OMNITRIX RING (static SVG, no random) ───────────────
function Ring({ color, size = 420, spin = true }: { color: string; size?: number; spin?: boolean }) {
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    const maj = i % 5 === 0;
    const inn = maj ? 192 : 200;
    ticks.push(
      <line key={i}
        x1={210 + Math.cos(a) * inn} y1={210 + Math.sin(a) * inn}
        x2={210 + Math.cos(a) * 208} y2={210 + Math.sin(a) * 208}
        stroke={color} strokeWidth={maj ? 1.5 : 0.5}
        strokeOpacity={maj ? 0.65 : 0.2}
      />
    );
  }
  const svg = (
    <svg width={size} height={size} viewBox="0 0 420 420" fill="none" style={{ opacity: .2 }}>
      <circle cx="210" cy="210" r="208" stroke={color} strokeWidth="0.8" />
      {ticks}
      <circle cx="210" cy="210" r="155" stroke={color} strokeWidth="1.2" strokeOpacity=".35" strokeDasharray="7 7" />
      {[0, 90, 180, 270].map(deg => {
        const a = (deg * Math.PI) / 180;
        return <circle key={deg} cx={210 + Math.cos(a) * 155} cy={210 + Math.sin(a) * 155} r="3" fill={color} opacity=".7" />;
      })}
    </svg>
  );
  if (!spin) return svg;
  return (
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
      {svg}
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────
export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [active, setActive] = useState(0);
  const curDot  = useRef<HTMLDivElement>(null);
  const curRing = useRef<HTMLDivElement>(null);
  const webRef  = useRef<HTMLCanvasElement>(null);
  const alien   = ALIENS[active];

  useWebCanvas(webRef, alien.color);

  // Cursor tracking
  useEffect(() => {
    const m = (e: MouseEvent) => {
      if (curDot.current)  { curDot.current.style.left  = e.clientX + "px"; curDot.current.style.top  = e.clientY + "px"; }
      setTimeout(() => { if (curRing.current) { curRing.current.style.left = e.clientX + "px"; curRing.current.style.top = e.clientY + "px"; } }, 80);
    };
    window.addEventListener("mousemove", m);
    return () => window.removeEventListener("mousemove", m);
  }, []);

  if (!mounted) return null;

  // ── Shared inline styles ──────────────────────────────
  const mono: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
  const bebas: React.CSSProperties = { fontFamily: "'Bebas Neue', sans-serif" };
  const tag: React.CSSProperties = { ...mono, fontSize: 9, letterSpacing: ".35em", textTransform: "uppercase" as const };
  const section: React.CSSProperties = {
    height: "100vh", flexShrink: 0, scrollSnapAlign: "start",
    position: "relative", overflow: "hidden",
  };

  return (
    <>
      {/* Custom cursor */}
      <div ref={curDot}  style={{ position:"fixed", width:9,  height:9,  borderRadius:"50%", background: alien.color, pointerEvents:"none", zIndex:99999, transform:"translate(-50%,-50%)", mixBlendMode:"screen", transition:"background .5s" }} />
      <div ref={curRing} style={{ position:"fixed", width:36, height:36, borderRadius:"50%", border:`1px solid ${alien.color}55`, pointerEvents:"none", zIndex:99998, transform:"translate(-50%,-50%)", transition:"border-color .5s" }} />

      {/* Noise */}
      <div style={{ position:"fixed", inset:0, opacity:.025, pointerEvents:"none", zIndex:9997,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* Nav */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:1000, padding:"20px 52px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"linear-gradient(to bottom,rgba(5,5,7,.96),transparent)" }}>
        <span style={{ ...bebas, fontSize:18, letterSpacing:".2em", color: alien.color, transition:"color .5s" }}>MECHANICA</span>
        <div style={{ display:"flex", gap:36 }}>
          {(["Aliens","Abilities","Manifest"] as const).map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ ...tag, color:"rgba(255,255,255,.3)", textDecoration:"none" }}>{l}</a>
          ))}
        </div>
      </nav>

      {/* ── SCROLL CONTAINER ── */}
      <div style={{ height:"100vh", overflowY:"scroll", scrollSnapType:"y mandatory", scrollbarWidth:"none" }}>

        {/* ════════════════════════════════════════
            SECTION 1 — HERO
        ════════════════════════════════════════ */}
        <section style={{ ...section, display:"flex", background:"#060608" }}>

          {/* Spider web bg */}
          <canvas ref={webRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.35, pointerEvents:"none" }} />

          {/* LEFT — Text (40%) */}
          <div style={{ width:"42%", display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 0 0 52px", position:"relative", zIndex:2, paddingBottom:80 }}>
            <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:.1 }} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background: alien.color, animation:"blink 2s infinite" }} />
              <span style={{ ...tag, color: alien.color }}>Spider-Man × Ben 10 Universe</span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.h1 key={active}
                initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
                transition={{ duration:.4 }}
                style={{ ...bebas, fontSize:"clamp(56px,6.5vw,104px)", lineHeight:.88, letterSpacing:"-.01em", margin:"0 0 20px" }}>
                <span style={{ color: alien.color }}>{alien.name}</span><br />
                <span style={{ color:"#fff" }}>ALIEN</span><br />
                <span style={{ color:"#e31f1f" }}>SPIDER</span><br />
                <span style={{ color:"#fff" }}>MIND</span>
              </motion.h1>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div key={active + "sub"} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:.3 }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"4px 12px", border:`1px solid ${alien.color}55`, marginBottom:10 }}>
                  <span style={{ ...tag, color: alien.color }}>{alien.power}</span>
                </div>
                <div style={{ ...tag, color:"rgba(255,255,255,.22)", marginBottom:22 }}>{alien.planet}</div>
              </motion.div>
            </AnimatePresence>

            <p style={{ fontSize:14, lineHeight:1.75, color:"rgba(255,255,255,.4)", maxWidth:360, marginBottom:36 }}>
              Ten alien transformations fused with spider instinct. Extraterrestrial biology meets Peter Parker's enhanced nervous system — a living universe.
            </p>

            <div style={{ display:"flex", gap:12 }}>
              <button
                onClick={() => setActive(p => (p + 1) % ALIENS.length)}
                style={{ padding:"12px 28px", background: alien.color, color:"#000", ...mono, fontSize:10, fontWeight:700, letterSpacing:".15em", textTransform:"uppercase", border:"none", cursor:"none", clipPath:"polygon(7px 0%,100% 0%,calc(100% - 7px) 100%,0% 100%)", transition:"all .25s" }}>
                Transform
              </button>
              <button
                onClick={() => { const el = document.getElementById("aliens"); el?.scrollIntoView({ behavior:"smooth" }); }}
                style={{ padding:"11px 28px", background:"transparent", color:"rgba(255,255,255,.38)", ...mono, fontSize:10, letterSpacing:".15em", textTransform:"uppercase", border:"1px solid rgba(255,255,255,.1)", cursor:"none" }}>
                View All
              </button>
            </div>
          </div>

          {/* RIGHT — 3D Model (58%) */}
          <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
            {/* Fade left edge */}
            <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"25%", background:"linear-gradient(to right,#060608,transparent)", zIndex:2, pointerEvents:"none" }} />

            {/* Spinning ring */}
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:3, pointerEvents:"none" }}>
              <Ring color={alien.color} size={460} />
            </div>

            {/* 3D Canvas */}
            <AnimatePresence mode="wait">
              <motion.div key={active + "hero3d"} style={{ position:"absolute", inset:0 }}
                initial={{ opacity:0, scale:.97 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:1.03 }}
                transition={{ duration:.5 }}>
                <HeroScene alien={alien} />
              </motion.div>
            </AnimatePresence>

            {/* Active label */}
            <div style={{ position:"absolute", bottom:44, right:44, zIndex:4, textAlign:"right", pointerEvents:"none" }}>
              <AnimatePresence mode="wait">
                <motion.div key={active + "lbl"} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:.3 }}>
                  <div style={{ ...tag, color:"rgba(255,255,255,.2)", marginBottom:6 }}>Active Form</div>
                  <div style={{ ...bebas, fontSize:28, letterSpacing:".04em", color: alien.color }}>{alien.name}</div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Stats bar — pinned to bottom */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:5, display:"flex", borderTop:"1px solid rgba(255,255,255,.06)", background:"rgba(6,6,8,.88)", backdropFilter:"blur(20px)" }}>
            {([["10","Alien Forms"],["∞","Web Combos"],["500mph","Peak Speed"],["100T","Lift Cap"]] as const).map(([n,l], i) => (
              <div key={l} style={{ flex:1, padding:"16px 28px", borderRight: i<3?"1px solid rgba(255,255,255,.06)":"none" }}>
                <div style={{ ...bebas, fontSize:30, color: i===0 ? alien.color : "#fff", lineHeight:1, transition:"color .5s" }}>{n}</div>
                <div style={{ ...tag, color:"rgba(255,255,255,.18)", marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            SECTION 2 — ALIEN ROSTER
        ════════════════════════════════════════ */}
        <section id="aliens" style={{ ...section, display:"flex", background:"#000" }}>

          {/* LEFT — Alien list (38%) */}
          <div style={{ width:"38%", borderRight:"1px solid rgba(255,255,255,.06)", display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 0 0 52px", overflowY:"auto" }}>
            <div style={{ marginBottom:40 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <div style={{ width:28, height:1, background:"rgba(255,255,255,.15)" }} />
                <span style={{ ...tag, color:"rgba(255,255,255,.22)" }}>Omnitrix Database</span>
              </div>
              <h2 style={{ ...bebas, fontSize:"clamp(44px,5.5vw,80px)", lineHeight:.88 }}>
                ALIEN<br /><span style={{ color:"#00e676" }}>ROSTER</span>
              </h2>
            </div>

            <div style={{ display:"flex", flexDirection:"column" }}>
              {ALIENS.map((a, i) => (
                <button key={a.name} onClick={() => setActive(i)}
                  style={{ cursor:"none", background:"none", border:"none", borderTop:"1px solid rgba(255,255,255,.05)", padding:"14px 48px 14px 0", display:"flex", alignItems:"center", justifyContent:"space-between", textAlign:"left", transition:"padding-left .25s ease" }}
                  onMouseEnter={e => (e.currentTarget.style.paddingLeft = "10px")}
                  onMouseLeave={e => (e.currentTarget.style.paddingLeft = "0px")}>
                  <div style={{ display:"flex", alignItems:"center", gap:18 }}>
                    <span style={{ ...mono, fontSize:9, color:"rgba(255,255,255,.18)", minWidth:22 }}>0{i+1}</span>
                    <div>
                      <div style={{ ...bebas, fontSize:22, letterSpacing:".03em", color: active===i ? a.color : "#fff", transition:"color .3s" }}>{a.name}</div>
                      <div style={{ ...tag, color:"rgba(255,255,255,.22)", marginTop:2 }}>{a.power}</div>
                    </div>
                  </div>
                  {active === i && <motion.div layoutId="bar" style={{ width:3, height:28, background: a.color, borderRadius:2 }} />}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Single 3D viewer (62%) */}
          <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(rgba(255,255,255,.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.013) 1px,transparent 1px)`, backgroundSize:"56px 56px", pointerEvents:"none", zIndex:1 }} />

            <AnimatePresence mode="wait">
              <motion.div key={active + "sel"} style={{ position:"absolute", inset:0 }}
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                transition={{ duration:.45 }}>
                <SelectorScene alien={alien} />
              </motion.div>
            </AnimatePresence>

            {/* Bottom info */}
            <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:4, padding:"0 0 40px 44px", background:"linear-gradient(to top,rgba(0,0,0,.92) 0%,transparent 55%)", pointerEvents:"none" }}>
              <AnimatePresence mode="wait">
                <motion.div key={active + "info"} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:.35 }}>
                  <div style={{ ...tag, color:"rgba(255,255,255,.25)", marginBottom:8 }}>Origin · {alien.planet}</div>
                  <h3 style={{ ...bebas, fontSize:52, color: alien.color, lineHeight:1, marginBottom:10 }}>{alien.name}</h3>
                  <div style={{ display:"inline-block", padding:"4px 12px", border:`1px solid ${alien.color}44`, ...tag, color: alien.color }}>{alien.power}</div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════
            SECTION 3 — ABILITIES
        ════════════════════════════════════════ */}
        <section id="abilities" style={{ ...section, display:"grid", gridTemplateColumns:"1fr 1fr", alignItems:"center", gap:80, padding:"0 52px", background:"#060608" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 80% 50%,rgba(0,25,70,.2) 0%,transparent 60%)", pointerEvents:"none" }} />

          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
              <div style={{ width:28, height:1, background:"#00e676" }} />
              <span style={{ ...tag, color:"#00e676" }}>Spider Instinct Layer</span>
            </div>
            <h2 style={{ ...bebas, fontSize:"clamp(44px,5.5vw,80px)", lineHeight:.9, marginBottom:24 }}>
              WEB<br /><span style={{ color:"#00e676" }}>ARCHITECT</span>
            </h2>
            <p style={{ fontSize:14, color:"rgba(255,255,255,.38)", lineHeight:1.75, maxWidth:400, marginBottom:48 }}>
              When Galvanic Mechamorph technology bonds with Peter Parker's enhanced nervous system, new physics become possible. The web adapts. The spider-sense mutates.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.06)" }}>
              {([["11ms","Spider-Sense Reaction"],["Mach 10","Jetray Velocity"],["∞","Web Strand Variants"],["100T","Four Arms Capacity"]] as const).map(([n,l]) => (
                <div key={l} style={{ background:"#060608", padding:"22px 20px" }}>
                  <div style={{ ...bebas, fontSize:36, color:"#00e676", lineHeight:1 }}>{n}</div>
                  <div style={{ ...tag, color:"rgba(255,255,255,.22)", marginTop:5 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Web SVG art */}
          <div style={{ position:"relative", zIndex:1, height:440, border:"1px solid rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" style={{ opacity:.18 }}>
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i / 12) * Math.PI * 2;
                return <line key={i} x1="200" y1="200" x2={200 + Math.cos(a) * 185} y2={200 + Math.sin(a) * 185} stroke="#00e676" strokeWidth=".6" />;
              })}
              {[45, 85, 125, 165, 185].map(r => (
                <circle key={r} cx="200" cy="200" r={r} stroke="#00e676" strokeWidth=".5" fill="none" />
              ))}
              {Array.from({ length: 12 }, (_, i) => {
                const a1 = (i / 12) * Math.PI * 2;
                const a2 = ((i + 1) / 12) * Math.PI * 2;
                return [45, 85, 125, 165].map(r => (
                  <line key={`${i}-${r}`}
                    x1={200 + Math.cos(a1) * r} y1={200 + Math.sin(a1) * r}
                    x2={200 + Math.cos(a2) * r} y2={200 + Math.sin(a2) * r}
                    stroke="#00e676" strokeWidth=".35" />
                ));
              })}
            </svg>
          </div>
        </section>

        {/* ════════════════════════════════════════
            SECTION 4 — MANIFEST
        ════════════════════════════════════════ */}
        <section id="manifest" style={{ ...section, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", padding:"0 52px", background:"#000" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 55%,rgba(0,230,118,.04) 0%,transparent 60%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", ...bebas, fontSize:"clamp(140px,22vw,300px)", color:"rgba(255,255,255,.016)", letterSpacing:"-.03em", userSelect:"none", whiteSpace:"nowrap" }}>
            MECHANICA
          </div>

          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
            style={{ ...tag, color:"#00e676", marginBottom:36, position:"relative", zIndex:1 }}>
            The Core Philosophy
          </motion.div>

          <motion.blockquote initial={{ opacity:0, y:36 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.75, delay:.15 }}
            style={{ ...bebas, fontSize:"clamp(38px,5.5vw,76px)", lineHeight:1.04, color:"#fff", maxWidth:900, marginBottom:36, position:"relative", zIndex:1 }}>
            We don't build websites.<br />
            We engineer <span style={{ color:"#00e676" }}>living universes</span><br />
            from alien instinct.
          </motion.blockquote>

          <motion.p initial={{ opacity:0, y:18 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:.45 }}
            style={{ fontSize:13, color:"rgba(255,255,255,.35)", maxWidth:440, lineHeight:1.8, position:"relative", zIndex:1 }}>
            MECHANICA exists at the intersection of Spider-Man's biological mastery and Ben 10's extraterrestrial engineering. Not a portfolio. A civilization.
          </motion.p>
        </section>

        {/* Footer */}
        <footer style={{ scrollSnapAlign:"start", padding:"36px 52px", borderTop:"1px solid rgba(255,255,255,.06)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#060608" }}>
          <span style={{ ...bebas, fontSize:16, letterSpacing:".15em", color:"rgba(255,255,255,.18)" }}>MECHANICA</span>
          <span style={{ ...tag, color:"rgba(255,255,255,.1)" }}>SPIDER-MAN × BEN 10 © 2026</span>
          <span style={{ ...tag, color:"rgba(255,255,255,.1)" }}>AWWWARDS NOMINEE</span>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { background: #060608; color: #fff; overflow: hidden; cursor: none; -webkit-font-smoothing: antialiased; }
        button { cursor: none; }
        a { cursor: none; }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
