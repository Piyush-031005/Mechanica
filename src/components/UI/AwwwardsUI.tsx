"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function AwwwardsUI() {
  const scrollDepth = useStore((s) => s.scrollDepth); // 0.0 to 1.0
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // Change massive text based on scroll progress
  let currentWord = "OBSIDIAN";
  let subText = "THE ARCHITECTURE OF THOUGHT";
  if (scrollDepth > 0.25) { currentWord = "FLUIDITY"; subText = "REALITY IS CONTINUOUS"; }
  if (scrollDepth > 0.5) { currentWord = "TENSION"; subText = "BALANCE IN CHAOS"; }
  if (scrollDepth > 0.75) { currentWord = "SINGULARITY"; subText = "ALL IS ONE"; }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none',
      zIndex: 100,
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      mixBlendMode: 'difference' // Interacts beautifully with the bright 3D object behind it
    }}>
      <motion.div
        key={currentWord}
        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} // Smooth Awwwards-style easing
        style={{ textAlign: 'center' }}
      >
        <h1 style={{ 
          fontSize: '12vw', 
          fontWeight: 900, 
          letterSpacing: '-0.04em',
          margin: 0,
          lineHeight: 1,
          fontFamily: '"Inter", sans-serif'
        }}>
          {currentWord}
        </h1>
        <p style={{
          fontSize: '1vw',
          letterSpacing: '0.4em',
          marginTop: '2rem',
          textTransform: 'uppercase',
          opacity: 0.7,
          fontFamily: '"Inter", sans-serif'
        }}>
          {subText}
        </p>
      </motion.div>
      
      {/* Absolute positioned elegant UI elements */}
      <div style={{ position: 'absolute', bottom: 40, left: 40, fontSize: 12, letterSpacing: '0.1em', opacity: 0.5 }}>
        SCROLL TO EXPLORE
      </div>
      <div style={{ position: 'absolute', bottom: 40, right: 40, fontSize: 12, letterSpacing: '0.1em', opacity: 0.5 }}>
        {(scrollDepth * 100).toFixed(0)}%
      </div>
    </div>
  );
}
