"use client";
import { motion } from "framer-motion";
import { OmnitrixDial } from "../OmnitrixDial";

export function HeroSection() {
  const bebas = { fontFamily: "'Bebas Neue', sans-serif" };
  const mono  = { fontFamily: "'Space Mono', monospace" };
  const tag   = { ...mono, letterSpacing: ".3em", textTransform: "uppercase" as const };

  return (
    <section style={{ position: "relative", width: "100%", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 10 }}>
      {/* Background radial glow */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "800px", background: "radial-gradient(circle, rgba(0,255,51,0.1) 0%, transparent 70%)", zIndex: -1, pointerEvents: "none" }} />
      
      {/* Big Dial behind text */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 0, opacity: 0.15, pointerEvents: "none" }}>
        <OmnitrixDial scale={2.5} glowing={false} />
      </div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1, ease: "easeOut" }}
        style={{ zIndex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}
      >
        <div style={{ ...tag, color: "#00ff33", fontSize: 14 }}>Classified Level 20 Technology</div>
        <div style={{ position: "relative" }}>
          <motion.h1 
            animate={{ x: [-2, 2, -1, 1, 0], opacity: [1, 0.8, 1, 0.9, 1] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
            style={{ ...bebas, fontSize: "8vw", lineHeight: 0.9, color: "#fff", textShadow: "0 0 40px rgba(0,255,51,0.5)", position: "relative", zIndex: 2 }}
          >
            THE OMNITRIX<br />ARCHIVES
          </motion.h1>
          <motion.h1 
            animate={{ x: [2, -2, 1, -1, 0], opacity: [0, 1, 0, 1, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3.05 }}
            style={{ ...bebas, fontSize: "8vw", lineHeight: 0.9, color: "#ff003c", position: "absolute", top: 0, left: "-3px", zIndex: 1, mixBlendMode: "screen" }}
          >
            THE OMNITRIX<br />ARCHIVES
          </motion.h1>
          <motion.h1 
            animate={{ x: [-2, 2, -1, 1, 0], opacity: [0, 1, 0, 1, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3.1 }}
            style={{ ...bebas, fontSize: "8vw", lineHeight: 0.9, color: "#00e5ff", position: "absolute", top: 0, left: "3px", zIndex: 1, mixBlendMode: "screen" }}
          >
            THE OMNITRIX<br />ARCHIVES
          </motion.h1>
        </div>
        <p style={{ ...mono, color: "rgba(255,255,255,0.6)", maxWidth: "600px", marginTop: "20px", fontSize: "16px", lineHeight: 1.6 }}>
          Accessing the most powerful device in the universe. Contains the DNA of 1,000,912 sapient species from across the Milky Way Galaxy. 
        </p>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ 
            marginTop: "40px",
            padding: "15px 40px", 
            border: "1px solid #00ff33", 
            background: "rgba(0,255,51,0.1)",
            color: "#00ff33",
            cursor: "pointer",
            ...tag,
            boxShadow: "0 0 20px rgba(0,255,51,0.2)"
          }}
          onClick={() => {
            window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
          }}
        >
          Initiate Uplink Sequence
        </motion.div>
      </motion.div>
      
      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ position: "absolute", bottom: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", pointerEvents: "none" }}
      >
        <div style={{ ...mono, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>SCROLL</div>
        <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)" }} />
      </motion.div>
    </section>
  );
}
