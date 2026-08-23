"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function AwwwardsUI() {
  const [mounted, setMounted] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springX = useSpring(cursorX, { stiffness: 150, damping: 25, mass: 0.5 });
  const springY = useSpring(cursorY, { stiffness: 150, damping: 25, mass: 0.5 });
  
  useEffect(() => { 
    setMounted(true); 
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 20); // offset by half the cursor size
      cursorY.set(e.clientY - 20);
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
      color: '#ffffff', // White text for dark blueprint background
      fontFamily: '"Michroma", "Inter", sans-serif',
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
          <span>NEVERA</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ opacity: 0.5 }}>STATUS // </span>
          <span style={{ color: '#00f0ff' }}>365 DAYS</span>
        </div>
      </div>

      {/* Dynamic Cursor Tracker */}
      <motion.div 
        style={{ 
          x: springX, y: springY,
          position: 'absolute', top: 0, left: 0,
          width: '40px', height: '40px', 
          border: '1px solid rgba(0, 240, 255, 0.4)', 
          borderRadius: '50%',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}
      >
        <div style={{ width: '4px', height: '4px', background: '#00f0ff', borderRadius: '50%', boxShadow: '0 0 10px #00f0ff' }} />
      </motion.div>

      {/* Bottom Bar / Technical Data Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', opacity: 0.9, fontSize: '11px', letterSpacing: '0.1em' }}>
        <div style={{ maxWidth: '300px', fontSize: '10px', opacity: 0.7, lineHeight: 1.5 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.
        </div>
        
        {/* Technical Table mimicking the reference poster */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '350px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>
            <span>DataGen</span>
            <span>DYNAMIC</span>
            <span>TCH</span>
            <span>TS26</span>
            <span>2026</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>
            <span>Humanoid</span>
            <span></span>
            <span>[ + ]</span>
            <span>Ultra</span>
            <span>[ - ]</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>
            <span>7TS26P8Q2R6X1A9B4</span>
            <span></span>
            <span>[ - ]</span>
            <span>DEV</span>
            <span>[ + ]</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.05em' }}>HYDROCARBON</span>
              <span style={{ fontSize: '14px', color: '#00f0ff', fontWeight: 600 }}>SYSTM</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#00f0ff' }}>FUEL</span>
              <span style={{ fontSize: '18px', color: '#ffffff', fontWeight: 700 }}>90,625</span>
            </div>
          </div>

          {/* Barcode Element */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px', opacity: 0.8 }}>
            <svg width="120" height="30" viewBox="0 0 120 30">
              <rect x="0" y="0" width="4" height="30" fill="#fff" />
              <rect x="6" y="0" width="2" height="30" fill="#fff" />
              <rect x="12" y="0" width="6" height="30" fill="#fff" />
              <rect x="22" y="0" width="2" height="30" fill="#fff" />
              <rect x="28" y="0" width="8" height="30" fill="#fff" />
              <rect x="40" y="0" width="4" height="30" fill="#fff" />
              <rect x="48" y="0" width="2" height="30" fill="#fff" />
              <rect x="52" y="0" width="10" height="30" fill="#fff" />
              <rect x="64" y="0" width="2" height="30" fill="#fff" />
              <rect x="70" y="0" width="6" height="30" fill="#fff" />
              <rect x="80" y="0" width="4" height="30" fill="#fff" />
              <rect x="88" y="0" width="8" height="30" fill="#fff" />
              <rect x="100" y="0" width="2" height="30" fill="#fff" />
              <rect x="106" y="0" width="4" height="30" fill="#fff" />
              <rect x="114" y="0" width="6" height="30" fill="#fff" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
