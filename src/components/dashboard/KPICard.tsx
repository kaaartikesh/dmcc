"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import type { DashboardKpi } from "@/lib/frontend-data";

const tones = {
  default: {
    accent: "var(--color-chart-1)",
    accentRgb: "77, 172, 247",
    soft: "bg-primary/10 text-primary",
    glow: "shadow-[0_0_24px_rgba(77,172,247,0.12)]",
    border: "hover:border-primary/30",
  },
  success: {
    accent: "var(--color-chart-2)",
    accentRgb: "122, 230, 162",
    soft: "bg-success/10 text-success",
    glow: "shadow-[0_0_24px_rgba(122,230,162,0.12)]",
    border: "hover:border-success/30",
  },
  warning: {
    accent: "var(--color-chart-4)",
    accentRgb: "245, 181, 68",
    soft: "bg-warning/10 text-warning",
    glow: "shadow-[0_0_24px_rgba(245,181,68,0.12)]",
    border: "hover:border-warning/30",
  },
  danger: {
    accent: "var(--color-chart-5)",
    accentRgb: "240, 94, 120",
    soft: "bg-destructive/10 text-destructive",
    glow: "shadow-[0_0_24px_rgba(240,94,120,0.12)]",
    border: "hover:border-destructive/30",
  },
} as const;

export function KpiCard({
  kpi,
  index = 0,
  featured = false,
}: {
  kpi: DashboardKpi;
  index?: number;
  featured?: boolean;
}) {
  const positive = kpi.delta >= 0;
  const tone = tones[kpi.tone ?? "default"];
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    kpi.unit === "%" ? latest.toFixed(1) : Math.round(latest).toLocaleString()
  );
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const controls = animate(count, kpi.value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.15 + index * 0.08,
    });
    return controls.stop;
  }, [count, index, kpi.value]);

  const data = kpi.spark.map((value, sparkIndex) => ({ sparkIndex, value }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "group relative overflow-hidden rounded-[1.25rem] border border-border",
        "bg-gradient-to-b from-white/[0.04] to-transparent",
        "backdrop-blur-sm transition-all duration-300",
        tone.border,
        isHovered && tone.glow,
        featured ? "p-6" : "p-5"
      )}
      style={{
        background: `linear-gradient(180deg, rgba(${tone.accentRgb}, 0.03) 0%, rgba(10, 17, 27, 0.92) 100%)`,
      }}
    >
      {/* Animated top glow line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${tone.accent} 50%, transparent 100%)`,
          opacity: isHovered ? 1 : 0.5,
          transition: "opacity 300ms ease",
        }}
      />

      {/* Ambient corner glow on hover */}
      <motion.div
        className="pointer-events-none absolute -top-12 -right-12 h-28 w-28 rounded-full blur-3xl"
        style={{ background: tone.accent }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.08 : 0 }}
        transition={{ duration: 0.4 }}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Label with live pulse */}
          <div className="flex items-center gap-2">
            <span className="text-label">{kpi.label}</span>
            {kpi.tone === "danger" && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
              </span>
            )}
          </div>

          {/* Animated number */}
          <div className="mt-3 flex items-baseline gap-2">
            <motion.span
              className={cn(
                "font-semibold tracking-tight tabular-nums text-foreground",
                featured ? "text-[2.25rem] leading-none" : "text-3xl"
              )}
            >
              {rounded}
            </motion.span>
            {kpi.unit ? (
              <span className="text-base text-muted-foreground">{kpi.unit}</span>
            ) : null}
          </div>

          {/* Trend indicator */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.08, duration: 0.4 }}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                positive ? tone.soft : "bg-destructive/10 text-destructive"
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {Math.abs(kpi.delta)}%
            </motion.span>
            <span className="text-xs text-muted-foreground">vs prior window</span>
          </div>

          {/* Summary line */}
          {kpi.summary ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.06 }}
              className="mt-3 text-[13px] leading-relaxed text-muted-foreground"
            >
              {kpi.summary}
            </motion.p>
          ) : null}
        </div>

        {/* Sparkline chart */}
        <div
          className={cn(
            "shrink-0 transition-transform duration-300",
            featured ? "h-20 w-32" : "h-16 w-28",
            isHovered && "scale-105"
          )}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`spark-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tone.accent} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={tone.accent} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={tone.accent}
                strokeWidth={2}
                fill={`url(#spark-${kpi.id})`}
                isAnimationActive
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend direction micro-icon */}
      <div className="pointer-events-none absolute bottom-3 right-3 opacity-0 transition-opacity duration-300 group-hover:opacity-40">
        {positive ? (
          <TrendingUp className="h-5 w-5" style={{ color: tone.accent }} />
        ) : (
          <TrendingDown className="h-5 w-5 text-destructive" />
        )}
      </div>
    </motion.div>
  );
}
