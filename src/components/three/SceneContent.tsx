"use client";
import { Canvas } from "@react-three/fiber";
import { ReactNode } from "react";

export default function SceneContent({ children }: { children?: ReactNode }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      {children}
    </Canvas>
  );
}
