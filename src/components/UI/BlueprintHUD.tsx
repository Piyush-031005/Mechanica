"use client";

import { useStore, THEME_COLORS } from "@/store/useStore";
import { useEffect, useState } from "react";

// Precision crosshair at center of screen
function Reticle({ color }: { color: string }) {
  return (
    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 40, height: 40, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: '50%', left: 0, width: '35%', height: 1, background: color, opacity: 0.4 }} />
      <div style={{ position: 'absolute', top: '50%', right: 0, width: '35%', height: 1, background: color, opacity: 0.4 }} />
      <div style={{ position: 'absolute', left: '50%', top: 0, height: '35%', width: 1, background: color, opacity: 0.4 }} />
      <div style={{ position: 'absolute', left: '50%', bottom: 0, height: '35%', width: 1, background: color, opacity: 0.4 }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 5, height: 5, border: `1px solid ${color}`, borderRadius: '50%', opacity: 0.6 }} />
    </div>
  );
}

export function BlueprintHUD() {
  const cameraZ = useStore((s) => s.cameraZ);
  const cameraY = useStore((s) => s.cameraY);
  const activeTheme = useStore((s) => s.activeTheme);
  const cycleTheme = useStore((s) => s.cycleTheme);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const t = THEME_COLORS[activeTheme];
  const c = t.edge; // primary color

  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none',
      zIndex: 100,
      fontFamily: '"Courier New", Courier, monospace',
    }}>
      {/* ── OUTER FRAME (4 corners only) ─────────────────────────── */}
      {[
        { top: 16, left: 16, borderTop: `1px solid ${c}`, borderLeft: `1px solid ${c}` },
        { top: 16, right: 16, borderTop: `1px solid ${c}`, borderRight: `1px solid ${c}` },
        { bottom: 16, left: 16, borderBottom: `1px solid ${c}`, borderLeft: `1px solid ${c}` },
        { bottom: 16, right: 16, borderBottom: `1px solid ${c}`, borderRight: `1px solid ${c}` },
      ].map((style, i) => (
        <div key={i} style={{ position: 'absolute', width: 24, height: 24, opacity: 0.5, ...style }} />
      ))}

      {/* ── TOP LEFT: Project name ────────────────────────────────── */}
      <div style={{ position: 'absolute', top: 24, left: 32, color: c }}>
        <div style={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 4, opacity: 0.9 }}>MECHANICA</div>
        <div style={{ fontSize: 9, letterSpacing: 2, opacity: 0.4, marginTop: 2 }}>ARCHIVE // INTERACTIVE BLUEPRINT</div>
      </div>

      {/* ── TOP RIGHT: Theme toggle ───────────────────────────────── */}
      <div style={{ position: 'absolute', top: 24, right: 32, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <button
          onClick={cycleTheme}
          style={{
            pointerEvents: 'auto',
            background: 'transparent',
            color: c,
            border: `1px solid ${c}`,
            padding: '3px 10px',
            fontFamily: 'inherit',
            fontSize: 10,
            letterSpacing: 3,
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
        >
          [ {activeTheme} ]
        </button>
      </div>

      {/* ── CENTER RETICLE ─────────────────────────────────────────── */}
      <Reticle color={c} />

      {/* ── BOTTOM LEFT: Telemetry data ───────────────────────────── */}
      <div style={{ position: 'absolute', bottom: 24, left: 32, color: c, opacity: 0.55 }}>
        <div style={{ fontSize: 9, letterSpacing: 2, marginBottom: 3 }}>TELEMETRY</div>
        <div style={{ fontSize: 11, letterSpacing: 1 }}>
          Y <span style={{ opacity: 0.5 }}>//</span> {cameraY.toFixed(3)}
        </div>
        <div style={{ fontSize: 11, letterSpacing: 1 }}>
          Z <span style={{ opacity: 0.5 }}>//</span> {cameraZ.toFixed(3)}
        </div>
      </div>

      {/* ── BOTTOM RIGHT: Build info ──────────────────────────────── */}
      <div style={{ position: 'absolute', bottom: 24, right: 32, color: c, opacity: 0.4, textAlign: 'right' }}>
        <div style={{ fontSize: 9, letterSpacing: 2 }}>BUILD 2026.08</div>
        <div style={{ fontSize: 9, letterSpacing: 1, marginTop: 2 }}>SCROLL TO DESCEND</div>
      </div>
    </div>
  );
}
