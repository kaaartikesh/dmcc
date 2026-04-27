import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MapPoint } from "@/lib/frontend-data";

const severityColor: Record<string, string> = {
  critical: "var(--color-destructive)",
  high: "var(--color-warning)",
  medium: "var(--color-primary)",
  low: "var(--color-success)",
};

const continents = [
  "M5,30 L18,28 L22,40 L30,42 L32,55 L24,62 L14,58 L8,46 Z",
  "M22,28 L30,24 L34,30 L30,38 L24,38 Z",
  "M44,18 L56,14 L62,22 L60,32 L52,38 L46,30 Z",
  "M40,38 L52,38 L58,52 L48,68 L40,62 Z",
  "M62,22 L78,18 L88,24 L88,40 L74,46 L62,40 Z",
  "M76,58 L88,56 L92,68 L84,74 L76,70 Z",
];

export function WorldMap({ points }: { points: MapPoint[] }) {
  return (
    <div className="relative h-72 w-full overflow-hidden rounded-lg border border-border bg-surface/40">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <svg viewBox="0 0 100 80" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        {continents.map((path, index) => (
          <path
            key={index}
            d={path}
            fill="var(--color-surface-elevated)"
            stroke="var(--color-border-strong)"
            strokeWidth={0.2}
          />
        ))}

        {points.map((point, index) => (
          <g key={point.code}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r={1.2}
              fill={severityColor[point.severity]}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.05, type: "spring", stiffness: 300, damping: 20 }}
            />
            <motion.circle
              cx={point.x}
              cy={point.y}
              r={1.2}
              fill="none"
              stroke={severityColor[point.severity]}
              strokeWidth={0.2}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 2.4, delay: index * 0.2, repeat: Infinity, ease: "easeOut" }}
            />
          </g>
        ))}
      </svg>

      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        {(["critical", "high", "medium", "low"] as const).map((severity) => (
          <div key={severity} className="flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full")} style={{ background: severityColor[severity] }} />
            <span className="capitalize">{severity}</span>
          </div>
        ))}
      </div>

      <div className="glass absolute right-3 top-3 rounded-md border border-border px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Live regions</div>
        <div className="gradient-text text-lg font-semibold tabular-nums">
          {points.reduce((count, point) => count + point.count, 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
