"use client";

import { motion } from "framer-motion";

export function PosterBackground() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      background: 'var(--background)',
      overflow: 'hidden'
    }}>
      {/* Dynamic Luminous Gradient */}
      <motion.div 
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, rgba(0,240,255,0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 70%, rgba(255,0,60,0.04) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 50%, rgba(0,240,255,0.08) 0%, transparent 50%)",
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Main Grid SVG */}
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="smallGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--blueprint-grid)" strokeWidth="0.5"/>
          </pattern>
          <pattern id="largeGrid" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect width="200" height="200" fill="url(#smallGrid)"/>
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="var(--blueprint-line)" strokeWidth="1"/>
            <circle cx="0" cy="0" r="3" fill="var(--crimson)" opacity="0.5" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#largeGrid)" />
        
        {/* Ethereal Sun */}
        <circle cx="50%" cy="50%" r="35%" fill="rgba(255, 0, 60, 0.02)" />
        
        {/* Technical Rings */}
        <circle cx="50%" cy="50%" r="35%" fill="none" stroke="var(--blueprint-line)" strokeWidth="1" strokeDasharray="4 16" />
        <circle cx="50%" cy="50%" r="40%" fill="none" stroke="var(--blueprint-grid)" strokeWidth="0.5" />
        
        {/* Japanese Watermark typography fading into grid */}
        <text x="50%" y="50%" fontSize="20vw" fill="rgba(0, 150, 255, 0.02)" textAnchor="middle" dominantBaseline="central" fontWeight="900" className="text-jp" style={{ writingMode: 'vertical-rl' }}>
          生態系
        </text>
      </svg>

      {/* Corner Registration Marks */}
      <div style={{ position: 'absolute', top: 40, left: 40, width: 40, height: 40, borderTop: '2px solid var(--crimson)', borderLeft: '2px solid var(--crimson)' }} />
      <div style={{ position: 'absolute', top: 40, right: 40, width: 40, height: 40, borderTop: '2px solid var(--crimson)', borderRight: '2px solid var(--crimson)' }} />
      <div style={{ position: 'absolute', bottom: 40, left: 40, width: 40, height: 40, borderBottom: '2px solid var(--crimson)', borderLeft: '2px solid var(--crimson)' }} />
      <div style={{ position: 'absolute', bottom: 40, right: 40, width: 40, height: 40, borderBottom: '2px solid var(--crimson)', borderRight: '2px solid var(--crimson)' }} />
    </div>
  );
}
