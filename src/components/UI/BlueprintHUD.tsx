import { useStore } from "@/store/useStore";

export function BlueprintHUD() {
  const isMutated = useStore(state => state.isDismantled); // isMutated

  const color = isMutated ? 'var(--symbiote-red)' : 'var(--alien-green)';

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
      {/* Heavy Graphic Borders */}
      <div style={{ position: 'absolute', top: 20, left: 20, width: '40px', height: '40px', borderTop: `4px solid ${color}`, borderLeft: `4px solid ${color}`, transition: 'border-color 0.3s' }} />
      <div style={{ position: 'absolute', top: 20, right: 20, width: '40px', height: '40px', borderTop: `4px solid ${color}`, borderRight: `4px solid ${color}`, transition: 'border-color 0.3s' }} />
      <div style={{ position: 'absolute', bottom: 20, left: 20, width: '40px', height: '40px', borderBottom: `4px solid ${color}`, borderLeft: `4px solid ${color}`, transition: 'border-color 0.3s' }} />
      <div style={{ position: 'absolute', bottom: 20, right: 20, width: '40px', height: '40px', borderBottom: `4px solid ${color}`, borderRight: `4px solid ${color}`, transition: 'border-color 0.3s' }} />

      {/* Top Left: Logo / System Status */}
      <div style={{ position: 'absolute', top: '40px', left: '40px', pointerEvents: 'auto' }}>
        <div style={{ fontSize: '10px', letterSpacing: '0.2em', opacity: 0.8, color: color, transition: 'color 0.3s' }}>
          OMNI-MATRIX ACTIVE
        </div>
        <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '0.1em', marginTop: '5px', textTransform: 'uppercase', background: color, color: '#000', padding: '5px 10px', display: 'inline-block', transition: 'background-color 0.3s' }}>
          {isMutated ? 'PROJECT VENOM' : 'PROJECT ALIEN X'}
        </div>
        <div style={{ fontSize: '8px', letterSpacing: '0.3em', opacity: 0.5, marginTop: '8px' }}>
          [DNA: UNSTABLE_MUTATION]
        </div>
      </div>

      {/* Top Right: Cyberpunk Barcode & Data */}
      <div style={{ position: 'absolute', top: 40, right: 40, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[2, 5, 2, 2, 5, 5, 2, 5, 2, 5, 5, 2, 2, 5, 2].map((w, i) => (
            <div key={i} style={{ width: w, height: 30, backgroundColor: color, transition: 'background-color 0.3s' }} />
          ))}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', color: color, backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 8px', transition: 'color 0.3s' }}>
          SAMPLE // 10
        </div>
      </div>

      {/* Bottom Left: Coordinates and Status */}
      <div style={{ position: 'absolute', bottom: 40, left: 40 }}>
        <div style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '0.2em', marginBottom: '10px' }}>DNA SEQUENCE</div>
        <div style={{ fontSize: '14px', fontFamily: '"Geist Mono", monospace', letterSpacing: '0.1em' }}>
          STRAND A: <span style={{ color: color, transition: 'color 0.3s' }}>45.992</span><br/>
          STRAND B: <span style={{ color: color, transition: 'color 0.3s' }}>-12.004</span><br/>
          STRAND C: <span style={{ color: color, transition: 'color 0.3s' }}>88.110</span>
        </div>
        
        {/* Warning Tape pattern */}
        <div style={{ 
          marginTop: '20px', 
          width: '150px', 
          height: '10px', 
          background: `repeating-linear-gradient(45deg, ${color}, ${color} 10px, transparent 10px, transparent 20px)`,
          transition: 'background 0.3s'
        }} />
      </div>

      {/* Bottom Right: Scale indicator */}
      <div style={{ position: 'absolute', bottom: 40, right: 40, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.1em', color: color, marginBottom: '15px', transition: 'color 0.3s' }}>
          GENETIC ANALYSIS
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.1em' }}>HOST BODY</span>
            <span style={{ fontSize: '10px', letterSpacing: '0.1em', opacity: 0.7 }}>ACCEPTED</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.1em' }}>SYMBIOTE THREAT</span>
            <span style={{ fontSize: '10px', letterSpacing: '0.1em', color: isMutated ? 'var(--symbiote-red)' : 'var(--alien-green)', fontWeight: 'bold' }}>
              {isMutated ? 'CRITICAL' : 'DORMANT'}
            </span>
          </div>
        </div>
      </div>

      {/* Crosshairs & Alignment Marks */}
      <div style={{ position: 'absolute', top: '50%', left: 40, width: 20, height: 1, backgroundColor: color }} />
      <div style={{ position: 'absolute', top: '50%', right: 40, width: 20, height: 1, backgroundColor: color }} />
      <div style={{ position: 'absolute', top: 40, left: '50%', width: 1, height: 20, backgroundColor: color }} />
      <div style={{ position: 'absolute', bottom: 40, left: '50%', width: 1, height: 20, backgroundColor: color }} />
      
      {/* Center Target (Subtle) */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        width: '40px',
        height: '40px',
        border: `1px solid ${color}`,
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'border-color 0.3s'
      }}>
        <div style={{ width: 2, height: 2, backgroundColor: color }} />
      </div>
    </div>
  );
}
