import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { cn } from "@/lib/utils";
import type { KPI } from "@/lib/mock-data";

export function KpiCard({ kpi, index = 0 }: { kpi: KPI; index?: number }) {
  const positive = kpi.delta >= 0;
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    kpi.unit === "%" ? latest.toFixed(1) : Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    const controls = animate(count, kpi.value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      delay: index * 0.06,
    });
    return controls.stop;
  }, [count, kpi.value, index]);

  const data = kpi.spark.map((v, i) => ({ i, v }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-strong"
    >
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {kpi.label}
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <motion.span className="text-3xl font-semibold tracking-tight tabular-nums">
              {rounded}
            </motion.span>
            {kpi.unit && (
              <span className="text-base text-muted-foreground">{kpi.unit}</span>
            )}
          </div>
          <div
            className={cn(
              "mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
              positive
                ? "bg-success/15 text-success"
                : "bg-destructive/15 text-destructive"
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(kpi.delta)}%
            <span className="text-muted-foreground font-normal ml-1">vs 7d</span>
          </div>
        </div>

        <div className="h-14 w-24 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`spark-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="var(--color-primary)"
                strokeWidth={1.75}
                fill={`url(#spark-${kpi.id})`}
                isAnimationActive
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
