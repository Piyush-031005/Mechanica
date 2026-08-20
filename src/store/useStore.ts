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
}

export const useStore = create<AppState>((set) => ({
  devMode: false,
  globalExplosion: false,
  toggleDevMode: () => set((state) => ({ devMode: !state.devMode })),
  triggerGlobalExplosion: () => set({ globalExplosion: true }),
  resetExplosion: () => set({ globalExplosion: false }),
  
  triggerClick: 0,
  playMechanicalClick: () => set((state) => ({ triggerClick: state.triggerClick + 1 })),
}));
