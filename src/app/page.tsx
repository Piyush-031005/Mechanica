"use client";

import { useEffect, useRef, useState } from "react";

// Spider-web canvas hook
function useSpiderWeb(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const nodes: Array<{ x: number; y: number; vx: number; vy: number }> = [];

    // Generate web nodes
    for (let i = 0; i < 80; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Attract to mouse slightly
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          node.vx += dx * 0.00005;
          node.vy += dy * 0.00005;
        }
      });

      // Draw web strands
      nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / 160})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        });

        // Mouse connections
        const mdx = a.x - mouse.x;
        const mdy = a.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 180) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0, 230, 118, ${1 - mdist / 180})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef]);
}

// Omnitrix SVG component
function OmnitrixDial({ activeAlien }: { activeAlien: number }) {
  const colors = ["#00e676", "#ff1744", "#00b0ff", "#ff9100", "#aa00ff"];
  const color = colors[activeAlien % colors.length];

  return (
    <div className="omnitrix-container">
      <svg className="omnitrix-svg" viewBox="0 0 480 480" fill="none">
        {/* Outer tech ring */}
        <circle cx="240" cy="240" r="235" stroke={color} strokeWidth="1" strokeOpacity="0.2" />
        <circle cx="240" cy="240" r="220" stroke={color} strokeWidth="0.5" strokeOpacity="0.15" />

        {/* Rotating tick marks */}
        {Array.from({ length: 72 }).map((_, i) => {
          const angle = (i / 72) * Math.PI * 2;
          const inner = i % 6 === 0 ? 205 : 212;
          const outer = 220;
          return (
            <line
              key={i}
              x1={240 + Math.cos(angle) * inner}
              y1={240 + Math.sin(angle) * inner}
              x2={240 + Math.cos(angle) * outer}
              y2={240 + Math.sin(angle) * outer}
              stroke={color}
              strokeWidth={i % 6 === 0 ? 1.5 : 0.5}
              strokeOpacity={i % 6 === 0 ? 0.6 : 0.2}
            />
          );
        })}

        {/* Hexagonal alien sections */}
        {Array.from({ length: 10 }).map((_, i) => {
          const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
          const r = 170;
          const x = 240 + Math.cos(angle) * r;
          const y = 240 + Math.sin(angle) * r;
          const nextAngle = ((i + 1) / 10) * Math.PI * 2 - Math.PI / 2;
          const nx = 240 + Math.cos(nextAngle) * r;
          const ny = 240 + Math.sin(nextAngle) * r;
          return (
            <g key={i}>
              <line x1={240} y1={240} x2={x} y2={y}
                stroke={color} strokeWidth="0.5" strokeOpacity="0.15" />
            </g>
          );
        })}

        {/* Inner circuit ring */}
        <circle cx="240" cy="240" r="130" stroke={color} strokeWidth="1.5" strokeOpacity="0.4"
          strokeDasharray="8 4" />
        <circle cx="240" cy="240" r="118" stroke={color} strokeWidth="0.5" strokeOpacity="0.2" />

        {/* Corner accent marks */}
        {[0, 90, 180, 270].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x = 240 + Math.cos(rad) * 140;
          const y = 240 + Math.sin(rad) * 140;
          return (
            <g key={angle}>
              <circle cx={x} cy={y} r="4" fill={color} opacity="0.8" />
              <circle cx={x} cy={y} r="10" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
            </g>
          );
        })}
      </svg>

      {/* Static inner piece */}
      <div className="omnitrix-inner">
        <div className="omnitrix-core" style={{
          background: `radial-gradient(circle at 40% 30%, ${color}cc, #003820 50%, #001a0a)`,
          boxShadow: `0 0 40px ${color}88, 0 0 80px ${color}33, inset 0 0 30px rgba(0,0,0,0.5)`,
          border: `2px solid ${color}44`,
        }}>
          10
        </div>
      </div>
    </div>
  );
}

const ALIENS = [
  {
    emoji: "🔥",
    name: "HEATBLAST",
    power: "Pyrokinesis",
    desc: "Pyronite from the star Pyros. Controls fire at a molecular level, reaching temperatures of 1 million degrees.",
    color: "#ff6d00",
  },
  {
    emoji: "💎",
    name: "DIAMONDHEAD",
    power: "Crystal Physiology",
    desc: "Petrosapien from Petropia. Virtually indestructible crystal body that refracts energy into devastating beams.",
    color: "#00e5ff",
  },
  {
    emoji: "⚡",
    name: "XLR8",
    power: "Super Velocity",
    desc: "Kineceleran from Kinet. Moves at 500 mph, creating tornados from sheer speed alone.",
    color: "#76ff03",
  },
  {
    emoji: "👁️",
    name: "FOUR ARMS",
    power: "Enhanced Strength",
    desc: "Tetramand from Khoros. Four arms capable of lifting 100 tons. Shockwaves with a single clap.",
    color: "#d50000",
  },
];

export default function Home() {
  const webCanvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [activeAlien, setActiveAlien] = useState(0);
  const [omnitrixActive, setOmnitrixActive] = useState(false);

  // Spider Web background
  useSpiderWeb(webCanvasRef as React.RefObject<HTMLCanvasElement>);

  // Custom cursor
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top = e.clientY + "px";
      }
      if (cursorRingRef.current) {
        setTimeout(() => {
          if (cursorRingRef.current) {
            cursorRingRef.current.style.left = e.clientX + "px";
            cursorRingRef.current.style.top = e.clientY + "px";
          }
        }, 80);
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Auto-cycle alien
  useEffect(() => {
    const t = setInterval(() => {
      setActiveAlien((p) => (p + 1) % ALIENS.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const currentAlien = ALIENS[activeAlien];

  return (
    <>
      {/* Noise overlay */}
      <div className="noise" />

      {/* Custom cursor */}
      <div className="cursor" ref={cursorRef} />
      <div className="cursor-ring" ref={cursorRingRef} />

      {/* Global spider web */}
      <canvas id="web-canvas" ref={webCanvasRef} />

      {/* Navigation */}
      <nav>
        <a href="#" className="nav-logo">MECHANICA</a>
        <ul className="nav-links">
          <li><a href="#aliens">Aliens</a></li>
          <li><a href="#web">Abilities</a></li>
          <li><a href="#manifest">Manifest</a></li>
        </ul>
      </nav>

      {/* ================================================
          HERO SECTION
      ================================================ */}
      <section className="hero" id="hero">
        <div className="hero-left">
          <div className="hero-eyebrow animate-fade-up delay-1">
            <div className="hero-eyebrow-dot" />
            <span className="hero-eyebrow-text">Spider-Man × Ben 10 Universe</span>
          </div>

          <h1 className="hero-title animate-fade-up delay-2">
            <span className="accent">ALIEN</span><br />
            INSTINCT<br />
            <span className="red">SPIDER</span><br />
            MIND
          </h1>

          <p className="hero-description animate-fade-up delay-3">
            When alien technology fuses with spider instinct, something unprecedented is born.
            Ten transformations. Infinite webs. One universe where biology becomes architecture.
          </p>

          <div className="hero-actions animate-fade-up delay-4">
            <button
              className="btn-primary"
              onClick={() => {
                setOmnitrixActive(true);
                setTimeout(() => setOmnitrixActive(false), 1500);
                setActiveAlien((p) => (p + 1) % ALIENS.length);
              }}
            >
              Activate Omnitrix
            </button>
            <button className="btn-ghost">View Aliens</button>
          </div>
        </div>

        <div className="hero-right">
          {/* Hero Web background glow */}
          <div className="hero-web-bg">
            <svg width="100%" height="100%" viewBox="0 0 600 600">
              {Array.from({ length: 12 }).map((_, i) => (
                <line key={i}
                  x1="300" y1="300"
                  x2={300 + Math.cos((i / 12) * Math.PI * 2) * 280}
                  y2={300 + Math.sin((i / 12) * Math.PI * 2) * 280}
                  stroke="#00e676" strokeWidth="0.8"
                />
              ))}
              {[60, 120, 180, 240, 280].map((r) => (
                <circle key={r} cx="300" cy="300" r={r}
                  stroke="#00e676" strokeWidth="0.5" fill="none"
                  strokeDasharray="6 12"
                />
              ))}
            </svg>
          </div>

          <OmnitrixDial activeAlien={activeAlien} />

          {/* Active alien name */}
          <div style={{
            position: "absolute",
            bottom: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "14px",
              letterSpacing: "0.5em",
              color: "rgba(255,255,255,0.3)",
              marginBottom: "4px",
            }}>
              CURRENT FORM
            </div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "28px",
              letterSpacing: "0.1em",
              color: "#00e676",
              transition: "all 0.5s ease",
            }}>
              {currentAlien.name}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          {[
            { n: "10", l: "Alien Forms" },
            { n: "∞", l: "Web Combinations" },
            { n: "10B+", l: "Spider Neurons" },
          ].map((s, i) => (
            <>
              {i > 0 && <div key={`d${i}`} className="stat-divider" />}
              <div key={s.l} className="stat-item">
                <div className="stat-number">{s.n}</div>
                <div className="stat-label">{s.l}</div>
              </div>
            </>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator" style={{ right: "60px" }}>
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ================================================
          ALIENS SECTION
      ================================================ */}
      <section className="aliens-section" id="aliens">
        <div className="aliens-header">
          <div className="section-rule">
            <div className="section-rule-line" />
            <span className="section-rule-label">Omnitrix Database — Active Forms</span>
            <div className="section-rule-line" />
          </div>
          <h2 className="section-title">
            ALIEN<br /><span style={{ color: "#00e676" }}>ROSTER</span>
          </h2>
          <p className="section-subtitle">
            Each transformation is a complete biological overhaul. Ben's neural network rewrites itself every 10 seconds.
          </p>
        </div>

        <div className="aliens-grid">
          {ALIENS.map((alien, i) => (
            <div
              key={alien.name}
              className="alien-card"
              onClick={() => setActiveAlien(i)}
              style={{
                outline: activeAlien === i ? `1px solid ${alien.color}` : "none",
              }}
            >
              <div className="alien-number">0{i + 1}</div>
              <div className="alien-icon">{alien.emoji}</div>
              <div className="alien-name">{alien.name}</div>
              <div className="alien-power" style={{ color: alien.color }}>{alien.power}</div>
              <div className="alien-desc">{alien.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================
          WEB ABILITIES SECTION
      ================================================ */}
      <section className="web-section" id="web">
        <div className="web-content">
          <div>
            <div className="section-rule">
              <div className="section-rule-line" style={{ maxWidth: "40px" }} />
              <span className="section-rule-label">Spider Instinct Layer</span>
            </div>
            <h2 className="section-title">
              WEB<br /><span style={{ color: "#00e676" }}>ARCHITECT</span>
            </h2>
            <p className="section-subtitle" style={{ marginTop: "20px" }}>
              Peter Parker's enhanced spider-sense fused with Galvanic Mechamorph technology creates a new class of interaction architecture.
            </p>
          </div>

          <div className="web-features">
            {[
              {
                n: "01",
                title: "SPIDER SENSE",
                desc: "Precognitive danger detection merged with Omnitrix's alien biology scanner. Processes threats 11ms before conscious thought.",
              },
              {
                n: "02",
                title: "WEB FLUID 2.0",
                desc: "Biochemically engineered by Galvan Prime. Adapts viscosity in real-time based on structural requirements.",
              },
              {
                n: "03",
                title: "OMNITRIX LOCK",
                desc: "Ben's DNA-rewriting technology now enhanced with Peter's genetic memory. Transformations retain muscle memory.",
              },
              {
                n: "04",
                title: "NEURAL WEB",
                desc: "A 10-billion node network that perceives physics violations across multiple alien nervous systems simultaneously.",
              },
            ].map((f) => (
              <div key={f.n} className="web-feature">
                <div className="web-feature-num">{f.n}</div>
                <div>
                  <div className="web-feature-title">{f.title}</div>
                  <div className="web-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          TRANSFORMATION SECTION
      ================================================ */}
      <section className="transform-section">
        <div className="section-rule">
          <div className="section-rule-line" />
          <span className="section-rule-label">The Transformation Protocol</span>
          <div className="section-rule-line" />
        </div>
        <h2 className="section-title" style={{ marginBottom: "0" }}>
          HOW IT<br /><span style={{ color: "#00e676" }}>WORKS</span>
        </h2>

        <div className="transform-track">
          {[
            {
              n: "01", icon: "🧬", title: "DNA SCAN",
              desc: "The Omnitrix reads the visitor's interaction pattern. Every cursor movement, every pause — it's all biological data being catalogued.",
            },
            {
              n: "02", icon: "⚡", title: "NEURAL REWRITE",
              desc: "Spider-Man's enhanced nervous system rewrites the physical laws of the interface. Gravity bends. Webs grow. Materials mutate.",
            },
            {
              n: "03", icon: "🌀", title: "FORM LOCKED",
              desc: "The final form emerges. Neither alien nor human — something beyond categorization. A universe built from instinct and technology.",
            },
          ].map((s) => (
            <div key={s.n} className="transform-step">
              <div className="transform-step-num">{s.n}</div>
              <div className="transform-icon-wrapper">{s.icon}</div>
              <div className="transform-step-title">{s.title}</div>
              <div className="transform-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================
          MANIFEST SECTION
      ================================================ */}
      <section className="manifest-section" id="manifest">
        <div className="manifest-bg-text">MECHANICA</div>
        <div className="manifest-label">The Core Philosophy</div>
        <h2 className="manifest-quote">
          We don't build websites.<br />
          We engineer <em>living universes</em><br />
          from alien instinct.
        </h2>
        <p className="manifest-sub">
          MECHANICA exists at the intersection of Spider-Man's biological mastery and Ben 10's extraterrestrial engineering.
          This is not a portfolio. This is a civilization.
        </p>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-logo">MECHANICA</div>
        <div className="footer-copy">© 2026 — SPIDER-MAN × BEN 10 UNIVERSE</div>
        <div className="footer-copy">AWWWARDS NOMINEE 2026</div>
      </footer>
    </>
  );
}
