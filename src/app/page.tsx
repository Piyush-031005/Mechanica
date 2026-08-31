"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows, Float, useProgress, Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// ─── DATA ───────────────────────────────────────────────
const ALIENS = [
  { name: "DIAMONDHEAD", power: "Crystal Physiology",    planet: "Petropia",      color: "#00e5ff", model: "/modals/diamondhead_classic__low_poly__ben_10.glb", scale: 3.2, ry: 0 },
  { name: "FOUR ARMS",   power: "Enhanced Strength",     planet: "Khoros",        color: "#e31f1f", model: "/modals/fourarms_ben_10_os.glb",                     scale: 2.6, ry: 0 },
  { name: "XLR8",        power: "Mach 5 Velocity",       planet: "Kinet",         color: "#00e676", model: "/modals/xlr8_young.glb",                             scale: 3.0, ry: 0 },
  { name: "SWAMPFIRE",   power: "Pyro-Plant Control",    planet: "Methanos",      color: "#ff6d00", model: "/modals/swampfire_ben_10.glb",                       scale: 2.8, ry: 0 },
  { name: "CANNONBOLT",  power: "Armodrillo Shell",      planet: "Arburia",       color: "#ffd600", model: "/modals/canonbolt_ben_10.glb",                       scale: 3.0, ry: 0 },
  { name: "JETRAY",      power: "Mach 10 Flight",        planet: "Aeropela",      color: "#aa00ff", model: "/modals/jetray_-_ben_10_rigged.glb",                 scale: 2.3, ry: 0 },
  { name: "WILDMUTT",    power: "Hyperactive Senses",    planet: "Vulpin",        color: "#ff8f00", model: "/modals/wildmutt_ben_10_vilgax_attacks_fan_model.glb", scale: 3.0, ry: 0 },
  { name: "SPIDERMONKEY",power: "Prehensile Web Silk",   planet: "Arachna",       color: "#4fc3f7", model: "/modals/spidermonkey.glb",                           scale: 2.8, ry: 0 },
];

// ─── LOADER ─────────────────────────────────────────────
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        fontFamily: "'Space Mono', monospace", fontSize: 9,
        letterSpacing: ".3em", color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase"
      }}>
        {Math.round(progress)}%
      </div>
    </Html>
  );
}

// ─── 3D MODEL ───────────────────────────────────────────
function AlienMesh({ url, scale, color }: { url: string; scale: number; color: string }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    const c = new THREE.Color(color);
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        const m = (o as THREE.Mesh).material as any;
        if (m?.emissive) m.emissive = c.clone().multiplyScalar(0.12);
        if (m?.roughness !== undefined) m.roughness = Math.min((m.roughness ?? 0.5), 0.7);
      }
    });
  }, [scene, color]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.3;
  });

  return (
    <Float speed={1.2} floatIntensity={0.5} rotationIntensity={0}>
      <primitive ref={ref} object={scene} scale={scale} position={[0, -1.2, 0]} />
    </Float>
  );
}

// ─── SPIDER WEB HOOK ────────────────────────────────────
function useWebCanvas(ref: React.RefObject<HTMLCanvasElement | null>, color: string) {
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    const m = { x: c.width / 2, y: c.height / 2 };
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5,
    }));
    const mm = (e: MouseEvent) => { m.x = e.clientX; m.y = e.clientY; };
    window.addEventListener("mousemove", mm);
    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 130) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 130) * .12})`; ctx.lineWidth = .4; ctx.stroke();
          }
        }
        const d = Math.hypot(pts[i].x - m.x, pts[i].y - m.y);
        if (d < 180) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(m.x, m.y);
          const alpha = Math.floor((1 - d / 180) * 80).toString(16).padStart(2, "0");
          ctx.strokeStyle = color + alpha; ctx.lineWidth = .7; ctx.stroke();
        }
      }
      id = requestAnimationFrame(draw);
    };
    draw();
    const ro = new ResizeObserver(resize); ro.observe(c);
    return () => { cancelAnimationFrame(id); window.removeEventListener("mousemove", mm); ro.disconnect(); };
  }, [ref, color]);
}

// ─── MAIN PAGE ──────────────────────────────────────────
export default function Home() {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(0);
  const curDot = useRef<HTMLDivElement>(null);
  const curRing = useRef<HTMLDivElement>(null);
  const webRef = useRef<HTMLCanvasElement>(null);
  const alien = ALIENS[active];

  useWebCanvas(webRef, alien.color);

  // cursor
  useEffect(() => {
    const m = (e: MouseEvent) => {
      if (curDot.current) { curDot.current.style.left = e.clientX + "px"; curDot.current.style.top = e.clientY + "px"; }
      setTimeout(() => { if (curRing.current) { curRing.current.style.left = e.clientX + "px"; curRing.current.style.top = e.clientY + "px"; } }, 80);
    };
    window.addEventListener("mousemove", m);
    return () => window.removeEventListener("mousemove", m);
  }, []);

  const select = (i: number) => { setPrev(active); setActive(i); };

  return (
    <>
      {/* cursor */}
      <div id="cur-dot" ref={curDot} style={{ position:"fixed", width:10, height:10, borderRadius:"50%", background: alien.color, pointerEvents:"none", zIndex:99999, transform:"translate(-50%,-50%)", mixBlendMode:"screen" }} />
      <div id="cur-ring" ref={curRing} style={{ position:"fixed", width:38, height:38, borderRadius:"50%", border:`1px solid ${alien.color}66`, pointerEvents:"none", zIndex:99998, transform:"translate(-50%,-50%)", transition:"all .12s ease" }} />

      {/* noise */}
      <div style={{ position:"fixed", inset:0, opacity:.025, pointerEvents:"none", zIndex:9997, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* NAV */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:1000, padding:"22px 56px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"linear-gradient(to bottom,rgba(6,6,8,.95),transparent)" }}>
        <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:".2em", color: alien.color, transition:"color .5s" }}>MECHANICA</span>
        <div style={{ display:"flex", gap:40 }}>
          {["Aliens","Abilities","Manifest"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:".25em", color:"rgba(255,255,255,.35)", textDecoration:"none", textTransform:"uppercase" }}>{l}</a>
          ))}
        </div>
      </nav>

      {/* ═══════════════════════════════
          HERO — full-screen split
      ═══════════════════════════════ */}
      <section id="hero" style={{ width:"100vw", height:"100vh", display:"flex", overflow:"hidden", position:"relative", background:"#060608" }}>

        {/* Spider web layer */}
        <canvas ref={webRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:.4, pointerEvents:"none" }} />

        {/* LEFT TEXT 40% */}
        <div style={{ width:"44%", display:"flex", flexDirection:"column", justifyContent:"center", padding:"0 0 0 56px", position:"relative", zIndex:2 }}>
          <motion.div key={active + "ey"} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ duration:.4 }}
            style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background: alien.color, animation:"blink 2s infinite" }} />
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:".35em", color: alien.color, textTransform:"uppercase" }}>Spider-Man × Ben 10</span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.h1 key={active + "h1"}
              initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
              transition={{ duration:.45 }}
              style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(64px,7.5vw,120px)", lineHeight:.88, letterSpacing:"-.01em", margin:"0 0 24px" }}>
              <span style={{ color: alien.color }}>{alien.name}</span><br />
              <span style={{ color:"#fff" }}>ALIEN</span><br />
              <span style={{ color:"#e31f1f" }}>SPIDER</span><br />
              <span style={{ color:"#fff" }}>MIND</span>
            </motion.h1>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div key={active + "info"}
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:.35 }}>
              <div style={{ display:"inline-block", padding:"4px 14px", border:`1px solid ${alien.color}`, marginBottom:14,
                fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:".2em", textTransform:"uppercase", color: alien.color }}>
                {alien.power}
              </div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:".2em", color:"rgba(255,255,255,.25)", textTransform:"uppercase", marginBottom:20 }}>
                {alien.planet}
              </div>
            </motion.div>
          </AnimatePresence>

          <p style={{ fontSize:14, lineHeight:1.75, color:"rgba(255,255,255,.45)", maxWidth:380, marginBottom:40 }}>
            Ten alien transformations fused with spider instinct. Where extraterrestrial biology meets Peter Parker's enhanced nervous system — a living universe.
          </p>

          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => select((active + 1) % ALIENS.length)}
              style={{ padding:"12px 28px", background: alien.color, color:"#000", fontFamily:"'Space Mono',monospace", fontSize:10, fontWeight:700, letterSpacing:".15em", textTransform:"uppercase", border:"none", cursor:"none", clipPath:"polygon(7px 0%,100% 0%,calc(100% - 7px) 100%,0% 100%)", transition:"all .25s" }}>
              Transform
            </button>
            <button onClick={() => document.getElementById("aliens")?.scrollIntoView({ behavior:"smooth" })}
              style={{ padding:"11px 28px", background:"transparent", color:"rgba(255,255,255,.4)", fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:".15em", textTransform:"uppercase", border:"1px solid rgba(255,255,255,.1)", cursor:"none", transition:"all .25s" }}>
              View All
            </button>
          </div>
        </div>

        {/* RIGHT 3D MODEL 60% — single canvas */}
        <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
          {/* Gradient fade left */}
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"30%", background:"linear-gradient(to right,#060608,transparent)", zIndex:2, pointerEvents:"none" }} />

          <AnimatePresence mode="wait">
            <motion.div key={active + "model"}
              style={{ position:"absolute", inset:0 }}
              initial={{ opacity:0, scale:.95 }}
              animate={{ opacity:1, scale:1 }}
              exit={{ opacity:0, scale:1.05 }}
              transition={{ duration:.6 }}>
              <Canvas camera={{ position:[0, 1.5, 6], fov:42 }} style={{ width:"100%", height:"100%" }}
                gl={{ antialias:true, toneMapping:THREE.ACESFilmicToneMapping, toneMappingExposure:1.1 }}>
                <Suspense fallback={<Loader />}>
                  <ambientLight intensity={0.25} />
                  <directionalLight position={[4, 6, 4]} intensity={2.5} color={alien.color} />
                  <directionalLight position={[-5, -2, -5]} intensity={0.6} color="#ffffff" />
                  <pointLight position={[0, 6, 0]} intensity={40} color={alien.color} distance={20} decay={2} />
                  <pointLight position={[0, -2, 4]} intensity={15} color={alien.color} distance={12} decay={2} />
                  <AlienMesh url={alien.model} scale={alien.scale} color={alien.color} />
                  <ContactShadows position={[0, -3.5, 0]} opacity={0.6} scale={12} blur={2.5} />
                  <Environment preset="night" />
                </Suspense>
              </Canvas>
            </motion.div>
          </AnimatePresence>

          {/* Rotating ring overlay */}
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:3, pointerEvents:"none" }}>
            <motion.svg
              animate={{ rotate:360 }}
              transition={{ duration:30, repeat:Infinity, ease:"linear" }}
              width={500} height={500} viewBox="0 0 500 500" fill="none" style={{ opacity:.18 }}>
              <circle cx="250" cy="250" r="240" stroke={alien.color} strokeWidth=".8" />
              {Array.from({ length: 72 }).map((_,i)=>{
                const a=(i/72)*Math.PI*2, isMaj=i%9===0;
                const inn=isMaj?226:233;
                return <line key={i}
                  x1={250+Math.cos(a)*inn} y1={250+Math.sin(a)*inn}
                  x2={250+Math.cos(a)*240} y2={250+Math.sin(a)*240}
                  stroke={alien.color} strokeWidth={isMaj?1.5:.5} strokeOpacity={isMaj?.7:.2} />;
              })}
              <circle cx="250" cy="250" r="170" stroke={alien.color} strokeWidth="1" strokeDasharray="8 8" />
            </motion.svg>
          </div>

          {/* Model name overlay bottom-right */}
          <div style={{ position:"absolute", bottom:48, right:48, zIndex:4, textAlign:"right", pointerEvents:"none" }}>
            <AnimatePresence mode="wait">
              <motion.div key={active + "tag"}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                transition={{ duration:.35 }}>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:".3em", color:"rgba(255,255,255,.2)", textTransform:"uppercase", marginBottom:6 }}>ACTIVE FORM</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, letterSpacing:".05em", color: alien.color }}>{alien.name}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, borderTop:"1px solid rgba(255,255,255,.06)", display:"flex", zIndex:5, background:"rgba(6,6,8,.8)", backdropFilter:"blur(16px)" }}>
          {[["10","Alien Forms"],["∞","Web Combos"],["500 mph","Peak Velocity"],["100T","Lift Capacity"]].map(([n,l],i)=>(
            <div key={l} style={{ flex:1, padding:"20px 32px", borderRight: i<3?"1px solid rgba(255,255,255,.06)":"none" }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, color:i===0?alien.color:"#fff", lineHeight:1 }}>{n}</div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:".25em", color:"rgba(255,255,255,.2)", textTransform:"uppercase", marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════
          ALIEN SELECT — single viewer
      ═══════════════════════════════ */}
      <section id="aliens" style={{ minHeight:"100vh", background:"#000", display:"flex" }}>
        
        {/* Left: Alien List */}
        <div style={{ width:"42%", borderRight:"1px solid rgba(255,255,255,.06)", display:"flex", flexDirection:"column", justifyContent:"center", padding:"80px 0 80px 56px" }}>
          <div style={{ marginBottom:56 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
              <div style={{ width:32, height:"1px", background:"rgba(255,255,255,.15)" }} />
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:".35em", color:"rgba(255,255,255,.25)", textTransform:"uppercase" }}>Omnitrix Database</span>
            </div>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(48px,6vw,88px)", lineHeight:.88, letterSpacing:"-.01em" }}>
              ALIEN<br /><span style={{ color:"#00e676" }}>ROSTER</span>
            </h2>
          </div>

          {ALIENS.map((a, i) => (
            <div key={a.name}
              onClick={() => select(i)}
              style={{ cursor:"none", padding:"20px 0", borderTop:"1px solid rgba(255,255,255,.05)", display:"flex", alignItems:"center", justifyContent:"space-between", paddingRight:48, transition:"all .3s" }}
              onMouseEnter={e => (e.currentTarget.style.paddingLeft = "12px")}
              onMouseLeave={e => (e.currentTarget.style.paddingLeft = "0px")}>
              <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"rgba(255,255,255,.2)", minWidth:24 }}>0{i+1}</span>
                <div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:".03em",
                    color: active === i ? a.color : "#fff", transition:"color .3s" }}>{a.name}</div>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:".2em", color:"rgba(255,255,255,.25)", textTransform:"uppercase" }}>{a.power}</div>
                </div>
              </div>
              {active === i && (
                <motion.div layoutId="active-bar" style={{ width:3, height:36, background: a.color, borderRadius:2 }} />
              )}
            </div>
          ))}
        </div>

        {/* Right: Single 3D Viewer */}
        <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
          <AnimatePresence mode="wait">
            <motion.div key={active + "sel"}
              style={{ position:"absolute", inset:0 }}
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:.5 }}>
              <Canvas camera={{ position:[0, 0.5, 6], fov:44 }} style={{ width:"100%", height:"100%" }}
                gl={{ antialias:true, toneMapping:THREE.ACESFilmicToneMapping, toneMappingExposure:1.1 }}>
                <Suspense fallback={<Loader />}>
                  <ambientLight intensity={0.2} />
                  <directionalLight position={[5, 8, 5]} intensity={3} color={alien.color} />
                  <directionalLight position={[-5, -3, -5]} intensity={0.7} color="#ffffff" />
                  <pointLight position={[0, 8, 0]} intensity={60} color={alien.color} distance={25} decay={2} />
                  <pointLight position={[0, -1, 5]} intensity={25} color={alien.color} distance={15} decay={2} />
                  <AlienMesh url={alien.model} scale={alien.scale * 1.05} color={alien.color} />
                  <ContactShadows position={[0, -3.5, 0]} opacity={0.7} scale={14} blur={3} />
                  <Environment preset="night" />
                </Suspense>
              </Canvas>
            </motion.div>
          </AnimatePresence>

          {/* Info overlay */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:4, padding:"0 0 48px 48px", pointerEvents:"none",
            background:"linear-gradient(to top,rgba(0,0,0,.9) 0%,transparent 60%)" }}>
            <AnimatePresence mode="wait">
              <motion.div key={active + "det"}
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                transition={{ duration:.35 }}>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:".3em", color:"rgba(255,255,255,.3)", textTransform:"uppercase", marginBottom:8 }}>
                  Origin: {alien.planet}
                </div>
                <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, letterSpacing:".02em", color: alien.color, lineHeight:1, marginBottom:12 }}>{alien.name}</h3>
                <div style={{ display:"inline-block", padding:"5px 14px", border:`1px solid ${alien.color}55`, fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:".2em", textTransform:"uppercase", color: alien.color }}>
                  {alien.power}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Grid overlay for that tech feel */}
          <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)`, backgroundSize:"60px 60px", pointerEvents:"none", zIndex:1 }} />
        </div>
      </section>

      {/* ═══════════════════════════════
          ABILITIES
      ═══════════════════════════════ */}
      <section id="abilities" style={{ minHeight:"100vh", background:"#060608", display:"grid", gridTemplateColumns:"1fr 1fr", alignItems:"center", gap:80, padding:"120px 56px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 80% 50%,rgba(0,30,80,.2) 0%,transparent 60%)", pointerEvents:"none" }} />
        
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <div style={{ width:32, height:"1px", background:"#00e676" }} />
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:".35em", color:"#00e676", textTransform:"uppercase" }}>Spider Instinct Layer</span>
          </div>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(52px,6vw,88px)", lineHeight:.9, marginBottom:28 }}>
            WEB<br /><span style={{ color:"#00e676" }}>ARCHITECT</span>
          </h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,.4)", lineHeight:1.75, maxWidth:420, marginBottom:52 }}>
            When Galvanic Mechamorph technology bonds with Peter Parker's enhanced nervous system, new physics become possible. The web adapts. The spider-sense mutates.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.07)" }}>
            {[["11ms","Spider-Sense"],["Mach 10","Jetray Speed"],["∞","Web Variants"],["100T","Four Arms"]].map(([n,l])=>(
              <div key={l} style={{ background:"#060608", padding:"24px 22px" }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:38, color:"#00e676", lineHeight:1 }}>{n}</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:".2em", color:"rgba(255,255,255,.25)", textTransform:"uppercase", marginTop:6 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live web canvas */}
        <div style={{ position:"relative", height:500, border:"1px solid rgba(255,255,255,.07)" }}>
          {/* We reuse the same webRef canvas but this is a separate visual — just show placeholder art */}
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" style={{ opacity:.15 }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i / 12) * Math.PI * 2;
                return <line key={i} x1="200" y1="200" x2={200 + Math.cos(a) * 190} y2={200 + Math.sin(a) * 190} stroke="#00e676" strokeWidth=".6" />;
              })}
              {[40, 80, 120, 160, 190].map(r => <circle key={r} cx="200" cy="200" r={r} stroke="#00e676" strokeWidth=".5" fill="none" />)}
              {/* Radial web segments */}
              {Array.from({ length: 12 }).map((_, i) => {
                const a1 = (i / 12) * Math.PI * 2;
                const a2 = ((i + 1) / 12) * Math.PI * 2;
                return [40, 80, 120, 160].map(r => (
                  <line key={`${i}-${r}`}
                    x1={200 + Math.cos(a1) * r} y1={200 + Math.sin(a1) * r}
                    x2={200 + Math.cos(a2) * r} y2={200 + Math.sin(a2) * r}
                    stroke="#00e676" strokeWidth=".4" />
                ));
              })}
            </svg>
          </div>
          {/* Corner brackets */}
          {[[0,0,"top:0;left:0","borderTop:1px solid","borderLeft:1px solid"],[1,0,"top:0;right:0","borderTop:1px solid","borderRight:1px solid"],[0,1,"bottom:0;left:0","borderBottom:1px solid","borderLeft:1px solid"],[1,1,"bottom:0;right:0","borderBottom:1px solid","borderRight:1px solid"]].map(([,,pos],idx)=>(
            <div key={idx} style={{ position:"absolute", ...Object.fromEntries((pos as string).split(";").map((p:string)=>p.split(":"))), width:20, height:20, borderColor:"rgba(0,230,118,.3)", borderStyle:"solid", borderWidth:0, ...(idx===0?{borderTopWidth:1,borderLeftWidth:1}:idx===1?{borderTopWidth:1,borderRightWidth:1}:idx===2?{borderBottomWidth:1,borderLeftWidth:1}:{borderBottomWidth:1,borderRightWidth:1}) }} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════
          MANIFEST
      ═══════════════════════════════ */}
      <section id="manifest" style={{ minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", padding:"120px 56px", background:"#000", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 60%,rgba(0,230,118,.04) 0%,transparent 65%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(160px,25vw,340px)", color:"rgba(255,255,255,.018)", letterSpacing:"-.03em", userSelect:"none", whiteSpace:"nowrap", top:"50%", left:"50%", transform:"translate(-50%,-50%)" }}>MECHANICA</div>
        
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:".4em", color:"#00e676", textTransform:"uppercase", marginBottom:40, position:"relative", zIndex:1 }}>
          The Core Philosophy
        </motion.div>

        <motion.blockquote initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:.8, delay:.2 }}
          style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(40px,6vw,82px)", lineHeight:1.02, color:"#fff", maxWidth:960, marginBottom:40, position:"relative", zIndex:1 }}>
          We don't build websites.<br />
          We engineer <span style={{ color:"#00e676" }}>living universes</span><br />
          from alien instinct.
        </motion.blockquote>

        <motion.p initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:.5 }}
          style={{ fontSize:14, color:"rgba(255,255,255,.4)", maxWidth:460, lineHeight:1.75, position:"relative", zIndex:1 }}>
          MECHANICA exists at the intersection of Spider-Man's biological mastery and Ben 10's extraterrestrial engineering. Not a portfolio. A civilization.
        </motion.p>
      </section>

      {/* FOOTER */}
      <footer style={{ padding:"40px 56px", borderTop:"1px solid rgba(255,255,255,.06)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#060608" }}>
        <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:".15em", color:"rgba(255,255,255,.2)" }}>MECHANICA</span>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:".2em", color:"rgba(255,255,255,.12)" }}>SPIDER-MAN × BEN 10 © 2026</span>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8, letterSpacing:".2em", color:"rgba(255,255,255,.12)" }}>AWWWARDS NOMINEE</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:#060608;color:#fff;font-family:sans-serif;overflow-x:hidden;cursor:none;-webkit-font-smoothing:antialiased;}
        body::-webkit-scrollbar{display:none;}
        a{text-decoration:none;}
        button{cursor:none;}
      `}</style>
    </>
  );
}
