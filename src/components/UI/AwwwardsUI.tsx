"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function AwwwardsUI() {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => { 
    setMounted(true); 
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  
  if (!mounted) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none',
      zIndex: 100,
      color: '#111111', // Black text for light background
      fontFamily: '"Inter", sans-serif',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9, fontSize: '11px', letterSpacing: '0.2em', fontWeight: 600 }}>
        <div>
          <span style={{ opacity: 0.5 }}>DATE. // </span>
          <span>2.3.2026</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ opacity: 0.5 }}>PROJECT // </span>
          <span>THE LOOP</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ opacity: 0.5 }}>STATUS // </span>
          <span style={{ color: '#ff5500' }}>365 DAYS</span>
        </div>
      </div>

      {/* Dynamic Cursor Tracker */}
      <motion.div 
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: "spring", stiffness: 150, damping: 25, mass: 0.5 }}
        style={{ 
          position: 'absolute', top: -20, left: -20,
          width: '40px', height: '40px', 
          border: '1px solid rgba(17,17,17,0.3)', 
          borderRadius: '50%',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}
      >
        <div style={{ width: '4px', height: '4px', background: '#111111', borderRadius: '50%' }} />
      </motion.div>

      {/* Bottom Bar / Technical Data Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', opacity: 0.9, fontSize: '11px', letterSpacing: '0.1em' }}>
        <div style={{ maxWidth: '300px', fontSize: '10px', opacity: 0.7, lineHeight: 1.5 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.
        </div>
        
        {/* Technical Table mimicking the reference poster */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '350px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #111111', paddingBottom: '4px' }}>
            <span>DataGen</span>
            <span>DYNAMIC</span>
            <span>TCH</span>
            <span>TS26</span>
            <span>2026</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #111111', paddingBottom: '4px' }}>
            <span>Humanoid</span>
            <span></span>
            <span>[ + ]</span>
            <span>Ultra</span>
            <span>[ - ]</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #111111', paddingBottom: '4px' }}>
            <span>7TS26P8Q2R6X1A9B4</span>
            <span></span>
            <span>[ - ]</span>
            <span>DEV</span>
            <span>[ + ]</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.05em' }}>HYDROCARBON</span>
              <span style={{ fontSize: '14px', color: '#ff5500', fontWeight: 600 }}>SYSTM</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#6eb5ff' }}>FUEL</span>
              <span style={{ fontSize: '18px', color: '#ff5500', fontWeight: 700 }}>90,625</span>
            </div>
          </div>

          {/* Barcode Element */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px', opacity: 0.8 }}>
            <svg width="120" height="30" viewBox="0 0 120 30">
              <rect x="0" y="0" width="4" height="30" fill="#111" />
              <rect x="6" y="0" width="2" height="30" fill="#111" />
              <rect x="12" y="0" width="6" height="30" fill="#111" />
              <rect x="22" y="0" width="2" height="30" fill="#111" />
              <rect x="28" y="0" width="8" height="30" fill="#111" />
              <rect x="40" y="0" width="4" height="30" fill="#111" />
              <rect x="48" y="0" width="2" height="30" fill="#111" />
              <rect x="52" y="0" width="10" height="30" fill="#111" />
              <rect x="64" y="0" width="2" height="30" fill="#111" />
              <rect x="70" y="0" width="6" height="30" fill="#111" />
              <rect x="80" y="0" width="4" height="30" fill="#111" />
              <rect x="88" y="0" width="8" height="30" fill="#111" />
              <rect x="100" y="0" width="2" height="30" fill="#111" />
              <rect x="106" y="0" width="4" height="30" fill="#111" />
              <rect x="114" y="0" width="6" height="30" fill="#111" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
