"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Timing choreography
    const t1 = setTimeout(() => setStage(1), 1500); // Omnitrix pops up
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

      <div style={{ position: "relative", width: 400, height: 400, display: "flex", justifyContent: "center", alignItems: "center" }}>
        
        {/* Hyper-realistic Omnitrix Base */}
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: stage >= 1 ? 1.5 : 1,
            opacity: 1,
            filter: stage >= 1 ? "brightness(2) contrast(1.5) blur(10px)" : "brightness(1) contrast(1) blur(0px)"
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "absolute", zIndex: 1, mixBlendMode: "screen" }}
        >
          <img src="/assets/omnitrix.jpg" alt="Omnitrix" style={{ width: 300, height: 300, borderRadius: "50%" }} />
        </motion.div>

        {/* Center Blinding Light (when activating) */}
        <motion.div 
          animate={{ opacity: stage >= 1 ? 1 : 0, scale: stage >= 1 ? 4 : 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ position: "absolute", width: 50, height: 50, background: "#00ff33", filter: "blur(20px)", borderRadius: "50%", zIndex: 2 }}
        />
        
        {/* The Realistic Cyber-Spider */}
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
            position: "absolute", zIndex: 5, mixBlendMode: "screen", display: "flex", justifyContent: "center"
          }}
        >
          {/* Dynamic Web line drawn as the spider drops */}
          <motion.div 
            style={{ 
              position: "absolute", bottom: "50%", width: 2, height: 2000, 
              background: "rgba(255,255,255,0.9)", transformOrigin: "bottom", 
              boxShadow: "0 0 15px #fff, 0 0 30px #ff0055" 
            }}
          />
          {/* High-res Spider Image */}
          <img src="/assets/spider.jpg" alt="Spider" style={{ width: 120, height: 120, position: "relative", zIndex: 2 }} />
        </motion.div>
      </div>
    </motion.div>
  );
}
