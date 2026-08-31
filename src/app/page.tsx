"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, OrbitControls, ContactShadows, Float } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────
// ALIEN DATA (with real GLB model paths)
// ─────────────────────────────────────────────────────────────────
const ALIENS = [
  {
    name: "DIAMONDHEAD",
    power: "Crystal Physiology",
    planet: "Petrosapien · Petropia",
    desc: "Virtually indestructible. Refracts energy into razor shards. Can grow crystal structures from any surface.",
    color: "#00e5ff",
    model: "/modals/diamondhead_classic__low_poly__ben_10.glb",
    scale: 3.5,
  },
  {
    name: "FOUR ARMS",
    power: "Enhanced Strength",
    planet: "Tetramand · Khoros",
    desc: "100-ton lifting capacity. Shockwaves from a single clap. The ultimate close-combat engine.",
    color: "#e31f1f",
    model: "/modals/fourarms_ben_10_os.glb",
    scale: 2.8,
  },
  {
    name: "XLR8",
    power: "Super Velocity",
    planet: "Kineceleran · Kinet",
    desc: "500 mph. Creates tornados from sheer speed. Processes time at 1000x normal rate.",
    color: "#00e676",
    model: "/modals/xlr8_young.glb",
    scale: 3.2,
  },
  {
    name: "SWAMPFIRE",
    power: "Pyro-Plant Manipulation",
    planet: "Methanosian · Methanos",
    desc: "Combustible methane flames. Regenerates instantly. Grows vines that can crush steel.",
    color: "#ff6d00",
    model: "/modals/swampfire_ben_10.glb",
    scale: 3.0,
  },
  {
    name: "CANNONBOLT",
    power: "Armodrillo Shell",
    planet: "Arburian Pelarota · Arburia",
    desc: "Rolls into an indestructible sphere. Deflects almost any attack. Peak speed: 200mph.",
    color: "#ffd600",
    model: "/modals/canonbolt_ben_10.glb",
    scale: 3.0,
  },
  {
    name: "JETRAY",
    power: "Mach 10 Flight",
    planet: "Aerophibian · Aeropela",
    desc: "Faster than light in space. Neuroshock blasts that bypass conventional shielding.",
    color: "#aa00ff",
    model: "/modals/jetray_-_ben_10_rigged.glb",
    scale: 2.5,
  },
  {
    name: "WILDMUTT",
    power: "Enhanced Senses",
    planet: "Vulpimancer · Vulpin",
    desc: "No eyes — senses 10x stronger. Porcupine quills as projectiles. Moves on all fours at 60mph.",
    color: "#ff8f00",
    model: "/modals/wildmutt_ben_10_vilgax_attacks_fan_model.glb",
    scale: 3.2,
  },
];

// ─────────────────────────────────────────────────────────────────
// 3D MODEL COMPONENT (auto-rotates, floats)
// ─────────────────────────────────────────────────────────────────
function AlienModel({ url, scale, color }: { url: string; scale: number; color: string }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

  // Tint all materials toward the alien's color
  useEffect(() => {
    const tint = new THREE.Color(color);
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material;
        if (Array.isArray(mat)) {
          mat.forEach((m: any) => {
            if (m.emissive) m.emissive = tint.clone().multiplyScalar(0.08);
          });
        } else if ((mat as any)?.emissive) {
          (mat as any).emissive = tint.clone().multiplyScalar(0.08);
        }
      }
    });
  }, [scene, color]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <Float speed={1.5} floatIntensity={0.6} rotationIntensity={0}>
      <primitive ref={ref} object={scene} scale={scale} position={[0, -1, 0]} />
    </Float>
  );
}

// ─────────────────────────────────────────────────────────────────
// MINI HERO MODEL (full-screen background for hero section)
// ─────────────────────────────────────────────────────────────────
function HeroModel({ alienIndex }: { alienIndex: number }) {
  const alien = ALIENS[alienIndex];
  return (
    <Canvas
      camera={{ position: [0, 1, 7], fov: 40 }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={2} color={alien.color} />
        <directionalLight position={[-5, -2, -5]} intensity={0.5} color="#ffffff" />
        <pointLight position={[0, 5, 0]} intensity={30} color={alien.color} distance={20} decay={2} />
        <AlienModel url={alien.model} scale={alien.scale * 0.85} color={alien.color} />
        <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={10} blur={2} />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}

// ─────────────────────────────────────────────────────────────────
// ALIEN CARD WITH 3D MODEL
// ─────────────────────────────────────────────────────────────────
function AlienCard({ alien, index }: { alien: typeof ALIENS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="alien-slide"
      style={{ borderLeft: `1px solid rgba(255,255,255,0.05)` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 3D Canvas */}
      <div className="alien-canvas-wrap">
        <Canvas
          camera={{ position: [0, 0.5, 5], fov: 45 }}
          style={{ width: "100%", height: "100%" }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.2} />
            <directionalLight position={[3, 5, 3]} intensity={2.5} color={alien.color} />
            <directionalLight position={[-3, -2, -3]} intensity={0.5} />
            <pointLight position={[0, 4, 0]} intensity={20} color={alien.color} distance={15} decay={2} />
            <AlienModel url={alien.model} scale={alien.scale} color={alien.color} />
            <ContactShadows position={[0, -2.8, 0]} opacity={0.5} scale={8} blur={2} />
            <Environment preset="night" />
          </Suspense>
        </Canvas>
      </div>

      {/* Overlay */}
      <div className="alien-slide-overlay" style={{
        background: `linear-gradient(to top, rgba(0,0,0,.98) 0%, rgba(0,0,0,.4) 50%, rgba(0,0,0,${hovered ? '0.1' : '0.2'}) 100%)`,
        transition: "background 0.5s ease"
      }} />

      {/* Content */}
      <div className="alien-slide-content">
        <div className="alien-idx">0{index + 1} / {String(ALIENS.length).padStart(2, '0')}</div>
        <h3 style={{ color: "#fff" }}>{alien.name}</h3>
        <div className="alien-power-tag" style={{ color: alien.color, borderColor: alien.color }}>
          {alien.power}
        </div>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "8px", letterSpacing: ".25em",
          color: "rgba(255,255,255,0.3)", marginBottom: "10px",
          textTransform: "uppercase"
        }}>
          {alien.planet}
        </div>
        <p>{alien.desc}</p>
      </div>

      {/* Hover glow border */}
      <div style={{
        position: "absolute", inset: 0,
        border: `1px solid ${alien.color}`,
        opacity: hovered ? 0.25 : 0,
        transition: "opacity 0.4s ease",
        pointerEvents: "none"
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SPIDER WEB CANVAS
// ─────────────────────────────────────────────────────────────────
function useSpiderWeb(canvasRef: React.RefObject<HTMLCanvasElement>, color = "#00e676") {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const nodes = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", onMove);

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 150) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        const mdx = nodes[i].x - mouse.x;
        const mdy = nodes[i].y - mouse.y;
        const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 200) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `${color}${Math.floor((1 - md / 200) * 60).toString(16).padStart(2, "0")}`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      ro.disconnect();
    };
  }, [canvasRef, color]);
}

// ─────────────────────────────────────────────────────────────────
// OMNITRIX RING SVG (hero decoration)
// ─────────────────────────────────────────────────────────────────
function OmnitrixRing({ color, size = 460 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 460 460" fill="none" style={{ position: "absolute", inset: 0, margin: "auto" }}>
      <circle cx="230" cy="230" r="225" stroke={color} strokeWidth="1" strokeOpacity=".18" />
      {Array.from({ length: 60 }).map((_, i) => {
        const a = (i / 60) * Math.PI * 2;
        const isMajor = i % 5 === 0;
        const inner = isMajor ? 206 : 213;
        return (
          <line key={i}
            x1={230 + Math.cos(a) * inner} y1={230 + Math.sin(a) * inner}
            x2={230 + Math.cos(a) * 224} y2={230 + Math.sin(a) * 224}
            stroke={color} strokeWidth={isMajor ? 1.5 : 0.5}
            strokeOpacity={isMajor ? 0.6 : 0.15}
          />
        );
      })}
      <circle cx="230" cy="230" r="185" stroke={color} strokeWidth="1" strokeOpacity=".08" />
      <circle cx="230" cy="230" r="140" stroke={color} strokeWidth="1.5" strokeOpacity=".3"
        strokeDasharray="6 6" />
      {[0, 90, 180, 270].map((deg) => {
        const a = (deg * Math.PI) / 180;
        const x = 230 + Math.cos(a) * 140;
        const y = 230 + Math.sin(a) * 140;
        return <circle key={deg} cx={x} cy={y} r="3.5" fill={color} opacity=".7" />;
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────
export default function Home() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const webRef = useRef<HTMLCanvasElement>(null);
  const [activeAlien, setActiveAlien] = useState(0);
  const current = ALIENS[activeAlien];

  useSpiderWeb(webRef, current.color);

  // Custom cursor
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top = e.clientY + "px";
      }
      setTimeout(() => {
        if (ringRef.current) {
          ringRef.current.style.left = e.clientX + "px";
          ringRef.current.style.top = e.clientY + "px";
        }
      }, 80);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Auto-cycle through aliens in hero
  useEffect(() => {
    const t = setInterval(() => setActiveAlien((p) => (p + 1) % ALIENS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* Cursor */}
      <div id="cursor" ref={cursorRef} style={{ background: current.color }} />
      <div id="cursor-ring" ref={ringRef} style={{ borderColor: current.color + "66" }} />
      <div id="noise" />

      {/* NAV */}
      <nav>
        <a href="#" className="logo">MECHANICA</a>
        <ul className="nav-links">
          <li><a href="#aliens">Aliens</a></li>
          <li><a href="#web-arch">Abilities</a></li>
          <li><a href="#quote">Manifest</a></li>
        </ul>
      </nav>

      {/* ═══════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════ */}
      <section id="hero">
        {/* 3D Model background — full right half */}
        <div className="hero-model-bg">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeAlien}
              style={{ position: "absolute", inset: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <HeroModel alienIndex={activeAlien} />
            </motion.div>
          </AnimatePresence>

          {/* Omnitrix ring overlay */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <motion.div
              key={activeAlien + "ring"}
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              style={{ position: "relative", width: 460, height: 460 }}
            >
              <OmnitrixRing color={current.color} />
            </motion.div>
          </div>
        </div>

        {/* Gradient mask over model */}
        <div className="hero-bg-image" />

        {/* Left content */}
        <div className="hero-left">
          <motion.div
            className="eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="eyebrow-dot" style={{ background: current.color }} />
            <span className="eyebrow-txt" style={{ color: current.color }}>
              Spider-Man × Ben 10 Universe
            </span>
          </motion.div>

          <motion.h1
            className="hero-h1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="g" style={{ color: current.color }}>ALIEN</span><br />
            INSTINCT<br />
            <span className="r">SPIDER</span><br />
            MIND
          </motion.h1>

          <motion.p
            className="hero-desc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            Ten alien transformations fused with spider instinct.
            Where extraterrestrial biology meets Peter Parker's enhanced nervous system.
            This is not a website — it's a living universe.
          </motion.p>

          <motion.div
            className="actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              className="btn-p"
              style={{ background: current.color }}
              onClick={() => setActiveAlien((p) => (p + 1) % ALIENS.length)}
            >
              Transform
            </button>
            <button className="btn-g">
              Explore Aliens
            </button>
          </motion.div>

          {/* Active alien label */}
          <motion.div
            key={activeAlien}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              marginTop: 44,
              display: "flex", alignItems: "center", gap: 12
            }}
          >
            <div style={{ width: 1, height: 40, background: current.color, opacity: 0.4 }} />
            <div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 8, letterSpacing: ".3em",
                color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 4
              }}>Active Form</div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 24, letterSpacing: ".05em", color: current.color
              }}>{current.name}</div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          {[
            { n: "10", l: "Alien Forms" },
            { n: "∞", l: "Web Combos" },
            { n: "500", l: "MPH Peak" },
          ].map((s, i) => (
            <div key={s.l} style={{ display: "flex", alignItems: "flex-end", gap: 0 }}>
              {i > 0 && <div className="stat-div" />}
              <div className="stat">
                <div className="stat-n">{s.n}</div>
                <div className="stat-l">{s.l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          ALIENS STRIP
      ═══════════════════════════════════════════════ */}
      <section id="aliens">
        <div className="aliens-intro">
          <div>
            <div className="rule">
              <div className="rule-line" style={{ maxWidth: 48 }} />
              <span className="rule-txt">Omnitrix Database</span>
            </div>
            <h2>
              ALIEN<br /><span>ROSTER</span>
            </h2>
          </div>
          <p>
            Each transformation is a complete biological overhaul. Every form carries its own physics, instincts, and combat language — fused with Peter's spider-sense.
          </p>
        </div>

        {/* Horizontal scrolling strip of 3D alien cards */}
        <div className="alien-strip">
          {ALIENS.map((alien, i) => (
            <AlienCard key={alien.name} alien={alien} index={i} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          WEB ARCHITECTURE
      ═══════════════════════════════════════════════ */}
      <section id="web-arch">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="arch-label">Spider Instinct Layer</div>
          <h2>WEB<br /><span style={{ color: "#00e676" }}>ARCHITECT</span></h2>
          <p className="arch-body">
            When Galvanic Mechamorph technology bonds with Peter Parker's enhanced nervous system, 
            something unprecedented emerges. The web fluid adapts. The spider-sense mutates. 
            New physics become possible.
          </p>
          <div className="arch-stats">
            {[
              { n: "11ms", l: "Spider-Sense Reaction" },
              { n: "Mach 10", l: "Jetray Velocity" },
              { n: "∞", l: "Web Strand Variants" },
              { n: "100T", l: "Four Arms Capacity" },
            ].map((s) => (
              <div key={s.l} className="arch-stat">
                <div className="arch-stat-n">{s.n}</div>
                <div className="arch-stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live web canvas */}
        <div className="web-visual">
          <canvas
            ref={webRef}
            id="web-canvas-arch"
            style={{ opacity: 0.7 }}
          />
          {/* Corner accents */}
          {[["0,0", "top:0;left:0"], ["100%,0", "top:0;right:0"], ["0,100%", "bottom:0;left:0"], ["100%,100%", "bottom:0;right:0"]].map(([, pos], i) => (
            <div key={i} style={{
              position: "absolute",
              ...(Object.fromEntries(pos.split(";").map(p => p.split(":")))),
              width: 20, height: 20,
              borderTop: i < 2 ? "1px solid rgba(0,230,118,0.3)" : "none",
              borderBottom: i >= 2 ? "1px solid rgba(0,230,118,0.3)" : "none",
              borderLeft: i % 2 === 0 ? "1px solid rgba(0,230,118,0.3)" : "none",
              borderRight: i % 2 === 1 ? "1px solid rgba(0,230,118,0.3)" : "none",
            }} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          BIG QUOTE
      ═══════════════════════════════════════════════ */}
      <section id="quote">
        <div className="quote-bg" />
        <div className="quote-num">10</div>

        <motion.div
          className="quote-tag"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ delay: 0.1 }}
        >
          The Core Philosophy
        </motion.div>

        <motion.blockquote
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          We don't build websites.<br />
          We engineer <em>living universes</em><br />
          from alien instinct.
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          MECHANICA exists at the intersection of Spider-Man's biological mastery and Ben 10's extraterrestrial engineering. Not a portfolio. A civilization.
        </motion.p>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="ft-logo">MECHANICA</div>
        <div className="ft-txt">SPIDER-MAN × BEN 10 © 2026</div>
        <div className="ft-txt">AWWWARDS NOMINEE</div>
      </footer>
    </>
  );
}
