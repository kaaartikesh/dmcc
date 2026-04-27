"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { DETECTION_LOCATIONS } from "@/lib/constants";
import { RISK_LEVELS } from "@/lib/constants";

const Scene = dynamic(() => import("./GlobeScene"), { ssr: false });

function GlobeLoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-2 border-[rgba(0,180,255,0.2)] border-t-[#00b4ff] animate-spin" />
    </div>
  );
}

export function GlobeVisualization() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Global Threat Map</h3>
        <div className="flex items-center gap-3">
          {(["critical", "high", "medium", "low"] as const).map((r) => (
            <div key={r} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: RISK_LEVELS[r].color }} />
              <span className="text-[10px] text-[#555570]">{RISK_LEVELS[r].label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 relative rounded-xl overflow-hidden bg-[rgba(0,0,0,0.3)]">
        <Suspense fallback={<GlobeLoadingFallback />}>
          <Scene />
        </Suspense>
        {/* Location labels overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex flex-wrap gap-1.5">
            {DETECTION_LOCATIONS.filter(l => l.risk === "critical" || l.risk === "high").slice(0, 5).map((loc) => (
              <span
                key={loc.label}
                className="text-[9px] px-1.5 py-0.5 rounded-full backdrop-blur-sm"
                style={{ 
                  background: RISK_LEVELS[loc.risk].bg, 
                  color: RISK_LEVELS[loc.risk].color,
                  border: `1px solid ${RISK_LEVELS[loc.risk].border}`,
                }}
              >
                {loc.label}: {loc.count}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
