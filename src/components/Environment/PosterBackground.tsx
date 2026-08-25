"use client";

import { motion } from "framer-motion";

export function PosterBackground() {
  return (
    <>
      <div className="noise-overlay" />
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        background: 'var(--background)',
        overflow: 'hidden'
      }}>
        {/* Dynamic Luminous Gradient - Enhanced opacity and colors */}
        <motion.div 
          animate={{
            background: [
              "radial-gradient(circle at 20% 30%, rgba(0,240,255,0.2) 0%, transparent 60%)",
              "radial-gradient(circle at 80% 70%, rgba(255,0,60,0.15) 0%, transparent 60%)",
              "radial-gradient(circle at 50% 50%, rgba(0,240,255,0.2) 0%, transparent 60%)",
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', inset: 0 }}
        />

        {/* Main Grid SVG - Increased Opacity for Visibility */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <defs>
            <pattern id="smallGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 150, 255, 0.4)" strokeWidth="0.5"/>
            </pattern>
            <pattern id="largeGrid" width="200" height="200" patternUnits="userSpaceOnUse">
              <rect width="200" height="200" fill="url(#smallGrid)"/>
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(0, 200, 255, 0.6)" strokeWidth="1"/>
              <circle cx="0" cy="0" r="3" fill="var(--crimson)" opacity="0.8" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#largeGrid)" />
          
          {/* Ethereal Sun */}
    <div style={{
      position: 'fixed', inset: 0, zIndex: -1,
      background: 'var(--background)',
      overflow: 'hidden'
    }}>
      {/* Heavy paper texture noise */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.4, mixBlendMode: 'multiply',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      {/* Faint engineer grid (ink style) */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--blueprint-grid) 1px, transparent 1px), linear-gradient(90deg, var(--blueprint-grid) 1px, transparent 1px)',
        backgroundSize: '40px 40px', opacity: 0.6
      }} />
      
      {/* Central blueprint alignment axes */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', background: 'var(--blueprint-line)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', background: 'var(--blueprint-line)' }} />
      
      {/* Vague faded circular ink diagrams in the background */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80vh', height: '80vh', border: '1px solid var(--blueprint-grid)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '70vh', height: '70vh', border: '1px dashed var(--blueprint-line)', borderRadius: '50%' }} />
    </div>
  );
}
