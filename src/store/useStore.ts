import { create } from "zustand";

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
}));
