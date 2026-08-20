"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Stats } from "@react-three/drei";

export function SecretManager() {
  const { toggleDevMode, triggerGlobalExplosion, resetExplosion, devMode } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        toggleDevMode();
      }
      if (e.key === " ") {
        e.preventDefault();
        triggerGlobalExplosion();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        resetExplosion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [toggleDevMode, triggerGlobalExplosion, resetExplosion]);

  return (
    <>
      {devMode && <Stats showPanel={0} className="stats-panel" />}
    </>
  );
}
