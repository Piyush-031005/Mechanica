import { useStore } from "@/store/useStore";

export function BlueprintHUD() {
  const isDismantled = useStore(state => state.isDismantled);
  const toggleDismantle = useStore(state => state.toggleDismantle);

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
      color: 'var(--text-color)',
    }}>
      {/* Heavy Graphic Borders */}
      <div style={{ position: 'absolute', top: 20, left: 20, width: '40px', height: '40px', borderTop: '4px solid #ff0033', borderLeft: '4px solid #ff0033' }} />
      <div style={{ position: 'absolute', top: 20, right: 20, width: '40px', height: '40px', borderTop: '4px solid #ff0033', borderRight: '4px solid #ff0033' }} />
      <div style={{ position: 'absolute', bottom: 20, left: 20, width: '40px', height: '40px', borderBottom: '4px solid #ff0033', borderLeft: '4px solid #ff0033' }} />
      <div style={{ position: 'absolute', bottom: 20, right: 20, width: '40px', height: '40px', borderBottom: '4px solid #ff0033', borderRight: '4px solid #ff0033' }} />

      {/* Top Left: Logo / System Status */}
      <div style={{ position: 'absolute', top: '40px', left: '40px', pointerEvents: 'auto' }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.2em', opacity: 0.8, color: '#ff0033' }}>
          SYSTEM ACTIVE
        </div>
        <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '0.1em', marginTop: '5px', textTransform: 'uppercase', background: '#ff0033', color: '#000', padding: '5px 10px', display: 'inline-block' }}>
          PROJECT LEVIATHAN
        </div>
        <div style={{ fontSize: '8px', letterSpacing: '0.3em', opacity: 0.5, marginTop: '8px' }}>
          [SEC: 099-ALPHA-OMEGA]
        </div>
      </div>

      {/* Top Right: Cyberpunk Barcode & Data */}
      <div style={{ position: 'absolute', top: 40, right: 40, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[2, 5, 2, 2, 5, 5, 2, 5, 2, 5, 5, 2, 2, 5, 2].map((w, i) => (
            <div key={i} style={{ width: w, height: 30, backgroundColor: 'var(--text-color)' }} />
          ))}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--accent-cyan)', backgroundColor: '#1a1a1a', padding: '4px 8px' }}>
          CREATION // 234
        </div>
        <div style={{ fontSize: '10px', opacity: 0.6, fontFamily: 'sans-serif' }}>&lt;&lt;&lt;&lt;&lt;&lt; ++++ &gt;&gt;&gt;&gt;&gt;&gt;</div>
      </div>

      {/* Bottom Left: Coordinates and Status */}
      <div style={{ position: 'absolute', bottom: 40, left: 40 }}>
        <div style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '0.2em', marginBottom: '10px' }}>SPATIAL COORDINATES</div>
        <div style={{ fontSize: '14px', fontFamily: '"Geist Mono", monospace', letterSpacing: '0.1em' }}>
          X: <span style={{ color: 'var(--accent-cyan)' }}>45.992</span><br/>
          Y: <span style={{ color: 'var(--accent-cyan)' }}>-12.004</span><br/>
          Z: <span style={{ color: 'var(--accent-cyan)' }}>88.110</span>
        </div>
        
        {/* Warning Tape pattern */}
        <div style={{ 
          marginTop: '20px', 
          width: '150px', 
          height: '10px', 
          background: 'repeating-linear-gradient(45deg, var(--accent-magenta), var(--accent-magenta) 10px, #1a1a1a 10px, #1a1a1a 20px)' 
        }} />
      </div>

      {/* Bottom Right: Scale indicator */}
      <div style={{ position: 'absolute', bottom: 40, right: 40, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.1em', color: '#ff0033', marginBottom: '15px' }}>
          MATERIAL ANALYSIS
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.1em' }}>LOTUS CORE</span>
            <span style={{ fontSize: '10px', letterSpacing: '0.1em', opacity: 0.7 }}>LIQUID GLASS</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.1em' }}>PETAL GEOMETRY</span>
            <span style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#ff0033', fontWeight: 'bold' }}>NUCLEAR PLASMA</span>
          </div>
        </div>
      </div>

      {/* Crosshairs & Alignment Marks */}
      <div style={{ position: 'absolute', top: '50%', left: 40, width: 20, height: 1, backgroundColor: 'var(--accent-magenta)' }} />
      <div style={{ position: 'absolute', top: '50%', right: 40, width: 20, height: 1, backgroundColor: 'var(--accent-magenta)' }} />
      <div style={{ position: 'absolute', top: 40, left: '50%', width: 1, height: 20, backgroundColor: 'var(--accent-cyan)' }} />
      <div style={{ position: 'absolute', bottom: 40, left: '50%', width: 1, height: 20, backgroundColor: 'var(--accent-cyan)' }} />
      
      {/* DISMANTLE BUTTON */}
      <button 
        onClick={toggleDismantle}
        style={{ 
          position: 'absolute', 
          bottom: 100, 
          left: '50%', 
          transform: 'translateX(-50%)',
          background: isDismantled ? '#ff0033' : 'transparent',
          color: isDismantled ? '#000' : '#ffffff',
          border: '2px solid #ff0033',
          padding: '12px 40px',
          fontSize: '14px',
          fontWeight: 900,
          letterSpacing: '0.4em',
          cursor: 'pointer',
          pointerEvents: 'auto',
          textTransform: 'uppercase',
          backdropFilter: 'blur(4px)',
          transition: 'all 0.3s ease',
          boxShadow: isDismantled ? '0 0 20px rgba(255,0,51,0.5)' : 'none'
        }}
      >
        {isDismantled ? 'ENGAGE SYSTEM' : 'DISMANTLE'}
      </button>

      {/* Center Target (Subtle) */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: '40px',
        height: '40px',
        border: '1px solid var(--accent-cyan)',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ width: 2, height: 2, backgroundColor: 'var(--accent-cyan)' }} />
      </div>
    </div>
  );
}
