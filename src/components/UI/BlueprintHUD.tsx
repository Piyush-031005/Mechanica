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

      {/* 3. DIAGNOSTIC CENTER OVERLAY */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', border: '1px solid rgba(17,17,17,0.05)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '500px', height: '500px', border: '1px dashed rgba(255,0,60,0.1)', borderRadius: '50%' }} />
      </div>

    </div>
  );
}
