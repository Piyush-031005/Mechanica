"use client";

import { BlueprintHUD } from "@/components/UI/BlueprintHUD";
import { MechanicalAssembly } from "@/components/Artifacts/MechanicalAssembly";
import { PosterBackground } from "@/components/Environment/PosterBackground";
import { Canvas } from "@react-three/fiber";
import { CameraController } from "@/components/Camera/CameraController";
import { Effects } from "@/components/Effects/Effects";
import { ScrollControls, Scroll, Environment } from "@react-three/drei";

import { ArcaneGeometry } from "@/components/Environment/ArcaneGeometry";
import { NeuralJellyfish } from "@/components/Artifacts/NeuralJellyfish";

export default function Home() {
  return (
    <main style={{ height: "100vh", width: "100vw", position: "relative", cursor: "none" }}>
      <PosterBackground />
      <BlueprintHUD />
      
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "transparent", pointerEvents: "auto" }}>
        <Canvas
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance", localClippingEnabled: true }}
          camera={{ position: [0, 0, 15], fov: 45 }}
        >
          <CameraController />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} />
          <Environment preset="city" />
          <ArcaneGeometry />
          
          <ScrollControls pages={8} damping={0.1}>
            <MechanicalAssembly />
            <NeuralJellyfish />
            
            <Scroll html style={{ width: '100vw', mixBlendMode: 'multiply' }}>
              
              {/* PAGE 1-4: ORGAN 01 (OPTICAL NERVE) */}
              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10vw' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.2em', opacity: 0.5, marginBottom: '20px' }}>ARCHIVE ENTRY // 001</div>
                <h1 style={{ fontSize: '8vw', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
                  ORGAN 01<br/><span className="text-crimson">OPTICAL NERVE</span>
                </h1>
                <p style={{ marginTop: '20px', maxWidth: '400px', fontSize: '14px', opacity: 0.7, letterSpacing: '0.05em' }}>
                  A microscopic component of the Colossus. Deciphering the glass core geometry.
                </p>
              </div>

              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10vw' }}>
                <div style={{ textAlign: 'right', maxWidth: '400px' }}>
                  <h2 className="text-jp" style={{ fontSize: '4vw', fontWeight: 900, color: 'var(--crimson)' }}>解剖図</h2>
                  <h3 style={{ fontSize: '2vw', fontWeight: 700, letterSpacing: '0.1em', marginTop: '10px' }}>ANATOMICAL BREAKDOWN</h3>
                  <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7, textAlign: 'justify' }}>
                    Outer titanium arteries disengaged. The central refraction sphere acts as a memory lens.
                  </p>
                </div>
              </div>

              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', padding: '10vw' }}>
                <div style={{ padding: '40px', border: '1px solid var(--foreground)', backgroundColor: 'rgba(240, 234, 221, 0.5)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--crimson)', marginBottom: '20px' }}>FIELD NOTES</h3>
                  <p style={{ fontSize: '10px', fontStyle: 'italic', opacity: 0.6 }}>
                    Note to self: The universe might be inside this sphere.
                  </p>
                </div>
              </div>

              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 className="text-jp" style={{ fontSize: '15vw', fontWeight: 900, WebkitTextStroke: '2px var(--foreground)', color: 'transparent', opacity: 0.1 }}>
                  巨像
                </h1>
                <p style={{ position: 'absolute', fontSize: '24px', fontWeight: 700, letterSpacing: '0.5em', color: 'var(--crimson)' }}>
                  ZOOMING IN...
                </p>
              </div>

              {/* PAGE 5-8: ORGAN 02 (NEURAL PARASITE) */}
              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', padding: '10vw' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '0.2em', opacity: 0.5, marginBottom: '20px' }}>ARCHIVE ENTRY // 002</div>
                  <h1 style={{ fontSize: '8vw', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
                    ORGAN 02<br/><span className="text-crimson">NEURAL PARASITE</span>
                  </h1>
                  <p style={{ marginTop: '20px', maxWidth: '400px', fontSize: '14px', opacity: 0.7, letterSpacing: '0.05em', marginLeft: 'auto' }}>
                    A primitive deep-sea mechanism. It powers the colossal network through bioluminescent thought.
                  </p>
                </div>
              </div>

              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '10vw' }}>
                <div style={{ maxWidth: '400px' }}>
                  <h2 className="text-jp" style={{ fontSize: '4vw', fontWeight: 900, color: 'var(--crimson)' }}>深海</h2>
                  <h3 style={{ fontSize: '2vw', fontWeight: 700, letterSpacing: '0.1em', marginTop: '10px' }}>BIOLOGICAL KINEMATICS</h3>
                  <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7, textAlign: 'justify' }}>
                    The eight tentacles wriggle mathematically using complex sine waves. It appears fossilized, but dragging your light across it awakens the bioluminescence.
                  </p>
                </div>
              </div>
              
              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10vw' }}>
                <div style={{ padding: '40px', border: '1px solid var(--foreground)', backgroundColor: 'rgba(240, 234, 221, 0.5)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.2em', color: 'var(--crimson)', marginBottom: '20px' }}>MATERIAL ANALYSIS</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', width: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(44, 40, 37, 0.2)', paddingBottom: '5px' }}>
                      <span>DOME SHELL</span>
                      <span className="text-crimson">FOSSILIZED IRON / NEON GLASS</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(44, 40, 37, 0.2)', paddingBottom: '5px' }}>
                      <span>CORE</span>
                      <span>LIQUID ENERGY</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 className="text-jp" style={{ fontSize: '15vw', fontWeight: 900, WebkitTextStroke: '2px var(--foreground)', color: 'transparent', opacity: 0.1 }}>
                  復活
                </h1>
                <p style={{ position: 'absolute', fontSize: '24px', fontWeight: 700, letterSpacing: '0.5em', color: 'var(--crimson)' }}>
                  RESURRECTION
                </p>
              </div>

            </Scroll>
            
            <Effects />
          </ScrollControls>
        </Canvas>
      </div>
    </main>
  );
}
