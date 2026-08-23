export function PosterBackground() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      background: '#04152d', // Deep blueprint blue
      overflow: 'hidden'
    }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="smallGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          </pattern>
          <pattern id="largeGrid" width="400" height="400" patternUnits="userSpaceOnUse">
            <rect width="400" height="400" fill="url(#smallGrid)"/>
            <path d="M 400 0 L 0 0 0 400" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#largeGrid)" />

        {/* Blueprint technical arcs */}
        <circle cx="20%" cy="80%" r="600" fill="none" stroke="rgba(0, 240, 255, 0.15)" strokeWidth="1" strokeDasharray="10 20" />
        <circle cx="80%" cy="20%" r="800" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="2" />
        <circle cx="50%" cy="50%" r="400" fill="none" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1" strokeDasharray="4 8" />
        
        {/* Registration marks */}
        <path d="M 50 20 L 50 80 M 20 50 L 80 50" stroke="rgba(0, 240, 255, 0.5)" strokeWidth="1" />
        <path d="M 50 20 L 50 80 M 20 50 L 80 50" stroke="rgba(0, 240, 255, 0.5)" strokeWidth="1" transform="translate(1820, 0)" />
        <path d="M 50 20 L 50 80 M 20 50 L 80 50" stroke="rgba(0, 240, 255, 0.5)" strokeWidth="1" transform="translate(0, 900)" />
        <path d="M 50 20 L 50 80 M 20 50 L 80 50" stroke="rgba(0, 240, 255, 0.5)" strokeWidth="1" transform="translate(1820, 900)" />
      </svg>
    </div>
  );
}
