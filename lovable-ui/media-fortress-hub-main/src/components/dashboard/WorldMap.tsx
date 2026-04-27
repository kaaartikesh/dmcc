import { motion } from "framer-motion";
import { mapPoints } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const sevColor: Record<string, string> = {
  critical: "var(--color-destructive)",
  high: "var(--color-warning)",
  medium: "var(--color-primary)",
  low: "var(--color-success)",
};

// Simplified world map (continents only) for SSR-safe SVG visualization
const continents = [
  // Very rough silhouettes — purely decorative
  "M5,30 L18,28 L22,40 L30,42 L32,55 L24,62 L14,58 L8,46 Z",
  "M22,28 L30,24 L34,30 L30,38 L24,38 Z",
  "M44,18 L56,14 L62,22 L60,32 L52,38 L46,30 Z",
  "M40,38 L52,38 L58,52 L48,68 L40,62 Z",
  "M62,22 L78,18 L88,24 L88,40 L74,46 L62,40 Z",
  "M76,58 L88,56 L92,68 L84,74 L76,70 Z",
];

export function WorldMap() {
  return (
    <div className="relative h-72 w-full overflow-hidden rounded-lg border border-border bg-surface/40">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <svg viewBox="0 0 100 80" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        {continents.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="var(--color-surface-elevated)"
            stroke="var(--color-border-strong)"
            strokeWidth={0.2}
          />
        ))}

        {mapPoints.map((p, i) => (
          <g key={p.code}>
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={1.2}
              fill={sevColor[p.severity]}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
            />
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={1.2}
              fill="none"
              stroke={sevColor[p.severity]}
              strokeWidth={0.2}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 2.4, delay: i * 0.2, repeat: Infinity, ease: "easeOut" }}
            />
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        {(["critical", "high", "medium", "low"] as const).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className={cn("h-1.5 w-1.5 rounded-full")}
              style={{ background: sevColor[s] }}
            />
            <span className="capitalize">{s}</span>
          </div>
        ))}
      </div>

      {/* Stat */}
      <div className="absolute top-3 right-3 rounded-md border border-border glass px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Live regions
        </div>
        <div className="text-lg font-semibold tabular-nums gradient-text">
          {mapPoints.reduce((acc, p) => acc + p.count, 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
