"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function AwwwardsUI() {
  const scrollDepth = useStore((s) => s.scrollDepth);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none',
      zIndex: 100,
      color: '#ffffff',
      fontFamily: '"Inter", sans-serif',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.8, fontSize: '11px', letterSpacing: '0.2em' }}>
        <div>
          <span style={{ opacity: 0.5 }}>SYS.ID // </span>
          <span>MECHANICA_CORE_V2</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ opacity: 0.5 }}>STATUS // </span>
          <span style={{ color: '#ffaa55' }}>ONLINE</span>
        </div>
      </div>

      {/* Center Reticle (Subtle) */}
      <div style={{ 
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '40px', height: '40px', 
        border: '1px solid rgba(255,255,255,0.1)', 
        borderRadius: '50%',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
      }}>
        <div style={{ width: '4px', height: '4px', background: 'rgba(255,255,255,0.5)', borderRadius: '50%' }} />
      </div>

      {/* Bottom Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', opacity: 0.8, fontSize: '11px', letterSpacing: '0.2em' }}>
        <div>
          <div style={{ opacity: 0.5, marginBottom: '8px' }}>TELEMETRY_DATA</div>
          <motion.div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <span style={{ opacity: 0.5 }}>X: </span>
              {(scrollDepth * 360).toFixed(2)}°
            </div>
            <div>
              <span style={{ opacity: 0.5 }}>Z: </span>
              {(scrollDepth * -100).toFixed(2)}
            </div>
          </motion.div>
        </div>
        
        {/* Sleek Scroll Indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <div style={{ opacity: 0.5 }}>DEPTH</div>
          <div style={{ 
            width: '2px', height: '60px', background: 'rgba(255,255,255,0.2)', position: 'relative'
          }}>
            <motion.div 
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%',
                height: `${scrollDepth * 100}%`,
                background: '#ffffff',
                boxShadow: '0 0 10px #ffffff'
              }}
            />
          </div>
          <div style={{ fontSize: '10px', marginTop: '4px' }}>{(scrollDepth * 100).toFixed(0)}%</div>
        </div>
      </div>
    </div>
  );
}
