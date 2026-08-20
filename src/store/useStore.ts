import { create } from "zustand";

interface AppState {
  devMode: boolean;
  globalExplosion: boolean;
  toggleDevMode: () => void;
  triggerGlobalExplosion: () => void;
  resetExplosion: () => void;
  
  // Audio state
  playMechanicalClick: () => void;
  triggerClick: number; // A number we increment to trigger the effect

  // Live camera tracking for HUD
  cameraZ: number;
  cameraY: number;
  setCameraPos: (z: number, y: number) => void;
}

export const useStore = create<AppState>((set) => ({
  devMode: false,
  globalExplosion: false,
  toggleDevMode: () => set((state) => ({ devMode: !state.devMode })),
  triggerGlobalExplosion: () => set({ globalExplosion: true }),
  resetExplosion: () => set({ globalExplosion: false }),
  
  triggerClick: 0,
  playMechanicalClick: () => set((state) => ({ triggerClick: state.triggerClick + 1 })),

  cameraZ: 0,
  cameraY: 0,
  setCameraPos: (z, y) => set({ cameraZ: z, cameraY: y }),
}));
