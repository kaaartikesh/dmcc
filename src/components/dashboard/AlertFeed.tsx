"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertTriangle, ChevronRight, Clock, ExternalLink, ShieldCheck, Zap } from "lucide-react";
import type { AlertItem } from "@/lib/frontend-data";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { cn } from "@/lib/utils";

const severityConfig = {
  critical: {
    color: "var(--color-destructive)",
    rgb: "240, 94, 120",
    icon: AlertTriangle,
    pulse: true,
  },
  high: {
    color: "var(--color-warning)",
    rgb: "245, 181, 68",
    icon: Zap,
    pulse: true,
  },
  medium: {
    color: "var(--color-chart-1)",
    rgb: "77, 172, 247",
    icon: Activity,
    pulse: false,
  },
  low: {
    color: "var(--color-success)",
    rgb: "122, 230, 162",
    icon: ShieldCheck,
    pulse: false,
  },
};

export function AlertFeed({ items }: { items: AlertItem[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/45 p-5">
        <ShieldCheck className="h-5 w-5 text-success" />
        <span className="text-sm text-muted-foreground">No live alerts right now. All clear.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => {
          const config = severityConfig[item.severity];
          const Icon = config.icon;
          const isExpanded = expandedId === item.id;
          const highRisk = item.severity === "critical" || item.severity === "high";

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{
                delay: index * 0.06,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
                layout: { duration: 0.3 },
              }}
              whileHover={{ y: -2 }}
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-2xl border border-border",
                "bg-gradient-to-r from-white/[0.02] to-transparent",
                "p-4 transition-all duration-200",
                "hover:border-border-strong",
                isExpanded && "ring-1 ring-white/[0.06]"
              )}
            >
              {/* Left severity stripe */}
              <div
                className="absolute inset-y-0 left-0 w-[3px] transition-all duration-300 group-hover:w-1"
                style={{ background: config.color }}
              />

              {/* Subtle ambient glow for high risk */}
              {highRisk && (
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.03]"
                  style={{
                    background: `radial-gradient(ellipse at 0% 50%, rgba(${config.rgb}, 0.5), transparent 70%)`,
                  }}
                />
              )}

              <div className="flex items-start gap-3.5 pl-2">
                {/* Icon with optional pulse */}
                <div className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card/80">
                  <Icon
                    className="h-4 w-4"
                    style={{ color: config.color }}
                  />
                  {config.pulse && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
                        style={{ background: config.color }}
                      />
                      <span
                        className="relative inline-flex h-2.5 w-2.5 rounded-full"
                        style={{ background: config.color }}
                      />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {/* Title row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {item.title}
                    </div>
                    <SeverityBadge severity={item.severity} />
                    {highRisk && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-destructive"
                      >
                        Priority
                      </motion.span>
                    )}
                  </div>

                  {/* Description - always visible */}
                  <div className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
                    {item.description}
                  </div>

                  {/* Metadata footer */}
                  <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {item.source}
                    </span>
                    <span className="opacity-30">•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.ts}
                    </span>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2 text-xs text-muted-foreground">
                          <ChevronRight className="h-3 w-3 text-primary" />
                          <span>Click to view full detection report and take action.</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
