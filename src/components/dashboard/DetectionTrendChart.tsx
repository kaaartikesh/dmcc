"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/frontend-data";
import { cn } from "@/lib/utils";

type TimeRange = "12h" | "24h";

export function DetectionTrendChart({ data }: { data: TrendPoint[] }) {
  const [range, setRange] = useState<TimeRange>("24h");
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  const filtered = range === "12h" ? data.slice(-12) : data;
  const latest = filtered[filtered.length - 1];
  const previous = filtered[filtered.length - 2];
  const peak = filtered.reduce((max, item) => Math.max(max, item.detections), 0);
  const totalDetections = filtered.reduce((sum, item) => sum + item.detections, 0);
  const totalTakedowns = filtered.reduce((sum, item) => sum + item.takedowns, 0);
  const mitigationRate = totalDetections > 0 ? Math.round((totalTakedowns / totalDetections) * 100) : 0;

  const detectionDelta = latest && previous ? latest.detections - previous.detections : 0;

  return (
    <div className="space-y-5">
      {/* Top metrics row */}
      <div className="flex items-end justify-between gap-4">
        <div className="grid gap-3 sm:grid-cols-4 flex-1">
          <TrendStat
            label="Current hour"
            value={latest?.detections ?? 0}
            detail="Active detections"
            delta={detectionDelta}
            accent="var(--color-chart-1)"
            index={0}
          />
          <TrendStat
            label="Peak hour"
            value={peak}
            detail="Detection spike"
            accent="var(--color-chart-4)"
            index={1}
          />
          <TrendStat
            label="Takedowns"
            value={latest?.takedowns ?? 0}
            detail="Mitigation actions"
            accent="var(--color-chart-2)"
            index={2}
          />
          <TrendStat
            label="Mitigation rate"
            value={`${mitigationRate}%`}
            detail="Coverage efficiency"
            accent="var(--color-chart-3)"
            index={3}
          />
        </div>
      </div>

      {/* Time range toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1">
          {(["12h", "24h"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                range === r
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              )}
            >
              {range === r && (
                <motion.div
                  layoutId="trend-range-indicator"
                  className="absolute inset-0 rounded-lg bg-white/[0.07] border border-border-strong"
                  transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                />
              )}
              <span className="relative z-10">{r}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-chart-1" />
            Detections
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-chart-2" />
            Takedowns
          </span>
        </div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="h-80 w-full"
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart data={filtered} margin={{ left: -18, right: 10, top: 12, bottom: 0 }}>
            <defs>
              <linearGradient id="trend-det-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                <stop offset="50%" stopColor="var(--color-chart-1)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="trend-tk-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.25} />
                <stop offset="50%" stopColor="var(--color-chart-2)" stopOpacity={0.08} />
                <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0.01} />
              </linearGradient>
              <filter id="glow-det">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid
              stroke="var(--color-border)"
              strokeDasharray="3 3"
              vertical={false}
              opacity={0.5}
            />
            <XAxis
              dataKey="hour"
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={range === "12h" ? 1 : 3}
              dy={8}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-4}
            />
            <Tooltip
              cursor={{ stroke: "var(--color-border-strong)", strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={{
                background: "rgba(10, 18, 28, 0.95)",
                border: "1px solid var(--color-border-strong)",
                borderRadius: 16,
                fontSize: 12,
                padding: "12px 16px",
                boxShadow: "0 20px 56px rgba(0,0,0,0.4)",
                backdropFilter: "blur(12px)",
              }}
              labelStyle={{ color: "var(--color-muted-foreground)", fontSize: 11, marginBottom: 6 }}
              itemStyle={{ padding: "2px 0" }}
            />

            <Area
              type="monotone"
              dataKey="detections"
              stroke="var(--color-chart-1)"
              strokeWidth={2.5}
              fill="url(#trend-det-grad)"
              animationDuration={1000}
              animationEasing="ease-out"
              opacity={hoveredSeries === "takedowns" ? 0.3 : 1}
              onMouseEnter={() => setHoveredSeries("detections")}
              onMouseLeave={() => setHoveredSeries(null)}
            />
            <Area
              type="monotone"
              dataKey="takedowns"
              stroke="var(--color-chart-2)"
              strokeWidth={2}
              fill="url(#trend-tk-grad)"
              animationDuration={1200}
              animationEasing="ease-out"
              opacity={hoveredSeries === "detections" ? 0.3 : 1}
              onMouseEnter={() => setHoveredSeries("takedowns")}
              onMouseLeave={() => setHoveredSeries(null)}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

function TrendStat({
  label,
  value,
  detail,
  delta,
  accent,
  index = 0,
}: {
  label: string;
  value: number | string;
  detail: string;
  delta?: number;
  accent: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group rounded-2xl border border-border bg-secondary/40 p-4 transition-all duration-200 hover:border-border-strong hover:bg-secondary/60"
    >
      <div className="text-label">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
          {value}
        </span>
        {delta !== undefined && delta !== 0 && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              delta > 0 ? "text-destructive" : "text-success"
            )}
          >
            {delta > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(delta)}
          </span>
        )}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
      {/* Mini accent bar */}
      <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "60%" }}
          transition={{ delay: 0.3 + index * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: accent }}
        />
      </div>
    </motion.div>
  );
}
