export function BlueprintHUD() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 10,
      fontFamily: '"Geist Mono", monospace',
      color: 'var(--foreground)',
    }}>
      {/* Top Left: Warning Frame */}
      <div style={{ position: 'absolute', top: 40, left: 40, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 15, height: 15, backgroundColor: '#ff007f' }} />
          <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', color: '#ff007f' }}>SYSTEM ACTIVE</div>
        </div>
        <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '0.1em', marginTop: '5px' }}>PROJECT LEVIATHAN</div>
        <div style={{ fontSize: '10px', opacity: 0.6, letterSpacing: '0.1em' }}>[SEC: 099-ALPHA-OMEGA]</div>
      </div>

      {/* Top Right: Cyberpunk Barcode & Data */}
      <div style={{ position: 'absolute', top: 40, right: 40, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[2, 5, 2, 2, 5, 5, 2, 5, 2, 5, 5, 2, 2, 5, 2].map((w, i) => (
            <div key={i} style={{ width: w, height: 30, backgroundColor: 'var(--foreground)' }} />
          ))}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', color: '#34d399', backgroundColor: '#1a1a1a', padding: '4px 8px' }}>
          CREATION // 234
        </div>
        <div style={{ fontSize: '10px', opacity: 0.6, fontFamily: 'sans-serif' }}>&lt;&lt;&lt;&lt;&lt;&lt; ++++ &gt;&gt;&gt;&gt;&gt;&gt;</div>
      </div>

      {/* Bottom Left: Coordinates and Status */}
      <div style={{ position: 'absolute', bottom: 40, left: 40 }}>
        <div style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '0.2em', marginBottom: '10px' }}>SPATIAL COORDINATES</div>
        <div style={{ fontSize: '14px', fontFamily: '"Geist Mono", monospace', letterSpacing: '0.1em' }}>
          X: <span style={{ color: '#fbbf24' }}>45.992</span><br/>
          Y: <span style={{ color: '#fbbf24' }}>-12.004</span><br/>
          Z: <span style={{ color: '#fbbf24' }}>88.110</span>
        </div>
        
        {/* Warning Tape pattern */}
        <div style={{ 
          marginTop: '20px', 
          width: '150px', 
          height: '10px', 
          background: 'repeating-linear-gradient(45deg, #fbbf24, #fbbf24 10px, #1a1a1a 10px, #1a1a1a 20px)' 
        }} />
      </div>

      {/* Bottom Right: Scale indicator */}
      <div style={{ position: 'absolute', bottom: 40, right: 40, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#ff007f' }}>R_99</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#34d399', letterSpacing: '0.1em' }}>0054</div>
        </div>
        <div style={{ width: '200px', height: '1px', backgroundColor: 'var(--foreground)', opacity: 0.3, marginBottom: '5px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px', fontSize: '10px', opacity: 0.5 }}>
          <span>0.0mm</span>
          <span>100.0mm</span>
        </div>
      </div>

      {/* Crosshairs & Alignment Marks */}
      <div style={{ position: 'absolute', top: '50%', left: 40, width: 20, height: 1, backgroundColor: '#ff007f' }} />
      <div style={{ position: 'absolute', top: '50%', right: 40, width: 20, height: 1, backgroundColor: '#ff007f' }} />
      <div style={{ position: 'absolute', top: 40, left: '50%', width: 1, height: 20, backgroundColor: '#34d399' }} />
      <div style={{ position: 'absolute', bottom: 40, left: '50%', width: 1, height: 20, backgroundColor: '#34d399' }} />
      
      {/* Center Target (Subtle) */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: '40px',
        height: '40px',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ width: 2, height: 2, backgroundColor: '#fbbf24' }} />
      </div>
    </div>
  );
}
