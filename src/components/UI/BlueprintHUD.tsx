"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";

export function BlueprintHUD() {
  const [mounted, setMounted] = useState(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  const springX = useSpring(cursorX, { stiffness: 300, damping: 30, mass: 0.2 });
  const springY = useSpring(cursorY, { stiffness: 300, damping: 30, mass: 0.2 });
  
  // Slower springs for trailing effect
  const trailX = useSpring(cursorX, { stiffness: 50, damping: 20 });
  const trailY = useSpring(cursorY, { stiffness: 50, damping: 20 });

  const xRef = useRef<HTMLSpanElement>(null);
  const yRef = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(springX, "change", (latest) => {
    if (xRef.current) xRef.current.textContent = `X: ${Math.round(latest)}`;
  });
  useMotionValueEvent(springY, "change", (latest) => {
    if (yRef.current) yRef.current.textContent = `Y: ${Math.round(latest)}`;
  });

  useEffect(() => { 
    setMounted(true); 
    // Initialize position after mount to avoid SSR window error
    cursorX.set(window.innerWidth / 2);
    cursorY.set(window.innerHeight / 2);

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX); 
      cursorY.set(e.clientY);
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
      overflow: 'hidden',
      mixBlendMode: 'multiply'
    }}>
      
      {/* 1. GLOBAL CAD CROSSHAIRS (Follows Mouse) */}
      <motion.div style={{
        position: 'absolute', top: 0, bottom: 0, left: springX, width: '1px',
        background: 'var(--crimson)', opacity: 0.4
      }} />
      <motion.div style={{
        position: 'absolute', left: 0, right: 0, top: springY, height: '1px',
        background: 'var(--crimson)', opacity: 0.4
      }} />
      
      {/* Ghost Trailing Crosshairs */}
      <motion.div style={{
        position: 'absolute', top: 0, bottom: 0, left: trailX, width: '1px',
        background: 'rgba(0, 150, 255, 0.3)'
      }} />
      <motion.div style={{
        position: 'absolute', left: 0, right: 0, top: trailY, height: '1px',
        background: 'rgba(0, 150, 255, 0.3)'
      }} />

      {/* Target Reticle at intersection */}
      <motion.div style={{
        position: 'absolute', left: springX, top: springY,
        width: '40px', height: '40px', x: '-50%', y: '-50%',
        border: '1px solid var(--crimson)', borderRadius: '50%',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}>
        <div style={{ width: '4px', height: '4px', background: 'var(--crimson)' }} />
        <div style={{ position: 'absolute', top: '-10px', left: '50%', width: '1px', height: '10px', background: 'var(--crimson)' }} />
        <div style={{ position: 'absolute', bottom: '-10px', left: '50%', width: '1px', height: '10px', background: 'var(--crimson)' }} />
        <div style={{ position: 'absolute', left: '-10px', top: '50%', width: '10px', height: '1px', background: 'var(--crimson)' }} />
        <div style={{ position: 'absolute', right: '-10px', top: '50%', width: '10px', height: '1px', background: 'var(--crimson)' }} />
      </motion.div>

      {/* Live Coordinate Tracker */}
      <motion.div style={{
        position: 'absolute', left: springX, top: springY,
        x: 25, y: 25, fontSize: '10px', fontWeight: 600, color: 'var(--crimson)',
        display: 'flex', flexDirection: 'column', gap: '2px'
      }}>
        <span ref={xRef}>X: 0</span>
        <span ref={yRef}>Y: 0</span>
      </motion.div>

      {/* 2. STATIC CORNER DATA BLOCKS */}
      {/* Top Left: System Status */}
      <div style={{ position: 'absolute', top: 40, left: 40, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.2em', opacity: 0.5 }}>TERMINAL // 01</div>
        <div style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '0.1em', lineHeight: 1 }}>
          PROJECT<br/><span className="text-crimson">MECHANICA</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <div style={{ width: '40px', height: '4px', background: 'var(--foreground)' }} />
          <div style={{ width: '10px', height: '4px', background: 'var(--crimson)' }} />
        </div>
      </div>

      {/* Top Right: Rotating Radar / Sensors */}
      <div style={{ position: 'absolute', top: 40, right: 40, display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '10px', letterSpacing: '0.1em' }}>
          <span style={{ opacity: 0.5 }}>SENSOR CORE</span>
          <span className="text-crimson">ACTIVE</span>
          <span style={{ marginTop: '10px' }}>BIO-SCAN: 99.8%</span>
        </div>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ width: '60px', height: '60px', border: '1px dashed var(--foreground)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <div style={{ width: '40px', height: '40px', border: '1px solid var(--crimson)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: 0, left: '50%', width: '1px', height: '30px', background: 'var(--crimson)' }} />
        </motion.div>
      </div>

      {/* Bottom Left: Japanese Vertical Typography */}
      <div style={{ position: 'absolute', bottom: 40, left: 40, display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
        <div className="text-jp" style={{ writingMode: 'vertical-rl', fontSize: '12vh', fontWeight: 900, lineHeight: 0.8, WebkitTextStroke: '1px var(--foreground)', color: 'transparent' }}>
          生体<span className="text-crimson" style={{ WebkitTextStroke: '0px', color: 'var(--crimson)' }}>機械</span>
        </div>
        <div className="text-jp" style={{ writingMode: 'vertical-rl', fontSize: '24px', fontWeight: 600, letterSpacing: '0.2em', opacity: 0.5 }}>
          次世代アーキテクチャ
        </div>
      </div>

      {/* Bottom Right: Dense Data Table */}
      <div style={{ position: 'absolute', bottom: 40, right: 40, maxWidth: '250px', fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ textAlign: 'justify', opacity: 0.6, lineHeight: 1.5 }}>
          WARNING: POINT CLOUD DENSITY EXCEEDS STANDARD PARAMETERS. THE BIOMECHANICAL CORE IS UNSTABLE. MAINTAIN TARGETING PROTOCOLS AT ALL TIMES.
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(17,17,17,0.2)', paddingTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>PARTICLE COUNT</span>
            <span className="text-crimson">16,384</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>REFRACTION INDEX</span>
            <span>1.450</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>DISPERSION</span>
            <span>CRITICAL</span>
          </div>
        </div>

        {/* Complex Barcode */}
        <div style={{ display: 'flex', gap: '2px', height: '20px', marginTop: '10px' }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} style={{ width: Math.random() > 0.5 ? '2px' : '4px', height: '100%', background: Math.random() > 0.9 ? 'var(--crimson)' : 'var(--foreground)' }} />
          ))}
        </div>
      </div>
      
      {/* 3. DIAGNOSTIC CENTER OVERLAY */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', border: '1px solid rgba(17,17,17,0.05)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '500px', height: '500px', border: '1px dashed rgba(255,0,60,0.1)', borderRadius: '50%' }} />
      </div>

    </div>
  );
}
