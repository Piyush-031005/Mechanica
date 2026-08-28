import { create } from "zustand";

export const THEME_COLORS = {
  CYANOTYPE: {
    bg: '#00091f',       // Deep Prussian navy
    edge: '#6eb5ff',     // Cool blueprint line blue
    core: '#ffffff',     // Pure white for the glowing center
    glow: '#6eb5ff',
    dim: 'rgba(110,181,255,0.15)',
    wireframe: true,
  },
  DRAFT: {
    bg: '#f4f0e6',       // Aged engineering paper
    edge: '#1a1a1a',     // India ink black
    core: '#cc2200',     // Technical red accent
    glow: '#1a1a1a',
    dim: 'rgba(26,26,26,0.1)',
    wireframe: false,
  },
  CYBER: {
    bg: '#020408',       // Void black
    edge: '#00ccff',     // Neon cyan
    core: '#ff00aa',     // Hot magenta accent
    glow: '#00ccff',
    dim: 'rgba(0,204,255,0.1)',
    wireframe: true,
  }
};

export type ThemeMode = "CYANOTYPE" | "DRAFT" | "CYBER";

interface GameState {
  discoveryState: number;
  unlockNextState: () => void;

  // Audio state
  playMechanicalClick: () => void;
  triggerClick: number; // A number we increment to trigger the effect

  // Live camera tracking for HUD
  cameraZ: number;
  cameraY: number;
  setCameraPos: (z: number, y: number) => void;
  scrollVelocity: number;
  setScrollVelocity: (v: number) => void;

  scrollDepth: number;
  setScrollDepth: (d: number) => void;
  
  // Theme Engine
  activeTheme: ThemeMode;
  cycleTheme: () => void;

  devMode: boolean;
  toggleDevMode: () => void;
  explosion: number;
  triggerGlobalExplosion: () => void;
  resetExplosion: () => void;
}

export const useStore = create<GameState>((set) => ({
  discoveryState: 0,
  unlockNextState: () => set((state) => ({ discoveryState: state.discoveryState + 1 })),
  
  triggerClick: 0,
  playMechanicalClick: () => set((state) => ({ triggerClick: state.triggerClick + 1 })),

  cameraZ: 0,
  cameraY: 0,
  setCameraPos: (z, y) => set({ cameraZ: z, cameraY: y }),
  
  scrollVelocity: 0,
  setScrollVelocity: (v) => set({ scrollVelocity: v }),

  scrollDepth: 0,
  setScrollDepth: (d) => set({ scrollDepth: d }),

  activeTheme: "DRAFT",
  cycleTheme: () => set((state) => {
    if (state.activeTheme === "CYANOTYPE") return { activeTheme: "DRAFT" };
    if (state.activeTheme === "DRAFT") return { activeTheme: "CYBER" };
    return { activeTheme: "CYANOTYPE" };
  }),

  devMode: false,
  toggleDevMode: () => set((state) => ({ devMode: !state.devMode })),
  
  explosion: 0,
  triggerGlobalExplosion: () => set({ explosion: 1 }),
  resetExplosion: () => set({ explosion: 0 }),
}));
