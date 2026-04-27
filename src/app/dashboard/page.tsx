"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarRange,
  Globe,
  Layers,
  Radio,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { DetectionTrendChart } from "@/components/dashboard/DetectionTrendChart";
import { KpiCard } from "@/components/dashboard/KPICard";
import { PipelineHealth } from "@/components/dashboard/PipelineHealth";
import { PlatformBreakdown } from "@/components/dashboard/PlatformBreakdown";
import { PageHeader, PageLoadingState, PageShell, SectionCard } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildAlerts,
  buildPlatformBreakdown,
  buildTrendData,
  type DashboardKpi,
  type DashboardResponse,
  type DetectionResponseRow,
} from "@/lib/frontend-data";

type MonitoringOverview = {
  connectors: Array<{
    id: string;
    name: string;
    type: string;
    sourceDomain: string;
    status: "active" | "paused" | "error";
    rateLimitPerMin: number;
    lastRunAt?: string;
  }>;
  jobs: Array<{
    id: string;
    connectorId: string;
    status: string;
    discoveredCount: number;
    matchedCount: number;
    startedAt: string;
  }>;
  cases: Array<{
    id: string;
    title: string;
    status: "open" | "investigating" | "resolved";
    threatScore: number;
  }>;
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [detections, setDetections] = useState<DetectionResponseRow[]>([]);
  const [overview, setOverview] = useState<MonitoringOverview | null>(null);

  useEffect(() => {
    let mounted = true;
    void Promise.all([
      fetch("/api/dashboard").then((res) => res.json() as Promise<DashboardResponse>),
      fetch("/api/detections").then((res) => res.json() as Promise<{ detections: DetectionResponseRow[] }>),
      fetch("/api/monitoring/overview").then((res) => res.json() as Promise<MonitoringOverview>),
    ]).then(([dashboardBody, detectionsBody, overviewBody]) => {
      if (!mounted) return;
      setDashboard(dashboardBody);
      setDetections(detectionsBody.detections ?? []);
      setOverview(overviewBody);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const trend = useMemo(() => buildTrendData(detections), [detections]);
  const alerts = useMemo(
    () => buildAlerts(dashboard?.recentDetections.length ? (dashboard.recentDetections as DetectionResponseRow[]) : detections),
    [dashboard, detections]
  );
  const platforms = useMemo(() => buildPlatformBreakdown(detections), [detections]);

  const kpis = useMemo<DashboardKpi[]>(() => {
    if (!dashboard || !overview) {
      return [];
    }

    const highRiskCases = overview.cases.filter((item) => item.threatScore >= 80 || item.status === "investigating").length;
    const activeDetectionTrend = trend.map((point) => point.detections);
    const highRiskTrend = detections
      .slice(0, 12)
      .reverse()
      .map((item, index) => Math.max(1, Math.round((item.threatScore.total / 100) * (index + 1))));

    return [
      {
        id: "assets",
        label: "Total Assets",
        value: dashboard.totalAssets,
        delta: 8.6,
        spark: trend.map((point, index) => Math.max(1, Math.round(dashboard.totalAssets * (0.72 + (index % 4) * 0.04)))).slice(-12),
        tone: "default",
        summary: "Protected media currently indexed and monitored.",
      },
      {
        id: "detections",
        label: "Active Detections",
        value: dashboard.activeAlerts,
        delta: activeDetectionTrend.length > 1 ? activeDetectionTrend[activeDetectionTrend.length - 1] - activeDetectionTrend[0] : 0,
        spark: activeDetectionTrend.length > 0 ? activeDetectionTrend : [1, 2, 1, 3, 2, 4, 3, 4, 5, 4, 5, 6],
        tone: "warning",
        summary: "Live detection queue requiring analyst attention.",
      },
      {
        id: "cases",
        label: "High-Risk Cases",
        value: highRiskCases,
        delta: 5.2,
        spark: highRiskTrend.length > 0 ? highRiskTrend : [1, 1, 2, 2, 3, 3, 4, 3, 4, 5, 4, 5],
        tone: "danger",
        summary: "Open cases with elevated threat or active investigation status.",
      },
    ];
  }, [dashboard, detections, overview, trend]);

  if (!dashboard || !overview) {
    return <PageLoadingState title="Loading analytics dashboard" />;
  }

  const connectorErrors = overview.connectors.filter((item) => item.status === "error").length;
  const activeConnectors = overview.connectors.filter((item) => item.status === "active").length;
  const topAlert = alerts[0];
  const highRiskCases = overview.cases.filter((item) => item.threatScore >= 80 || item.status === "investigating").length;
  const coveragePct = Math.max(0, Math.min(100, Math.round(((dashboard.totalAssets - dashboard.activeAlerts) / Math.max(dashboard.totalAssets, 1)) * 100)));

  return (
    <PageShell>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ─── Header ─────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <PageHeader
            eyebrow="Analytics dashboard"
            title="Media protection, organized like an operating system"
            description="A real-time view of content exposure, detection pressure, case severity, and connector health across your monitoring stack."
            actions={
              <>
                <Button variant="outline" size="sm">
                  <CalendarRange className="h-3.5 w-3.5" />
                  Last 24 hours
                </Button>
                <Button size="sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Run fresh scan
                </Button>
              </>
            }
          />
        </motion.div>

        {/* ─── Bento Grid ─────────────────────────────────────── */}
        <motion.div
          variants={stagger}
          className="grid auto-rows-auto gap-4 xl:grid-cols-12"
        >
          {/* ── Row 1: KPI Cards (3 cards spanning full width) ── */}
          {kpis.map((kpi, index) => (
            <motion.div
              key={kpi.id}
              variants={fadeUp}
              className="xl:col-span-4"
            >
              <KpiCard kpi={kpi} index={index} featured={index === 0} />
            </motion.div>
          ))}

          {/* ── Row 2: Detection Trends (8 cols) + Coverage Card (4 cols) ── */}
          <motion.div variants={fadeUp} className="xl:col-span-8">
            <SectionCard
              title="Detection trends"
              description="Volume and mitigation movement over the active window."
              className="p-6 h-full"
            >
              <DetectionTrendChart data={trend} />
            </SectionCard>
          </motion.div>

          <motion.div variants={fadeUp} className="xl:col-span-4">
            <div className="flex h-full flex-col gap-4">
              {/* Coverage posture card */}
              <div className="surface-card flex-1 overflow-hidden rounded-[1.25rem] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-label">Coverage status</div>
                    <div className="mt-3 text-4xl font-semibold tracking-tight text-foreground tabular-nums">
                      {coveragePct}%
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                      Assets not currently in the active detection queue.
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10">
                    <ShieldCheck className="h-5 w-5 text-success" />
                  </div>
                </div>
                {/* Coverage progress ring */}
                <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${coveragePct}%` }}
                    transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-success/80 to-success"
                  />
                </div>
              </div>

              {/* Live status indicator */}
              <div className="surface-card overflow-hidden rounded-[1.25rem] p-5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Radio className="h-4 w-4 text-primary" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">System online</div>
                    <div className="text-xs text-muted-foreground">
                      {activeConnectors} connectors active · {connectorErrors === 0 ? "No issues" : `${connectorErrors} errors`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Row 3: Alert Feed (5 cols) + Platform Exposure (7 cols) ── */}
          <motion.div variants={fadeUp} className="xl:col-span-5">
            <SectionCard
              title="Recent alerts feed"
              description="Freshest signals ranked for review urgency."
              className="p-6 h-full"
              action={topAlert ? <Badge variant="warning">{alerts.length} live</Badge> : undefined}
            >
              <AlertFeed items={alerts} />
            </SectionCard>
          </motion.div>

          <motion.div variants={fadeUp} className="xl:col-span-7">
            <SectionCard
              title="Platform exposure"
              description="Where current infringement activity is most concentrated."
              className="p-6 h-full"
            >
              <PlatformBreakdown data={platforms} />
            </SectionCard>
          </motion.div>

          {/* ── Row 4: Escalation Summary (Full width, 3 col inner grid) ── */}
          <motion.div variants={fadeUp} className="xl:col-span-12">
            <SectionCard
              title="Escalation summary"
              description="The most important risk and case signals to take into the next response cycle."
              className="p-6"
            >
              <div className="grid gap-4 lg:grid-cols-3">
                <EscalationCard
                  title="Most urgent signal"
                  value={topAlert?.title ?? "No active alert"}
                  detail={topAlert?.description ?? "Detection pressure is currently quiet."}
                  icon={<AlertTriangle className="h-5 w-5 text-warning" />}
                  accent="var(--color-warning)"
                  index={0}
                />
                <EscalationCard
                  title="Detection posture"
                  value={`${dashboard.activeAlerts}`}
                  detail="Active detections currently awaiting review or action."
                  icon={<Shield className="h-5 w-5 text-primary" />}
                  accent="var(--color-chart-1)"
                  index={1}
                />
                <EscalationCard
                  title="Case pressure"
                  value={`${highRiskCases}`}
                  detail="High-risk cases currently pushing the response queue."
                  icon={<ArrowUpRight className="h-5 w-5 text-chart-3" />}
                  accent="var(--color-chart-3)"
                  index={2}
                />
              </div>
            </SectionCard>
          </motion.div>
        </motion.div>

        {/* ─── Pipeline Health (Full width, outside bento) ───── */}
        <motion.div variants={fadeUp}>
          <SectionCard
            title="Pipeline health"
            description="Connector readiness, rate limits, and recent crawl performance across your monitoring pipeline."
            className="p-6"
            action={
              <Badge variant={connectorErrors > 0 ? "danger" : "success"}>
                <Layers className="mr-1 h-3 w-3" />
                {activeConnectors} active
              </Badge>
            }
          >
            <PipelineHealth connectors={overview.connectors} jobs={overview.jobs} />
          </SectionCard>
        </motion.div>
      </motion.div>
    </PageShell>
  );
}

/* ─── Escalation Card ───────────────────────────────────── */
function EscalationCard({
  title,
  value,
  detail,
  icon,
  accent,
  index = 0,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  accent: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="group relative overflow-hidden rounded-[1.25rem] border border-border bg-gradient-to-b from-white/[0.03] to-transparent p-5 transition-all duration-200 hover:border-border-strong"
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-50 transition-opacity group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-label">{title}</div>
          <div className="mt-3 text-xl font-semibold tracking-tight text-foreground">{value}</div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{detail}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card/80 transition-colors group-hover:bg-card">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
