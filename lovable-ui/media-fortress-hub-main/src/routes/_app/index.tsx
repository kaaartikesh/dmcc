import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Activity, Filter, Calendar } from "lucide-react";
import { kpis } from "@/lib/mock-data";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { DetectionTrendChart } from "@/components/dashboard/DetectionTrendChart";
import { WorldMap } from "@/components/dashboard/WorldMap";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { PlatformBreakdown } from "@/components/dashboard/PlatformBreakdown";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Digital Media Control Center" },
      { name: "description", content: "Real-time monitoring of sports digital assets across the globe." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="px-4 md:px-8 py-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span>Live · Last sync 2s ago</span>
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Welcome back, <span className="gradient-text">Sarah</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Global protection layer is active across 142 platforms in 87 regions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-3.5 w-3.5 mr-1.5" /> Last 24h
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-3.5 w-3.5 mr-1.5" /> Filters
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <KpiCard key={k.id} kpi={k} index={i} />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Detection activity" subtitle="24-hour view" className="xl:col-span-2">
          <DetectionTrendChart />
        </Card>
        <Card title="Live alerts" subtitle="Real-time feed">
          <AlertFeed />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Global threat map" subtitle="Active regions" className="xl:col-span-2">
          <WorldMap />
        </Card>
        <Card title="Platform breakdown" subtitle="Last 7 days">
          <PlatformBreakdown />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Recent activity" subtitle="Team & system" className="xl:col-span-2">
          <ActivityTimeline />
        </Card>
        <Card title="Protection coverage" subtitle="Real-time">
          <CoverageMeter />
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-xl border border-border bg-card p-5 ${className}`}
    >
      <header className="mb-4 flex items-baseline justify-between">
        <div>
          <div className="text-sm font-semibold tracking-tight">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </div>
      </header>
      {children}
    </motion.section>
  );
}

function CoverageMeter() {
  const segments = [
    { label: "Live streams", v: 98, color: "var(--color-chart-1)" },
    { label: "VOD / Highlights", v: 96, color: "var(--color-chart-2)" },
    { label: "Audio commentary", v: 91, color: "var(--color-chart-3)" },
    { label: "Imagery & logos", v: 99, color: "var(--color-chart-4)" },
  ];
  return (
    <div className="space-y-4">
      {segments.map((s, i) => (
        <div key={s.label}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-medium tabular-nums">{s.v}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${s.v}%` }}
              transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full"
              style={{ background: s.color, boxShadow: `0 0 12px ${s.color}` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
