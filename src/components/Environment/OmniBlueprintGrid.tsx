"use client";

import { useStore } from "@/store/useStore";

export function OmniBlueprintGrid() {
  const isMutated = useStore((state) => state.isDismantled);

  const color = isMutated ? 'rgba(255, 0, 51, 0.15)' : 'rgba(57, 255, 20, 0.15)';
  const majorGrid = isMutated ? 'rgba(255, 0, 51, 0.3)' : 'rgba(57, 255, 20, 0.3)';

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 0,
      backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px',
      backgroundImage: `
        linear-gradient(to right, ${color} 1px, transparent 1px),
        linear-gradient(to bottom, ${color} 1px, transparent 1px),
        linear-gradient(to right, ${majorGrid} 1px, transparent 1px),
        linear-gradient(to bottom, ${majorGrid} 1px, transparent 1px)
      `,
      transition: 'all 0.5s ease',
      opacity: 0.8
    }}>
      {/* Spider-Man Blueprint Style Vignette */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(circle at center, transparent 30%, rgba(5,5,5,0.9) 100%)'
      }} />
    </div>
  );
}
