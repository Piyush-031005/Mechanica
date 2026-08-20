"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

export function AudioSystem() {
  const triggerClick = useStore((state) => state.triggerClick);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context on first interaction (required by browsers)
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    
    window.addEventListener("click", initAudio, { once: true });
    
    return () => {
      window.removeEventListener("click", initAudio);
    };
  }, []);

  useEffect(() => {
    if (triggerClick > 0 && audioCtxRef.current) {
      // Create a short, mechanical "tick" sound procedurally
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Square wave gives it a slightly more metallic/digital feel
      osc.type = "square";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  }, [triggerClick]);

  return null;
}
