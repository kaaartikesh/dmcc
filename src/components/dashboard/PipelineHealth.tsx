"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Gauge,
  PauseCircle,
  RefreshCw,
  TriangleAlert,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ConnectorItem = {
  id: string;
  name: string;
  sourceDomain: string;
  status: "active" | "paused" | "error";
  rateLimitPerMin: number;
  lastRunAt?: string;
};

type JobItem = {
  id: string;
  connectorId: string;
  status: string;
  discoveredCount: number;
  matchedCount: number;
  startedAt: string;
};

const statusConfig = {
  active: {
    icon: CheckCircle2,
    badge: "success" as const,
    label: "Healthy",
    color: "var(--color-success)",
    rgb: "75, 209, 140",
    statusIcon: Wifi,
  },
  paused: {
    icon: PauseCircle,
    badge: "warning" as const,
    label: "Paused",
    color: "var(--color-warning)",
    rgb: "245, 181, 68",
    statusIcon: Clock,
  },
  error: {
    icon: TriangleAlert,
    badge: "danger" as const,
    label: "Attention",
    color: "var(--color-destructive)",
    rgb: "240, 94, 120",
    statusIcon: WifiOff,
  },
};

export function PipelineHealth({
  connectors,
  jobs,
}: {
  connectors: ConnectorItem[];
  jobs: JobItem[];
}) {
  const lastJobByConnector = new Map(jobs.map((job) => [job.connectorId, job]));
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Summary stats
  const activeCount = connectors.filter((c) => c.status === "active").length;
  const errorCount = connectors.filter((c) => c.status === "error").length;
  const totalDiscovered = jobs.reduce((sum, j) => sum + j.discoveredCount, 0);
  const totalMatched = jobs.reduce((sum, j) => sum + j.matchedCount, 0);

  return (
    <div className="space-y-5">
      {/* Pipeline summary row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid gap-3 sm:grid-cols-4"
      >
        <PipelineSummaryCard
          label="Active connectors"
          value={activeCount}
          total={connectors.length}
          color="var(--color-success)"
          index={0}
        />
        <PipelineSummaryCard
          label="Errors"
          value={errorCount}
          total={connectors.length}
          color="var(--color-destructive)"
          index={1}
        />
        <PipelineSummaryCard
          label="Discovered"
          value={totalDiscovered}
          color="var(--color-chart-1)"
          index={2}
        />
        <PipelineSummaryCard
          label="Matched"
          value={totalMatched}
          color="var(--color-chart-3)"
          index={3}
        />
      </motion.div>

      {/* Connector cards */}
      <div className="grid gap-3 lg:grid-cols-2">
        {connectors.map((connector, index) => {
          const meta = statusConfig[connector.status];
          const Icon = meta.icon;
          const StatusIcon = meta.statusIcon;
          const job = lastJobByConnector.get(connector.id);
          const isExpanded = expandedId === connector.id;
          const matchRate = job && job.discoveredCount > 0
            ? Math.round((job.matchedCount / job.discoveredCount) * 100)
            : 0;

          return (
            <motion.div
              key={connector.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.05,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
                layout: { duration: 0.25 },
              }}
              whileHover={{ y: -2 }}
              onClick={() => setExpandedId(isExpanded ? null : connector.id)}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-2xl border border-border",
                "bg-gradient-to-b from-white/[0.03] to-transparent",
                "p-4 transition-all duration-200",
                "hover:border-border-strong",
                connector.status === "error" && "border-destructive/20",
                isExpanded && "ring-1 ring-white/[0.06]"
              )}
            >
              {/* Status glow line at top */}
              <div
                className="absolute inset-x-0 top-0 h-px opacity-60"
                style={{
                  background: `linear-gradient(90deg, transparent 10%, ${meta.color} 50%, transparent 90%)`,
                }}
              />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    {/* Connector icon with status ring */}
                    <div className="relative">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/80 transition-colors"
                        style={{
                          boxShadow: `0 0 0 1px rgba(${meta.rgb}, 0.15)`,
                        }}
                      >
                        <Icon className="h-4 w-4" style={{ color: meta.color }} />
                      </div>
                      {/* Live indicator dot */}
                      {connector.status === "active" && (
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-40" />
                          <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-background bg-success" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {connector.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate">{connector.sourceDomain}</span>
                      </div>
                    </div>
                  </div>

                  {/* Inline stats */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-lg bg-card/50 px-2.5 py-1 text-xs">
                      <Gauge className="h-3 w-3 text-muted-foreground" />
                      <span className="tabular-nums text-foreground">{connector.rateLimitPerMin}</span>
                      <span className="text-muted-foreground">/min</span>
                    </div>
                    {job && (
                      <>
                        <div className="flex items-center gap-1.5 rounded-lg bg-card/50 px-2.5 py-1 text-xs">
                          <Activity className="h-3 w-3 text-chart-1" />
                          <span className="tabular-nums text-foreground">{job.discoveredCount}</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-card/50 px-2.5 py-1 text-xs">
                          <RefreshCw className="h-3 w-3 text-chart-3" />
                          <span className="tabular-nums text-foreground">{job.matchedCount}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge variant={meta.badge}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {meta.label}
                  </Badge>
                  <div className="text-[11px] text-muted-foreground tabular-nums">
                    {connector.lastRunAt
                      ? new Date(connector.lastRunAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "No run yet"}
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-muted-foreground"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && job && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-3 border-t border-border pt-4">
                      {/* Match rate bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Match rate</span>
                          <span className="font-semibold tabular-nums text-foreground">{matchRate}%</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${matchRate}%` }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full"
                            style={{ background: meta.color }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <PipelineStat label="Status" value={job.status} />
                        <PipelineStat label="Discovered" value={job.discoveredCount} />
                        <PipelineStat label="Matched" value={job.matchedCount} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {connectors.length === 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/45 p-5 text-sm text-muted-foreground">
          <WifiOff className="h-5 w-5" />
          No connectors are configured for the pipeline yet.
        </div>
      )}
    </div>
  );
}

function PipelineSummaryCard({
  label,
  value,
  total,
  color,
  index = 0,
}: {
  label: string;
  value: number;
  total?: number;
  color: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-border bg-secondary/40 p-4 transition-all duration-200 hover:border-border-strong"
    >
      <div className="text-label">{label}</div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
          {value.toLocaleString()}
        </span>
        {total !== undefined && (
          <span className="text-sm text-muted-foreground">/ {total}</span>
        )}
      </div>
      <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: total ? `${Math.min(100, (value / total) * 100)}%` : "50%" }}
          transition={{ delay: 0.3 + index * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  );
}

function PipelineStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}
