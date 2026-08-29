"use client";

import { useEffect, useState } from "react";

export function RealitySplit() {
  const [splitX, setSplitX] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setSplitX((e.clientX / window.innerWidth) * 100);
    };
    
    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <>
      {/* The Right Side - High Contrast Pink/Black Reality */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: `${100 - splitX}%`,
          height: '100vh',
          // Violent color inversion and hue shift to turn Cyan into Pink, and Dark into White
          backdropFilter: 'invert(100%) hue-rotate(270deg) contrast(120%) saturate(150%)',
          pointerEvents: 'none',
          zIndex: 40,
        }}
      />

      {/* The Draggable Splitter Line */}
      <div 
        onMouseDown={() => setIsDragging(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: `${splitX}%`,
          width: '6px',
          height: '100vh',
          background: `linear-gradient(90deg, 
            transparent 0%, 
            rgba(255, 0, 51, 0.2) 80%, 
            rgba(255, 0, 51, 0.8) 98%, 
            #ff0033 100%)`,
          cursor: 'col-resize',
          zIndex: 50,
          boxShadow: '0 0 20px #ff0033',
          transform: 'translateX(-50%)',
          transition: 'background-color 0.2s ease',
          pointerEvents: 'auto'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60px',
          height: '60px',
          border: `2px solid ${isHovered || isDragging ? '#ff0033' : 'rgba(255, 0, 51, 0.5)'}`,
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0a0a0a',
          transition: 'all 0.2s ease',
          scale: isHovered || isDragging ? '1.1' : '1'
        }}>
          <div style={{ color: '#ff0033', fontSize: '10px', fontWeight: 900, letterSpacing: '0.1em' }}>DRAG</div>
        </div>
      </div>
    </>
  );
}
