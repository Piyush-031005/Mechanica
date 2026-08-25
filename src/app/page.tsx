"use client";

import { BlueprintHUD } from "@/components/UI/BlueprintHUD";
import { MechanicalAssembly } from "@/components/Artifacts/MechanicalAssembly";
import { PosterBackground } from "@/components/Environment/PosterBackground";
import { Canvas } from "@react-three/fiber";
import { CameraController } from "@/components/Camera/CameraController";
import { Effects } from "@/components/Effects/Effects";
import { ScrollControls, Scroll, Environment } from "@react-three/drei";

export default function Home() {
  return (
    <main style={{ height: "100vh", width: "100vw", position: "relative", cursor: "none" }}>
      <PosterBackground />
      <BlueprintHUD />
      
      {/* Canvas wrapper must intercept pointer events for scrolling to work */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "transparent", pointerEvents: "auto" }}>
        <Canvas
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0, 15], fov: 45 }}
        >
          <CameraController />

          {/* Lighting */}
          <ambientLight intensity={1.5} color="#ffffff" />
          <directionalLight position={[10, 10, 5]} intensity={3} color="#ffffff" />
          
          <Environment preset="city" blur={0.5} />

          <ScrollControls pages={4} damping={0.1}>
            <MechanicalAssembly />
            
            {/* HTML Overlay Sections */}
            <Scroll html style={{ width: '100vw' }}>
              
              {/* PAGE 1: Intro */}
              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10vw' }}>
                <h1 style={{ fontSize: '8vw', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
                  QUANTUM<br/><span className="text-crimson">DRIVE</span>
                </h1>
                <p style={{ marginTop: '20px', maxWidth: '400px', fontSize: '14px', opacity: 0.6, letterSpacing: '0.05em' }}>
                  A next-generation biomechanical core. Scroll down to initiate the exploded view sequence and analyze internal components.
                </p>
              </div>

              {/* PAGE 2: Exploded View */}
              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10vw' }}>
                <div style={{ textAlign: 'right', maxWidth: '400px' }}>
                  <h2 className="text-jp" style={{ fontSize: '4vw', fontWeight: 900, color: 'var(--crimson)' }}>分解図</h2>
                  <h3 style={{ fontSize: '2vw', fontWeight: 700, letterSpacing: '0.1em', marginTop: '10px' }}>EXPLODED SCHEMATIC</h3>
                  <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.6, textAlign: 'justify' }}>
                    Outer containment rings disengaged. Exposing the central glass Icosahedron. Notice the connecting laser tethering system maintaining structural integrity under zero gravity.
                  </p>
                </div>
              </div>

              {/* PAGE 3: Technical Data */}
              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', padding: '10vw' }}>
                <div style={{ backgroundColor: 'rgba(244, 247, 246, 0.8)', padding: '40px', border: '1px solid var(--crimson)', backdropFilter: 'blur(10px)', mixBlendMode: 'normal' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--crimson)', marginBottom: '20px' }}>SYSTEM DIAGNOSTICS</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', width: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(17,17,17,0.1)', paddingBottom: '5px' }}>
                      <span>CORE TEMPERATURE</span>
                      <span className="text-crimson">4,000 K</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(17,17,17,0.1)', paddingBottom: '5px' }}>
                      <span>CONTAINMENT FIELD</span>
                      <span>STABLE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(17,17,17,0.1)', paddingBottom: '5px' }}>
                      <span>ENERGY OUTPUT</span>
                      <span>8.4 TW</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PAGE 4: Conclusion */}
              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 className="text-jp" style={{ fontSize: '15vw', fontWeight: 900, WebkitTextStroke: '2px var(--foreground)', color: 'transparent', opacity: 0.2 }}>
                  未来
                </h1>
                <p style={{ position: 'absolute', fontSize: '24px', fontWeight: 700, letterSpacing: '0.5em', color: 'var(--crimson)' }}>
                  END OF TRANSMISSION
                </p>
              </div>

            </Scroll>
          </ScrollControls>
          
          <Effects />
        </Canvas>
      </div>
    </main>
  );
}
