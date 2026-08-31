"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Timing choreography
    const t1 = setTimeout(() => setStage(1), 1500); // Omnitrix dial pops up and splits
    const t2 = setTimeout(() => setStage(2), 2500); // Spider rapidly drops down drawing the web
    const t3 = setTimeout(() => setStage(3), 3200); // Screen flashes and begins fade out
    const t4 = setTimeout(() => onComplete(), 4000); // Component unmounts, lenis unlocks

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

      <div style={{ position: "relative", width: 200, height: 200 }}>
        
        {/* Omnitrix Base Bezel */}
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ 
            scale: stage >= 1 ? 1.2 : 1,
            rotate: stage >= 1 ? 90 : 0
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute", inset: 0,
            borderRadius: "50%", background: "#111", border: "8px solid #222",
            boxShadow: "0 0 40px rgba(0,255,0,0.1) inset, 0 0 80px rgba(0,0,0,0.9)",
            display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden"
          }}
        >
           {/* High-tech inner ring */}
           <div style={{ width: "80%", height: "80%", borderRadius: "50%", border: "2px dashed #444", position: "absolute" }} />
           
           {/* Center Glowing Core (visible when halves split) */}
           <motion.div 
             animate={{ opacity: stage >= 1 ? 1 : 0, scale: stage >= 1 ? 1.5 : 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
             style={{ position: "absolute", inset: "30%", background: "#00ff33", filter: "blur(15px)", borderRadius: "50%" }}
           />
        </motion.div>

        {/* Omnitrix Hourglass - Left Half */}
        <motion.div 
          animate={{ x: stage >= 1 ? -60 : 0, opacity: stage >= 1 ? 0 : 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ 
            position: "absolute", left: 40, top: 30, width: 60, height: 140, 
            background: "#00e676", 
            clipPath: "polygon(0 0, 100% 0, 100% 50%, 100% 100%, 0 100%, 50% 50%)", 
            filter: "drop-shadow(0 0 10px #00e676)" 
          }}
        />

        {/* Omnitrix Hourglass - Right Half */}
        <motion.div 
          animate={{ x: stage >= 1 ? 60 : 0, opacity: stage >= 1 ? 0 : 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ 
            position: "absolute", right: 40, top: 30, width: 60, height: 140, 
            background: "#00e676", 
            clipPath: "polygon(0 0, 100% 0, 50% 50%, 0 100%, 100% 100%, 100% 50%)", 
            filter: "drop-shadow(0 0 10px #00e676)" 
          }}
        />
        
        {/* The Spider */}
        <motion.div
          initial={{ y: 0, scale: 0, opacity: 0 }}
          animate={{ 
            y: stage >= 2 ? 1500 : (stage >= 1 ? -20 : 0),
            scale: stage >= 1 ? 1.5 : 0,
            opacity: stage >= 1 ? 1 : 0
          }}
          transition={{ 
            y: { duration: stage >= 2 ? 0.6 : 0.5, ease: stage >= 2 ? "easeIn" : "easeOut" },
            scale: { duration: 0.5, type: "spring", bounce: 0.5 },
            opacity: { duration: 0.3 }
          }}
          style={{ 
            position: "absolute", left: "50%", top: "50%", 
            marginLeft: -30, marginTop: -30, width: 60, height: 60, 
            zIndex: 5 
          }}
        >
          {/* Dynamic Web line drawn as the spider drops */}
          <motion.div 
            style={{ 
              position: "absolute", left: "50%", bottom: "50%", width: 2, height: 2000, 
              background: "rgba(255,255,255,0.9)", transformOrigin: "bottom", 
              marginLeft: -1, boxShadow: "0 0 15px #fff, 0 0 30px #00e676" 
            }}
          />
          {/* Stylized Spider SVG */}
          <svg viewBox="0 0 100 100" fill="none" style={{ position: "relative", zIndex: 2 }}>
            <path d="M50 80 C 40 80 30 70 30 50 C 30 40 40 30 50 30 C 60 30 70 40 70 50 C 70 70 60 80 50 80 Z" fill="#000" stroke="#fff" strokeWidth="2"/>
            <path d="M50 30 C 45 30 40 25 40 20 C 40 15 45 10 50 10 C 55 10 60 15 60 20 C 60 25 55 30 50 30 Z" fill="#000" stroke="#fff" strokeWidth="2"/>
            
            {/* 8 Legs */}
            <path d="M30 50 Q 10 30 0 60" stroke="#000" strokeWidth="4" />
            <path d="M70 50 Q 90 30 100 60" stroke="#000" strokeWidth="4" />
            
            <path d="M32 60 Q 10 50 5 80" stroke="#000" strokeWidth="4" />
            <path d="M68 60 Q 90 50 95 80" stroke="#000" strokeWidth="4" />
            
            <path d="M35 30 Q 10 10 20 0" stroke="#000" strokeWidth="4" />
            <path d="M65 30 Q 90 10 80 0" stroke="#000" strokeWidth="4" />
            
            <path d="M30 40 Q 5 20 0 40" stroke="#000" strokeWidth="4" />
            <path d="M70 40 Q 95 20 100 40" stroke="#000" strokeWidth="4" />
          </svg>
        </motion.div>
      </div>

    </motion.div>
  );
}
