"use client";

import { BlueprintHUD } from "@/components/UI/BlueprintHUD";
import { CyberMask } from "@/components/Artifacts/CyberMask";
import { PosterBackground } from "@/components/Environment/PosterBackground";
import { Canvas } from "@react-three/fiber";
import { CameraController } from "@/components/Camera/CameraController";
import { Effects } from "@/components/Effects/Effects";
import { ScrollControls, Scroll, Environment } from "@react-three/drei";

import { CyberBird } from "@/components/Artifacts/CyberBird";
import { ArachnidCore } from "@/components/Artifacts/ArachnidCore";
import { TheCore } from "@/components/Artifacts/TheCore";
import { AudioSystem } from "@/components/Mechanics/AudioSystem";
import { SecretManager } from "@/components/Mechanics/SecretManager";
import { FluidVortex } from "@/components/Environment/FluidVortex";
import { RealitySplit } from "@/components/Effects/RealitySplit";

export default function Home() {
  return (
    <main style={{ height: "100vh", width: "100vw", position: "relative", cursor: "none" }}>
      <PosterBackground />
      <BlueprintHUD />
      <AudioSystem />
      
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "transparent", pointerEvents: "auto" }}>
        <Canvas
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance", localClippingEnabled: true }}
          camera={{ position: [0, 0, 15], fov: 45 }}
        >
          <ScrollControls pages={16} damping={0.1}>
            <CameraController />
            <FluidVortex />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={2} />
            {/* Removed Environment preset to fix network fetch crash */}
            <ambientLight intensity={0.2} />
            <directionalLight position={[10, 10, 10]} intensity={0.5} />
            <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#333333" />
            
            {/* Hidden Developer / Easter Egg Mechanics */}
            <SecretManager />
            <CyberMask />
            <CyberBird />
            <ArachnidCore />
            <TheCore />
            <Scroll html style={{ width: '100vw', mixBlendMode: 'normal' }}>
              
              {/* PAGE 1-4: ORGAN 01 (OPTICAL NERVE) */}
              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10vw' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.2em', opacity: 0.5, marginBottom: '20px' }}>ARCHIVE ENTRY // 001</div>
                <h1 style={{ fontSize: '8vw', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.02em', color: 'var(--text-color)' }}>
                  ORGAN 01<br/><span style={{ color: 'var(--accent-magenta)' }}>CYBER MASK</span>
                </h1>
                <p style={{ marginTop: '20px', maxWidth: '400px', fontSize: '14px', opacity: 0.7, letterSpacing: '0.05em' }}>
                  A majestic, perfectly symmetrical God Mask. The central eye sees across multiple realities simultaneously.
                </p>
              </div>
              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10vw' }}>
                <div style={{ textAlign: 'right', maxWidth: '400px' }}>
                  <h2 className="text-jp" style={{ fontSize: '4vw', fontWeight: 900, color: '#fbbf24' }}>神の顔</h2>
                  <h3 style={{ fontSize: '2vw', fontWeight: 700, letterSpacing: '0.1em', marginTop: '10px' }}>DIVINE SYMMETRY</h3>
                  <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7, textAlign: 'justify' }}>
                    Geometric wings unfold mathematically on command. The intersecting halos maintain absolute balance against the void.
                  </p>
                </div>
              </div>

              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', padding: '10vw' }}>
                <div style={{ padding: '40px', border: '1px solid #34d399', backgroundColor: 'rgba(240, 234, 221, 0.1)', backdropFilter: 'blur(5px)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.2em', color: '#ff007f', marginBottom: '20px' }}>FIELD NOTES</h3>
                  <p style={{ fontSize: '10px', fontStyle: 'italic', opacity: 0.8 }}>
                    Note to self: The universe might be inside this sphere.
                  </p>
                </div>
              </div>

              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 className="text-jp" style={{ fontSize: '15vw', fontWeight: 900, WebkitTextStroke: '2px var(--text-color)', color: 'transparent', opacity: 0.1 }}>
                  巨像
                </h1>
                <p style={{ position: 'absolute', fontSize: '24px', fontWeight: 700, letterSpacing: '0.5em', color: '#ff007f' }}>
                  ZOOMING IN...
                </p>
              </div>

              {/* PAGE 5-8: ORGAN 02 (THE PHOENIX) */}
              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', padding: '10vw' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '0.2em', opacity: 0.5, marginBottom: '20px' }}>ARCHIVE ENTRY // 002</div>
                  <h1 style={{ fontSize: '8vw', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.02em', color: 'var(--text-color)' }}>
                    ORGAN 02<br/><span style={{ color: '#ff007f' }}>CYBER PHOENIX</span>
                  </h1>
                  <p style={{ marginTop: '20px', maxWidth: '400px', fontSize: '14px', opacity: 0.7, letterSpacing: '0.05em', marginLeft: 'auto' }}>
                    A majestic deep-sea mechanical bird. It powers the Colossus with massive mathematical wings.
                  </p>
                </div>
              </div>

              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '10vw' }}>
                <div style={{ maxWidth: '400px' }}>
                  <h2 className="text-jp" style={{ fontSize: '4vw', fontWeight: 900, color: '#fbbf24' }}>不死鳥</h2>
                  <h3 style={{ fontSize: '2vw', fontWeight: 700, letterSpacing: '0.1em', marginTop: '10px' }}>FLUID KINEMATICS</h3>
                  <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7, textAlign: 'justify' }}>
                    Composed of hundreds of independent glass feathers that ripple and flap through complex sine wave orchestration.
                  </p>
                </div>
              </div>
              
              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10vw' }}>
                <div style={{ padding: '40px', border: '1px solid #34d399', backgroundColor: 'rgba(240, 234, 221, 0.1)', backdropFilter: 'blur(5px)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.2em', color: '#ff007f', marginBottom: '20px' }}>MATERIAL ANALYSIS</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', width: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(44, 40, 37, 0.2)', paddingBottom: '5px' }}>
                      <span>LEFT SECTOR</span>
                      <span style={{ color: '#34d399' }}>NEON WIREFRAME</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(44, 40, 37, 0.2)', paddingBottom: '5px' }}>
                      <span>RIGHT SECTOR</span>
                      <span style={{ color: '#00ffff' }}>SOLID GLASS / CYAN OPTICS</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 className="text-jp" style={{ fontSize: '15vw', fontWeight: 900, WebkitTextStroke: '2px var(--text-color)', color: 'transparent', opacity: 0.1 }}>
                  覚醒
                </h1>
                <p style={{ position: 'absolute', fontSize: '24px', fontWeight: 700, letterSpacing: '0.5em', color: '#ff007f' }}>
                  AWAKENING
                </p>
              </div>

              {/* PAGE 9-12: ORGAN 03 (THE SPINE) */}
              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10vw' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.2em', opacity: 0.5, marginBottom: '20px' }}>ARCHIVE ENTRY // 003</div>
                <h1 style={{ fontSize: '8vw', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.02em', color: 'var(--text-color)' }}>
                  ORGAN 03<br/><span style={{ color: '#ff0033' }}>ARACHNID CORE</span>
                </h1>
                <p style={{ marginTop: '20px', maxWidth: '400px', fontSize: '14px', opacity: 0.7, letterSpacing: '0.05em' }}>
                  A biomechanical terror. An 8-legged segmented entity suspended in a mathematically perfect 3D silk web.
                </p>
              </div>

              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10vw' }}>
                <div style={{ textAlign: 'right', maxWidth: '400px' }}>
                  <h2 className="text-jp" style={{ fontSize: '4vw', fontWeight: 900, color: '#ffffff' }}>蜘蛛の巣</h2>
                  <h3 style={{ fontSize: '2vw', fontWeight: 700, letterSpacing: '0.1em', marginTop: '10px', color: '#ff0033' }}>NEURAL WEB</h3>
                  <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7, textAlign: 'justify' }}>
                    Upon dismantling, the biological structure aggressively snaps flat, stretching the web into a flawless 2D technical vector map.
                  </p>
                </div>
              </div>

              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', padding: '10vw' }}>
                <div style={{ padding: '40px', border: '1px solid #34d399', backgroundColor: 'rgba(240, 234, 221, 0.1)', backdropFilter: 'blur(5px)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.2em', color: '#ff007f', marginBottom: '20px' }}>MATERIAL ANALYSIS</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', width: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(44, 40, 37, 0.2)', paddingBottom: '5px' }}>
                      <span>VERTEBRAE</span>
                      <span style={{ color: '#111111' }}>HEAVY DARK METAL</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(44, 40, 37, 0.2)', paddingBottom: '5px' }}>
                      <span>ENERGY DISCS</span>
                      <span style={{ color: '#ff0000' }}>BLAZING RED PLASMA</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 className="text-jp" style={{ fontSize: '15vw', fontWeight: 900, WebkitTextStroke: '2px var(--text-color)', color: 'transparent', opacity: 0.1 }}>
                  深淵
                </h1>
                <p style={{ position: 'absolute', fontSize: '24px', fontWeight: 700, letterSpacing: '0.5em', color: '#ff007f' }}>
                  THE ABYSS
                </p>
              </div>

              {/* PAGE 13-16: ORGAN 04 (THE CORE) */}
              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', padding: '10vw' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', letterSpacing: '0.2em', opacity: 0.5, marginBottom: '20px' }}>ARCHIVE ENTRY // 004</div>
                  <h1 style={{ fontSize: '8vw', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.02em', color: 'var(--text-color)' }}>
                    ORGAN 04<br/><span style={{ color: '#ffbf00' }}>THE CORE</span>
                  </h1>
                  <p style={{ marginTop: '20px', maxWidth: '400px', fontSize: '14px', opacity: 0.7, letterSpacing: '0.05em', marginLeft: 'auto' }}>
                    The heart of the Colossus. A contained Dyson sphere harnessing the power of a miniature dying sun.
                  </p>
                </div>
              </div>

              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '10vw' }}>
                <div style={{ maxWidth: '400px' }}>
                  <h2 className="text-jp" style={{ fontSize: '4vw', fontWeight: 900, color: '#ff007f' }}>核</h2>
                  <h3 style={{ fontSize: '2vw', fontWeight: 700, letterSpacing: '0.1em', marginTop: '10px' }}>DYSON ARCHITECTURE</h3>
                  <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7, textAlign: 'justify' }}>
                    Concentric geometric rings orbit the sun at wildly varying speeds, shifting into overdrive when the global explosion mechanic is triggered.
                  </p>
                </div>
              </div>
              
              <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '10vw' }}>
                <div style={{ padding: '40px', border: '1px solid #ffbf00', backgroundColor: 'rgba(240, 234, 221, 0.1)', backdropFilter: 'blur(5px)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.2em', color: '#ff007f', marginBottom: '20px' }}>CRITICAL WARNING</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', width: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(44, 40, 37, 0.2)', paddingBottom: '5px' }}>
                      <span style={{ color: '#ff0000', fontWeight: 700 }}>HOLD SPACEBAR TO INITIATE SHATTER MECHANIC</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1 className="text-jp" style={{ fontSize: '15vw', fontWeight: 900, WebkitTextStroke: '2px var(--text-color)', color: 'transparent', opacity: 0.1 }}>
                  神
                </h1>
                <p style={{ position: 'absolute', fontSize: '24px', fontWeight: 700, letterSpacing: '0.5em', color: '#ffbf00' }}>
                  THE CREATOR
                </p>
              </div>

            </Scroll>
            
            <Effects />
          </ScrollControls>
        </Canvas>
      </div>

      <RealitySplit />
    </main>
  );
}
