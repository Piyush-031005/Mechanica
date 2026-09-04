"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Sparkles } from "@react-three/drei";
import { motion } from "framer-motion";
import { Suspense, useState } from "react";
import { SymbioteCore } from "../Artifacts/SymbioteCore";
import { ArachnidCore } from "../Artifacts/ArachnidCore";

export function AnomalySection() {
  const [activeArtifact, setActiveArtifact] = useState<"SYMBIOTE" | "ARACHNID">("SYMBIOTE");
  
  const bebas = { fontFamily: "'Bebas Neue', sans-serif" };
  const mono  = { fontFamily: "'Space Mono', monospace" };
  const tag   = { ...mono, letterSpacing: ".3em", textTransform: "uppercase" as const };

  return (
    <section className="relative w-full h-[100vh] bg-black border-t border-red-900/30 overflow-hidden flex flex-col items-center justify-center">
      
      {/* Background Matrix/Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at center, #ff003c 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      
      <div className="absolute top-10 w-full text-center z-10 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ ...tag, color: "#ff003c", fontSize: 12, marginBottom: 10 }}
        >
          Containment Breach Detected
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ ...bebas, fontSize: "4rem", color: "#fff", textShadow: "0 0 30px rgba(255,0,60,0.5)" }}
        >
          UNIDENTIFIED ANOMALIES
        </motion.h2>
        <p style={{ ...mono, color: "#aaa", fontSize: "0.9rem", maxWidth: "600px", margin: "0 auto", marginTop: "10px" }}>
          Interaction with unknown DNA structures recommended only for Level 20 clearance personnel. Click and drag to inspect the structural integrity of the samples.
        </p>

        <div className="flex gap-4 justify-center mt-6">
          <button 
            onClick={() => setActiveArtifact("SYMBIOTE")}
            className={`px-6 py-2 border font-space text-sm tracking-widest transition-all ${activeArtifact === "SYMBIOTE" ? "border-red-500 bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(255,0,0,0.3)]" : "border-gray-800 text-gray-500 hover:border-gray-600"}`}
          >
            SAMPLE // KLYNTAR
          </button>
          <button 
            onClick={() => setActiveArtifact("ARACHNID")}
            className={`px-6 py-2 border font-space text-sm tracking-widest transition-all ${activeArtifact === "ARACHNID" ? "border-red-500 bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(255,0,0,0.3)]" : "border-gray-800 text-gray-500 hover:border-gray-600"}`}
          >
            SAMPLE // ARACHNID
          </button>
        </div>
      </div>

      <div className="w-full h-full absolute inset-0 z-0 pt-32 pb-20">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <color attach="background" args={["#020202"]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} color="#ff003c" />
          <directionalLight position={[-10, -10, -5]} intensity={1} color="#00e5ff" />
          
          <Suspense fallback={null}>
            <Environment preset="city" />
            <Sparkles count={200} scale={10} size={2} speed={0.4} color="#ff003c" opacity={0.5} />
            
            {activeArtifact === "SYMBIOTE" && <SymbioteCore />}
            {activeArtifact === "ARACHNID" && <ArachnidCore />}
          </Suspense>
          
          <OrbitControls 
            enablePan={false} 
            enableZoom={false} 
            autoRotate={true}
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
      </div>
      
    </section>
  );
}
