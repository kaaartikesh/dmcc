"use client";

import { cn } from "@/lib/utils";

export type ThreatLevel = "high" | "medium" | "low";

const config: Record<
  ThreatLevel,
  { bg: string; text: string; border: string; dot: string; glow: string }
> = {
  high: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    dot: "bg-red-400",
    glow: "shadow-[0_0_6px_rgba(239,68,68,0.4)]",
  },
  medium: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
    dot: "bg-orange-400",
    glow: "shadow-[0_0_6px_rgba(249,115,22,0.3)]",
  },
  low: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
    glow: "",
  },
};

export function ThreatBadge({
  level,
  score,
  className,
}: {
  level: ThreatLevel;
  score?: number;
  className?: string;
}) {
  const c = config[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-all",
        c.bg,
        c.text,
        c.border,
        c.glow,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {level === "high" && (
          <span
            className={cn(
              "absolute inset-0 animate-ping rounded-full opacity-60",
              c.dot
            )}
          />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", c.dot)} />
      </span>
      {score !== undefined ? `${score}` : level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

export function SimilarityBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const level: ThreatLevel = score >= 85 ? "high" : score >= 60 ? "medium" : "low";
  const c = config[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold tabular-nums",
        c.bg,
        c.text,
        c.border,
        className
      )}
    >
      {score.toFixed(1)}%
    </span>
  );
}

export function ThreatScorePill({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const level: ThreatLevel = score >= 75 ? "high" : score >= 45 ? "medium" : "low";
  const c = config[level];
  const pct = Math.min(100, Math.max(0, score));

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative h-1.5 w-16 overflow-hidden rounded-full bg-white/5">
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500", c.dot)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cn("font-mono text-xs font-semibold tabular-nums", c.text)}>
        {score}
      </span>
    </div>
  );
}
