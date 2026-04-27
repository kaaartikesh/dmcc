"use client";
import { Canvas } from "@react-three/fiber";
import Globe from "@/components/three/Globe";

export default function GlobeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.8], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.3} color="#00b4ff" />
      <pointLight position={[-10, -5, 5]} intensity={0.15} color="#8b5cf6" />
      <Globe />
    </Canvas>
  );
}
