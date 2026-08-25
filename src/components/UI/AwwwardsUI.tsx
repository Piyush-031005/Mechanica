"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function AwwwardsUI() {
  const [mounted, setMounted] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springX = useSpring(cursorX, { stiffness: 100, damping: 20, mass: 0.5 });
  const springY = useSpring(cursorY, { stiffness: 100, damping: 20, mass: 0.5 });
  
  useEffect(() => { 
    setMounted(true); 
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16); 
      cursorY.set(e.clientY - 16);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorX, cursorY]);
  
  if (!mounted) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none',
      zIndex: 100,
      color: 'var(--foreground)',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* Top Navigation / Data Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 1 }}
        style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', letterSpacing: '0.15em', fontWeight: 600, textTransform: 'uppercase' }}
      >
        <div style={{ display: 'flex', gap: '40px' }}>
          <div>
            <span style={{ opacity: 0.4 }}>SYS // </span>
            <span>MECHANICA</span>
          </div>
          <div>
            <span style={{ opacity: 0.4 }}>VER // </span>
            <span className="text-crimson">2.0.26</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', gap: '40px' }}>
          <div>
            <span style={{ opacity: 0.4 }}>MODE // </span>
            <span>LUMINOUS</span>
          </div>
          <div>
            <span style={{ opacity: 0.4 }}>STATUS // </span>
            <span className="text-crimson">ONLINE</span>
          </div>
        </div>
      </motion.div>

      {/* Massive Vertical Japanese Typography on the Left */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 1.5, ease: "easeOut" }}
        style={{ 
          position: 'absolute', 
          top: '20vh', 
          left: '40px',
          writingMode: 'vertical-rl',
          textOrientation: 'upright',
          fontSize: '12vh',
          fontWeight: 900,
          lineHeight: 0.8,
          color: 'var(--foreground)'
        }}
        className="text-jp"
      >
        未来の<span className="text-crimson">設計図</span>
      </motion.div>

      {/* Dynamic Crimson Cursor Tracker */}
      <motion.div 
        style={{ 
          x: springX, y: springY,
          position: 'absolute', top: 0, left: 0,
          width: '32px', height: '32px', 
          border: '1px solid var(--crimson)', 
          borderRadius: '50%',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          mixBlendMode: 'difference' // Interacts beautifully with the luminous background
        }}
      >
        <div style={{ width: '4px', height: '4px', background: 'var(--crimson)', borderRadius: '50%' }} />
      </motion.div>

      {/* Right Aligned Technical Data Block */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 1.5, ease: "easeOut" }}
        style={{ position: 'absolute', top: '25vh', right: '40px', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <div style={{ fontSize: '11px', opacity: 0.6, lineHeight: 1.6, textAlign: 'justify' }}>
          OBSERVATION NOTES: ORGANIC SYSTEMS ARE NOW SCANNED, INDEXED, AND TRANSFORMED INTO SIGNAL. BETWEEN INSTINCT AND SYSTEM, LIGHT AND DATA, EVERY STRUCTURE HOLDS INFORMATION.
        </div>
        
        {/* Technical Data Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px', letterSpacing: '0.1em' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(17,17,17,0.1)', paddingBottom: '4px' }}>
            <span>AESTHETIC</span>
            <span className="text-crimson">DIGITAL ECOLOGY</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(17,17,17,0.1)', paddingBottom: '4px' }}>
            <span>PROTOCOL</span>
            <span>AWWWARDS</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(17,17,17,0.1)', paddingBottom: '4px' }}>
            <span>RENDER</span>
            <span>WEBGL + R3F</span>
          </div>
        </div>

        {/* Abstract Barcode */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', opacity: 0.8 }}>
          <svg width="120" height="20" viewBox="0 0 120 20">
            <rect x="0" y="0" width="4" height="20" fill="var(--foreground)" />
            <rect x="6" y="0" width="2" height="20" fill="var(--foreground)" />
            <rect x="12" y="0" width="6" height="20" fill="var(--foreground)" />
            <rect x="22" y="0" width="2" height="20" fill="var(--foreground)" />
            <rect x="28" y="0" width="8" height="20" fill="var(--crimson)" />
            <rect x="40" y="0" width="4" height="20" fill="var(--foreground)" />
            <rect x="48" y="0" width="2" height="20" fill="var(--foreground)" />
            <rect x="52" y="0" width="10" height="20" fill="var(--foreground)" />
            <rect x="64" y="0" width="2" height="20" fill="var(--foreground)" />
            <rect x="70" y="0" width="6" height="20" fill="var(--foreground)" />
            <rect x="80" y="0" width="4" height="20" fill="var(--foreground)" />
            <rect x="88" y="0" width="8" height="20" fill="var(--crimson)" />
            <rect x="100" y="0" width="2" height="20" fill="var(--foreground)" />
            <rect x="106" y="0" width="4" height="20" fill="var(--foreground)" />
            <rect x="114" y="0" width="6" height="20" fill="var(--foreground)" />
          </svg>
        </div>
      </motion.div>

      {/* Bottom Footer */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
      >
        <div style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 0.9 }}>
          01 <span style={{ opacity: 0.3 }}>/ 04</span>
        </div>
        <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em' }}>
          SCROLL TO EXPLORE ↓
        </div>
      </motion.div>
    </div>
  );
}
