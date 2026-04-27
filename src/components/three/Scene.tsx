"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const SceneContent = dynamic(() => import("./SceneContent"), { ssr: false });

export function Scene({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Suspense fallback={<div className="w-full h-full bg-[#06060a]" />}>
        <SceneContent>{children}</SceneContent>
      </Suspense>
    </div>
  );
}
