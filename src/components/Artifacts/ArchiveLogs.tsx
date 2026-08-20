"use client";

import { Html } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export function ArchiveLogs() {
  const log1Ref = useRef<HTMLDivElement>(null);
  const log2Ref = useRef<HTMLDivElement>(null);

  useFrame((state) => {
    // We can animate opacity based on camera proximity
    const camZ = state.camera.position.z;
    
    if (log1Ref.current) {
      // Log 1 is at z = 2
      const dist = Math.abs(camZ - 2);
      log1Ref.current.style.opacity = Math.max(0, 1 - dist / 5).toString();
    }
    
    if (log2Ref.current) {
      // Log 2 is at z = -20
      const dist = Math.abs(camZ - (-20));
      log2Ref.current.style.opacity = Math.max(0, 1 - dist / 10).toString();
    }
  });

  return (
    <>
      <Html position={[0, 2, 2]} center style={{ pointerEvents: 'none' }}>
        <div ref={log1Ref} style={{
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '14px',
          letterSpacing: '0.1em',
          textShadow: '0 0 10px #00ffff',
          whiteSpace: 'nowrap',
          textAlign: 'center'
        }}>
          ARCHIVE LOG 001<br/>
          <span style={{ color: '#00ffff', fontSize: '12px' }}>Nature was the first engineer.</span>
        </div>
      </Html>

      <Html position={[-3, -2, -20]} center style={{ pointerEvents: 'none' }}>
        <div ref={log2Ref} style={{
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '14px',
          letterSpacing: '0.1em',
          textShadow: '0 0 10px #00ffff',
          whiteSpace: 'nowrap',
          textAlign: 'left'
        }}>
          ARCHIVE LOG 002<br/>
          <span style={{ color: '#00ffff', fontSize: '12px' }}>Every machine starts as a line.</span>
        </div>
      </Html>
    </>
  );
}
