"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// --- PURE CSS / SVG TOP-QUALITY COMPONENTS ---

function AnimatedOmnitrix({ stage }: { stage: number }) {
  // A high-quality vector recreation of the Omnitrix dial.
  // We use concentric rotating rings and the classic hourglass shape.
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ 
        scale: stage >= 1 ? 1.5 : 1, 
        opacity: 1,
        filter: stage >= 1 ? "brightness(1.5) drop-shadow(0 0 20px #00ff33)" : "brightness(1) drop-shadow(0 0 0px #00ff33)"
      }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "absolute", zIndex: 1, width: 200, height: 200 }}
    >
      <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00ff33" stopOpacity="1" />
            <stop offset="100%" stopColor="#004411" stopOpacity="1" />
          </radialGradient>
          <filter id="neon">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Armor Ring */}
        <circle cx="100" cy="100" r="95" fill="#111" stroke="#333" strokeWidth="10" />
        
        {/* Rotating Tech Ring */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="100" cy="100" r="80" fill="none" stroke="#00ff33" strokeWidth="2" strokeDasharray="10 15 30 10 5 15" filter="url(#neon)" opacity="0.8" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="#555" strokeWidth="4" strokeDasharray="40 10" />
        </motion.g>

        {/* Counter-rotating Inner Ring */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="100" cy="100" r="60" fill="none" stroke="#00cc22" strokeWidth="3" strokeDasharray="20 20" filter="url(#neon)" />
        </motion.g>

        {/* Inner Core */}
        <circle cx="100" cy="100" r="50" fill="#000" />
        
        {/* The Hourglass Symbol */}
        <motion.path
          d="M 55 55 L 145 55 L 110 100 L 145 145 L 55 145 L 90 100 Z"
          fill="url(#glow)"
          filter="url(#neon)"
          animate={{ 
            fillOpacity: stage >= 1 ? [0.8, 1, 0.8] : 1,
            scale: stage >= 1 ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 0.5, repeat: stage >= 1 ? Infinity : 0 }}
          style={{ transformOrigin: "center" }}
        />
      </svg>
    </motion.div>
  );
}

function AnimatedSpider({ stage }: { stage: number }) {
  // We use the user's highly detailed reference image but apply a math filter
  // invert(1) turns white to black, black to white, and red to cyan.
  // hue-rotate(180deg) turns cyan back into a glowing neon red.
  // This perfectly transforms a white-bg diagram into a dark-mode cyberpunk hologram.
  
  return (
    <motion.div
      initial={{ y: 0, scale: 0, opacity: 0 }}
      animate={{ 
        y: stage >= 2 ? 1500 : (stage >= 1 ? 0 : 0),
        scale: stage >= 1 ? 1 : 0,
        opacity: stage >= 1 ? 1 : 0
      }}
      transition={{ 
        y: { duration: stage >= 2 ? 0.6 : 0.5, ease: stage >= 2 ? "easeIn" : "easeOut" },
        scale: { duration: 0.5, type: "spring", bounce: 0.5 },
        opacity: { duration: 0.3 }
      }}
      style={{ 
        position: "absolute", zIndex: 5, display: "flex", justifyContent: "center", alignItems: "center",
        width: 160, height: 160
      }}
    >
      {/* Dynamic Web Line */}
      <motion.div 
        style={{ 
          position: "absolute", bottom: "50%", width: 2, height: 2000, 
          background: "rgba(255,255,255,1)", transformOrigin: "bottom", 
          boxShadow: "0 0 15px #fff, 0 0 30px #ff0055", zIndex: 1 
        }}
      />
      
      {/* High-Tech Hologram Spider Image */}
      <motion.div
        style={{
          width: 160, height: 160, position: "relative", zIndex: 2,
          filter: "invert(1) hue-rotate(180deg) drop-shadow(0 0 10px rgba(255, 0, 50, 0.8))"
        }}
        initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
        animate={{ clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)" }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
      >
        <img 
          src="/assets/spider_user.png" 
          alt="Spider" 
          style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "screen" }} 
        />
        
        {/* Holographic Scanline sweeping over the spider */}
        <motion.div 
          animate={{ y: [0, 160, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: 4,
            background: "rgba(255, 0, 50, 0.8)",
            boxShadow: "0 0 15px #ff0033",
            zIndex: 3
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Timing choreography
    const t1 = setTimeout(() => setStage(1), 2000); // Omnitrix fully activates
    const t2 = setTimeout(() => setStage(2), 3200); // Spider drops
    const t3 = setTimeout(() => setStage(3), 3800); // Screen flashes white
    const t4 = setTimeout(() => onComplete(), 4600); // Unmount

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  const isFading = stage >= 3;

  return (
    <motion.div 
      animate={{ opacity: isFading ? 0 : 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{ 
        position: "fixed", inset: 0, zIndex: 9999, background: "#050505", 
        display: "flex", justifyContent: "center", alignItems: "center",
        pointerEvents: isFading ? "none" : "all"
      }}
    >
      {/* Cinematic Flash overlay */}
      <motion.div 
        animate={{ opacity: stage === 3 ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        style={{ position: "absolute", inset: 0, background: "#fff", zIndex: 10, pointerEvents: "none" }}
      />

      <div style={{ position: "relative", width: 400, height: 400, display: "flex", justifyContent: "center", alignItems: "center" }}>
        
        <AnimatedOmnitrix stage={stage} />

        {/* Center Blinding Light (when activating) */}
        <motion.div 
          animate={{ opacity: stage >= 1 ? 1 : 0, scale: stage >= 1 ? 4 : 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ position: "absolute", width: 50, height: 50, background: "#00ff33", filter: "blur(20px)", borderRadius: "50%", zIndex: 2 }}
        />
        
        <AnimatedSpider stage={stage} />
        
      </div>
    </motion.div>
  );
}
