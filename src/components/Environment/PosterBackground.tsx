"use client";

export function PosterBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'var(--background)',
      zIndex: -1,
      overflow: 'hidden',
    }}>
      {/* Film Grain Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.4,
        pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }} />

      {/* Faint vertical blueprint lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(to right, rgba(44, 40, 37, 0.03) 1px, transparent 1px)',
        backgroundSize: '10vw 100%',
        pointerEvents: 'none',
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
