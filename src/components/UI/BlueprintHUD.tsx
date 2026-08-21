"use client";

import { useStore, THEME_COLORS } from "@/store/useStore";
import { useEffect, useState } from "react";

// Blueprint style grid and crosshairs
function BlueprintGrid({ color }: { color: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.1, zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundSize: '40px 40px', backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)` }} />
      <div style={{ position: 'absolute', inset: 0, backgroundSize: '200px 200px', backgroundImage: `linear-gradient(to right, ${color} 2px, transparent 2px), linear-gradient(to bottom, ${color} 2px, transparent 2px)` }} />
    </div>
  );
}

// Dimensional lines (like a CAD drawing)
function DimensionLine({ width, top, left, color, label }: any) {
  return (
    <div style={{ position: 'absolute', top, left, width, height: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ color, fontSize: 8, fontFamily: 'monospace', background: 'transparent' }}>{label}</div>
      <div style={{ width: '100%', height: 1, background: color, position: 'relative', marginTop: 2 }}>
        <div style={{ position: 'absolute', left: 0, top: -4, width: 1, height: 9, background: color }} />
        <div style={{ position: 'absolute', right: 0, top: -4, width: 1, height: 9, background: color }} />
      </div>
    </div>
  );
}

// Circular technical dials
function TechnicalDial({ color, size, top, left, rotation = 0 }: any) {
  return (
    <div style={{ position: 'absolute', top, left, width: size, height: size, border: `1px solid ${color}`, borderRadius: '50%', transform: `rotate(${rotation}deg)` }}>
      <div style={{ position: 'absolute', inset: '10%', border: `1px dashed ${color}`, borderRadius: '50%' }} />
      <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: 1, background: color }} />
      <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: 1, background: color }} />
      <div style={{ position: 'absolute', top: '10%', left: '50%', width: 4, height: 4, background: color, transform: 'translate(-50%, -50%)', borderRadius: '50%' }} />
    </div>
  );
}

// Esoteric geometry overlay (Alchemical vibe)
function EsotericCircle({ color, size, right, bottom }: any) {
  return (
    <div style={{ position: 'absolute', right, bottom, width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', width: '100%', height: '100%', border: `1px solid ${color}`, borderRadius: '50%', opacity: 0.5 }} />
      <div style={{ position: 'absolute', width: '80%', height: '80%', border: `1px solid ${color}`, transform: 'rotate(45deg)', opacity: 0.5 }} />
      <div style={{ position: 'absolute', width: '80%', height: '80%', border: `1px solid ${color}`, opacity: 0.5 }} />
      <div style={{ position: 'absolute', width: '60%', height: '60%', border: `1px solid ${color}`, borderRadius: '50%', opacity: 0.5 }} />
      <div style={{ position: 'absolute', top: '50%', left: '-20%', width: '140%', height: 1, background: color, opacity: 0.3 }} />
      <div style={{ position: 'absolute', left: '50%', top: '-20%', height: '140%', width: 1, background: color, opacity: 0.3 }} />
    </div>
  );
}

export function BlueprintHUD() {
  const cameraZ = useStore((state) => state.cameraZ);
  const cameraY = useStore((state) => state.cameraY);
  const activeTheme = useStore((state) => state.activeTheme);
  const cycleTheme = useStore((state) => state.cycleTheme);
  
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTime(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const t = THEME_COLORS[activeTheme];

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      pointerEvents: 'none',
      zIndex: 100,
      fontFamily: 'monospace',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      
      <BlueprintGrid color={t.edge} />

      {/* Frame / Borders */}
      <div style={{ position: 'absolute', inset: 20, border: `1px solid ${t.edge}`, opacity: 0.5 }} />
      <div style={{ position: 'absolute', inset: 24, border: `1px solid ${t.edge}`, opacity: 0.2 }} />

      {/* Corner crosshairs */}
      <div style={{ position: 'absolute', top: 15, left: 15, width: 10, height: 10, borderTop: `1px solid ${t.edge}`, borderLeft: `1px solid ${t.edge}` }} />
      <div style={{ position: 'absolute', top: 15, right: 15, width: 10, height: 10, borderTop: `1px solid ${t.edge}`, borderRight: `1px solid ${t.edge}` }} />
      <div style={{ position: 'absolute', bottom: 15, left: 15, width: 10, height: 10, borderBottom: `1px solid ${t.edge}`, borderLeft: `1px solid ${t.edge}` }} />
      <div style={{ position: 'absolute', bottom: 15, right: 15, width: 10, height: 10, borderBottom: `1px solid ${t.edge}`, borderRight: `1px solid ${t.edge}` }} />

      {/* Top Left: Title & Math Data */}
      <div style={{ position: 'absolute', top: 40, left: 40, color: t.edge }}>
        <div style={{ fontSize: 24, fontWeight: 'bold', letterSpacing: '4px' }}>MECHANICA.SYS</div>
        <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}>AESTHETICS // HYBRID BLUEPRINT // OCCULT.GEOMETRY</div>
        <div style={{ fontSize: 10, marginTop: 12, opacity: 0.5 }}>
          f(x) = ∫ e^(-x^2) dx<br/>
          ∇ × E = -∂B/∂t<br/>
          T = (timestamp: {time})
        </div>
      </div>

      {/* Dimensional Lines */}
      <DimensionLine width={200} top={40} left={300} color={t.edge} label="W_AXIS: 24.004 mm" />
      <DimensionLine width={150} top={120} left={40} color={t.edge} label="RAD_01: 1.618 (PHI)" />

      {/* Top Right: Theme Control & Esoteric Elements */}
      <div style={{ position: 'absolute', top: 40, right: 40, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', color: t.edge }}>
        <TechnicalDial color={t.edge} size={60} top={0} left={-80} rotation={(time / 20) % 360} />
        <button
          onClick={cycleTheme}
          style={{
            pointerEvents: 'auto',
            background: 'transparent',
            color: t.edge,
            border: `1px solid ${t.edge}`,
            padding: '4px 12px',
            fontFamily: 'monospace',
            fontSize: 12,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
        >
          [ {activeTheme} ]
        </button>
        <div style={{ fontSize: 10, marginTop: 8, opacity: 0.5, textAlign: 'right' }}>
          DIMENSION_OVERRIDE<br/>
          ENGAGED
        </div>
      </div>

      {/* Esoteric Geometry (Bottom Right) */}
      <EsotericCircle color={t.edge} size={300} right={-50} bottom={-50} />
      
      {/* Esoteric Geometry (Center Left Background) */}
      <div style={{ position: 'absolute', top: '50%', left: -100, transform: 'translateY(-50%)', opacity: 0.1 }}>
        <EsotericCircle color={t.edge} size={600} right={0} bottom={0} />
      </div>

      {/* Bottom Center: Telemetry (Y and Z axes) */}
      <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 60, color: t.edge }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 4 }}>Y_ALTITUDE</div>
          <div style={{ fontSize: 24, letterSpacing: '2px' }}>{cameraY.toFixed(3)}</div>
        </div>
        
        {/* Reticle center */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: 40 }}>
          <div style={{ width: 1, height: 40, background: t.edge, opacity: 0.5 }} />
          <div style={{ height: 1, width: 40, background: t.edge, opacity: 0.5, position: 'absolute' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', border: `1px solid ${t.edge}` }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 10, opacity: 0.5, marginBottom: 4 }}>Z_DEPTH</div>
          <div style={{ fontSize: 24, letterSpacing: '2px' }}>{cameraZ.toFixed(3)}</div>
        </div>
      </div>

      {/* Math block bottom left */}
      <div style={{ position: 'absolute', bottom: 40, left: 40, color: t.edge, fontSize: 10, opacity: 0.6, display: 'flex', gap: 20 }}>
        <div>
          v = v_0 + at<br/>
          E = mc^2<br/>
          λ = h / p
        </div>
        <div style={{ borderLeft: `1px solid ${t.edge}`, paddingLeft: 10 }}>
          STATUS: ONLINE<br/>
          ORBIT: SYNCHRONIZED<br/>
          GRAVITY: 9.81 m/s²
        </div>
      </div>
    </div>
  );
}
