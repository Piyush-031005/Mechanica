"use client";

import { useStore, ThemeMode } from "@/store/useStore";
import { useEffect, useState } from "react";

// Theme Palette Definitions
const THEMES = {
  CYANOTYPE: {
    bg: "transparent",
    primary: "#ffffff",
    accent: "#00ffff",
    border: "#ffffff",
    paper: "rgba(0, 0, 100, 0.1)"
  },
  DRAFT: {
    bg: "transparent",
    primary: "#050505",
    accent: "#ff0000",
    border: "#111111",
    paper: "rgba(240, 235, 220, 0.1)"
  },
  CYBER: {
    bg: "transparent",
    primary: "#00ffcc",
    accent: "#ff00ff",
    border: "#333333",
    paper: "rgba(0, 0, 0, 0.5)"
  }
};

export function BlueprintHUD() {
  const cameraZ = useStore((state) => state.cameraZ);
  const cameraY = useStore((state) => state.cameraY);
  const activeTheme = useStore((state) => state.activeTheme);
  const cycleTheme = useStore((state) => state.cycleTheme);
  
  const [mounted, setMounted] = useState(false);
  const [hexDump, setHexDump] = useState("");
  
  useEffect(() => {
    setMounted(true);
    
    // Glitching Hex Data Dump
    const interval = setInterval(() => {
      let dump = "";
      for (let i=0; i<8; i++) {
        dump += "0x" + Math.floor(Math.random()*16777215).toString(16).toUpperCase().padStart(4, '0') + " ";
      }
      setHexDump(dump);
    }, 150);
    
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const t = THEMES[activeTheme];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 100,
      fontFamily: 'monospace',
      color: t.primary,
      boxSizing: 'border-box',
      padding: '2vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: t.bg
    }}>
      
      {/* Outer Technical Frame */}
      <div style={{
        position: 'absolute',
        top: '20px', left: '20px', right: '20px', bottom: '20px',
        border: `2px solid ${t.border}`,
        pointerEvents: 'none'
      }} />

      {/* Inner Technical Frame */}
      <div style={{
        position: 'absolute',
        top: '30px', left: '30px', right: '30px', bottom: '30px',
        border: `1px solid ${t.border}`,
        opacity: 0.5,
        pointerEvents: 'none'
      }} />

      {/* Corner Crosshairs */}
      <div style={{ position: 'absolute', top: 10, left: 10, width: 30, height: 30, borderTop: `4px solid ${t.primary}`, borderLeft: `4px solid ${t.primary}` }} />
      <div style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderTop: `4px solid ${t.primary}`, borderRight: `4px solid ${t.primary}` }} />
      <div style={{ position: 'absolute', bottom: 10, left: 10, width: 30, height: 30, borderBottom: `4px solid ${t.primary}`, borderLeft: `4px solid ${t.primary}` }} />
      <div style={{ position: 'absolute', bottom: 10, right: 10, width: 30, height: 30, borderBottom: `4px solid ${t.primary}`, borderRight: `4px solid ${t.primary}` }} />

      {/* TOP SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
        
        {/* Left: Barcode & System Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase' }}>
            MECHANICA
          </div>
          
          {/* Fake Barcode */}
          <div style={{ display: 'flex', gap: '2px', height: '30px', alignItems: 'flex-end' }}>
            {Array.from({length: 20}).map((_, i) => (
              <div key={i} style={{ width: Math.random() > 0.5 ? '2px' : '6px', height: Math.random() > 0.2 ? '100%' : '70%', background: t.primary }} />
            ))}
          </div>
          <div style={{ fontSize: '10px', letterSpacing: '2px' }}>SYS.V: 1.618 // 2026</div>
        </div>

        {/* Center: Active Theme Glitch Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '10px', color: t.accent }}>THEME.OVERRIDE</div>
          <button 
            onClick={cycleTheme}
            style={{
              pointerEvents: 'auto',
              background: 'transparent',
              border: `1px solid ${t.primary}`,
              color: t.primary,
              padding: '5px 15px',
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '5px',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
          >
            [{activeTheme}]
          </button>
        </div>

        {/* Right: Rotating SVG Mandala */}
        <div style={{ width: '80px', height: '80px', animation: 'spin 20s linear infinite' }}>
          <svg viewBox="0 0 100 100" fill="none" stroke={t.primary} strokeWidth="1">
            <circle cx="50" cy="50" r="45" strokeDasharray="5 5" />
            <circle cx="50" cy="50" r="35" />
            <circle cx="50" cy="50" r="25" strokeDasharray="2 10" strokeWidth="4" />
            <path d="M50 5 L50 95 M5 50 L95 50" />
            <path d="M18 18 L82 82 M18 82 L82 18" stroke={t.accent} />
          </svg>
        </div>
      </div>

      {/* MIDDLE SECTION: Targeting & Data */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', pointerEvents: 'none' }}>
        
        {/* Center Reticle */}
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" stroke={t.primary} strokeWidth="1" style={{ opacity: 0.3 }}>
          <circle cx="100" cy="100" r="90" strokeDasharray="4 8" />
          <circle cx="100" cy="100" r="60" />
          <path d="M100 0 L100 200 M0 100 L200 100" strokeDasharray="20 180" />
          <circle cx="100" cy="100" r="2" fill={t.accent} stroke="none" />
        </svg>

        {/* Live Hex Dump */}
        <div style={{ position: 'absolute', right: '40px', top: '40%', width: '150px', fontSize: '9px', opacity: 0.7, wordWrap: 'break-word', color: t.accent }}>
          PROCESSING...<br/>
          {hexDump}
        </div>
        
        {/* Left Coordinates */}
        <div style={{ position: 'absolute', left: '40px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ borderBottom: `1px solid ${t.border}`, paddingBottom: '2px' }}>Y-ALTITUDE</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{cameraY.toFixed(2)}m</div>
          
          <div style={{ borderBottom: `1px solid ${t.border}`, paddingBottom: '2px', marginTop: '10px' }}>Z-DEPTH</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{cameraZ.toFixed(2)}m</div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10 }}>
        
        {/* Left Bottom Data */}
        <div style={{ fontSize: '10px', display: 'flex', gap: '20px' }}>
          <div>
            <div style={{ color: t.accent }}>ANC STATUS</div>
            <div>RESISTANT: 98%</div>
          </div>
          <div>
            <div style={{ color: t.accent }}>AUDIO FREQ</div>
            <div>20 - 20000Hz</div>
          </div>
        </div>

        {/* Right Bottom Fake Graph */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px' }}>
          {Array.from({length: 12}).map((_, i) => {
            const h = Math.abs(Math.sin((cameraZ + cameraY + i) * 0.5)) * 100;
            return (
              <div key={i} style={{ width: '8px', height: `${h}%`, background: i % 4 === 0 ? t.accent : t.primary }} />
            );
          })}
        </div>
      </div>
      
      {/* Global CSS for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
