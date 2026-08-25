"use client";

export function PosterBackground() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: -1,
      background: 'var(--background)',
      overflow: 'hidden'
    }}>
      {/* Heavy paper texture noise */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.4, mixBlendMode: 'multiply',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      {/* Faint engineer grid (ink style) */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--blueprint-grid) 1px, transparent 1px), linear-gradient(90deg, var(--blueprint-grid) 1px, transparent 1px)',
        backgroundSize: '40px 40px', opacity: 0.6
      }} />
      
      {/* Central blueprint alignment axes */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', background: 'var(--blueprint-line)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', background: 'var(--blueprint-line)' }} />
      
      {/* Vague faded circular ink diagrams in the background */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80vh', height: '80vh', border: '1px solid var(--blueprint-grid)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '70vh', height: '70vh', border: '1px dashed var(--blueprint-line)', borderRadius: '50%' }} />
    </div>
  );
}
