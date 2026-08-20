"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";

export function BlueprintHUD() {
  const cameraZ = useStore((state) => state.cameraZ);
  const cameraY = useStore((state) => state.cameraY);
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 100, // Stay on top of Canvas
      fontFamily: 'monospace',
      color: '#000000',
      border: '4px solid #000000', // Technical frame
      boxSizing: 'border-box'
    }}>
      
      {/* Corner Brackets */}
      <div style={{ position: 'absolute', top: 20, left: 20, borderTop: '2px solid black', borderLeft: '2px solid black', width: 20, height: 20 }} />
      <div style={{ position: 'absolute', top: 20, right: 20, borderTop: '2px solid black', borderRight: '2px solid black', width: 20, height: 20 }} />
      <div style={{ position: 'absolute', bottom: 20, left: 20, borderBottom: '2px solid black', borderLeft: '2px solid black', width: 20, height: 20 }} />
      <div style={{ position: 'absolute', bottom: 20, right: 20, borderBottom: '2px solid black', borderRight: '2px solid black', width: 20, height: 20 }} />

      {/* Top Bar Data */}
      <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '40px', fontSize: '12px', fontWeight: 'bold' }}>
        <span>SYS.V: 1.618</span>
        <span>ARCHIVE: MECHANICA</span>
        <span>STATUS: EXPLORING</span>
      </div>

      {/* Left Rulers & Coordinates */}
      <div style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', fontSize: '10px' }}>
        <span style={{ color: '#FF0000', fontWeight: 'bold' }}>Y-AXIS ALTITUDE</span>
        <span>{cameraY.toFixed(3)} m</span>
      </div>

      {/* Right Crosshair Scale */}
      <div style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} style={{ width: i === 5 ? 15 : 8, height: 1, background: '#000' }} />
        ))}
      </div>

      {/* Bottom Bar Coordinates */}
      <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '40px', fontSize: '12px', fontWeight: 'bold' }}>
        <span style={{ color: '#00FF00' }}>Z-AXIS DEPTH: {cameraZ.toFixed(3)} m</span>
        <span>COORD: {(cameraZ * 13.37).toFixed(1)} N, {(cameraY * -7.42).toFixed(1)} E</span>
      </div>
      
    </div>
  );
}
