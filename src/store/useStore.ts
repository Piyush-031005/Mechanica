import { create } from "zustand";

export const THEME_COLORS = {
  CYANOTYPE: {
    bg: '#e6e6e6', // Off-white poster paper
    edge: '#00ffff', // Cyan ink
    core: '#0000ff', // Deep blue ink
    glow: '#00ffff', // Cyan highlight
    dim: 'rgba(0,0,255,0.2)',
    wireframe: true,
  },
  DRAFT: {
    bg: '#dedbd2', // Grunge parchment
    edge: '#111111', // Heavy black ink
    core: '#ff0000', // Pure Red overprint
    glow: '#000000', // Black shadow
    dim: 'rgba(255,0,0,0.2)',
    wireframe: false,
  },
  CYBER: {
    bg: '#050505', // Pitch black
    edge: '#ff0055', // Neon Pink
    core: '#ccff00', // Acid Yellow
    glow: '#9900ff', // Deep Purple
    dim: 'rgba(255,0,85,0.2)',
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
  
  // Theme Engine
  activeTheme: ThemeMode;
  cycleTheme: () => void;

  devMode: boolean;
  toggleDevMode: () => void;
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

  activeTheme: "CYANOTYPE",
  cycleTheme: () => set((state) => {
    if (state.activeTheme === "CYANOTYPE") return { activeTheme: "DRAFT" };
    if (state.activeTheme === "DRAFT") return { activeTheme: "CYBER" };
    return { activeTheme: "CYANOTYPE" };
  }),

  devMode: false,
  toggleDevMode: () => set((state) => ({ devMode: !state.devMode })),
  triggerGlobalExplosion: () => set({ triggerClick: Math.random() }),
  resetExplosion: () => set({ triggerClick: 0 }),
}));
