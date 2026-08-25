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
            <Scroll html style={{ width: '100vw', mixBlendMode: 'multiply' }}>
              
              {/* PAGE 1: Intro */}
              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10vw' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.2em', opacity: 0.5, marginBottom: '20px' }}>ARCHIVE ENTRY // 001</div>
                <h1 style={{ fontSize: '8vw', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
                  ORGAN 01<br/><span className="text-crimson">OPTICAL NERVE</span>
                </h1>
                <p style={{ marginTop: '20px', maxWidth: '400px', fontSize: '14px', opacity: 0.7, letterSpacing: '0.05em' }}>
                  A microscopic component of the Colossus. Deciphering the glass core geometry.
                  <br/><br/>
                  *Drag your cursor across the manuscript to materialize the artifact.*
                </p>
              </div>

              {/* PAGE 2: Exploded View */}
              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10vw' }}>
                <div style={{ textAlign: 'right', maxWidth: '400px' }}>
                  <h2 className="text-jp" style={{ fontSize: '4vw', fontWeight: 900, color: 'var(--crimson)' }}>解剖図</h2>
                  <h3 style={{ fontSize: '2vw', fontWeight: 700, letterSpacing: '0.1em', marginTop: '10px' }}>ANATOMICAL BREAKDOWN</h3>
                  <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7, textAlign: 'justify' }}>
                    Outer titanium arteries disengaged. The central refraction sphere acts as a memory lens. We believe the entire machine is dreaming.
                  </p>
                </div>
              </div>

              {/* PAGE 3: Technical Data */}
              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', padding: '10vw' }}>
                <div style={{ padding: '40px', border: '1px solid var(--foreground)', backgroundColor: 'rgba(240, 234, 221, 0.5)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--crimson)', marginBottom: '20px' }}>FIELD NOTES</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', width: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(44, 40, 37, 0.2)', paddingBottom: '5px' }}>
                      <span>MATERIAL</span>
                      <span className="text-crimson">UNKNOWN GLASS</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(44, 40, 37, 0.2)', paddingBottom: '5px' }}>
                      <span>LIFECYCLE</span>
                      <span>DORMANT</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(44, 40, 37, 0.2)', paddingBottom: '5px' }}>
                      <span>SCALE</span>
                      <span>1:1000000000</span>
                    </div>
                  </div>
                  <p style={{ marginTop: '20px', fontSize: '10px', fontStyle: 'italic', opacity: 0.6 }}>
                    Note to self: The universe might be inside this sphere.
                  </p>
                </div>
              </div>

              {/* PAGE 4: Conclusion */}
              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 className="text-jp" style={{ fontSize: '15vw', fontWeight: 900, WebkitTextStroke: '2px var(--foreground)', color: 'transparent', opacity: 0.1 }}>
                  巨像
                </h1>
                <p style={{ position: 'absolute', fontSize: '24px', fontWeight: 700, letterSpacing: '0.5em', color: 'var(--crimson)' }}>
                  THE COLOSSUS SLEEPS
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
