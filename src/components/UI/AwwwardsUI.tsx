"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AwwwardsUI() {
  const scrollDepth = useStore((s) => s.scrollDepth);
  const velocity = useStore((s) => s.scrollVelocity);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // Determine active section based on scroll depth
  let sectionName = "THE CORE";
  let telemetry = [
    { label: "STATE", value: "LIQUID_GLASS" },
    { label: "REFRACTION", value: "1.5 IOR" }
  ];

  if (scrollDepth > 0.25 && scrollDepth <= 0.50) {
    sectionName = "THE VAULT";
    telemetry = [
      { label: "CORE_TEMP", value: `${(scrollDepth * 4000).toFixed(0)}K` },
      { label: "STRUCT_INTEGRITY", value: `${(100 - (scrollDepth - 0.25) * 400).toFixed(1)}%` }
    ];
  } else if (scrollDepth > 0.50 && scrollDepth <= 0.75) {
    sectionName = "THE ATMOSPHERE";
    telemetry = [
      { label: "ALTITUDE", value: `${(scrollDepth * 15000).toFixed(0)}FT` },
      { label: "MACH", value: `${(1 + Math.abs(velocity) * 0.1).toFixed(2)}` }
    ];
  } else if (scrollDepth > 0.75) {
    sectionName = "THE OBSERVER";
    telemetry = [
      { label: "TARGET", value: "ACQUIRED" },
      { label: "GYRO_RPM", value: `${(Math.abs(velocity) * 5000).toFixed(0)}` }
    ];
  }

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
          <span style={{ opacity: 0.5 }}>ACTIVE_SECTOR // </span>
          <span style={{ color: '#ffaa55' }}>{sectionName}</span>
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
          <div style={{ display: 'flex', gap: '20px' }}>
            {telemetry.map((t, i) => (
              <div key={i}>
                <span style={{ opacity: 0.5 }}>{t.label}: </span>
                {t.value}
              </div>
            ))}
          </div>
        </div>
        
        {/* Sleek Scroll Indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <div style={{ opacity: 0.5 }}>DEPTH</div>
          <div style={{ 
            width: '2px', height: '60px', background: 'rgba(255,255,255,0.2)', position: 'relative'
          }}>
            <div 
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
