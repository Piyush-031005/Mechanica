import { Sparkles, Environment } from "@react-three/drei";
import { useStore } from "@/store/useStore";

export function OmniBlueprintGrid() {
  const isMutated = useStore((state) => state.isDismantled);
  
  return (
    <>
      <color attach="background" args={isMutated ? ['#050002'] : ['#020502']} />
      
      {/* Floating cinematic dust */}
      <Sparkles 
        count={200} 
        scale={20} 
        size={2} 
        speed={0.2} 
        opacity={isMutated ? 0.8 : 0.4}
        color={isMutated ? "#ff0033" : "#39ff14"} 
      />
      
      <Sparkles 
        count={50} 
        scale={15} 
        size={4} 
        speed={0.5} 
        opacity={0.2}
        color="#ffffff" 
      />
      
      {/* Soft ambient environment lighting */}
      <Environment preset="city" environmentIntensity={0.2} />
    </>
  );
}
