import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Flag, ShieldCheck, Download, Play, Hash, Clock, Eye, Globe } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/common/SeverityBadge";

export const Route = createFileRoute("/_app/assets/$assetId")({
  head: ({ params }) => ({
    meta: [
      { title: `Asset ${params.assetId} — DMCC` },
      { name: "description", content: "Asset detail with side-by-side detection comparison and analytics." },
    ],
  }),
  component: AssetDetailPage,
});

const series = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  detections: Math.round(20 + Math.sin(i / 3) * 12 + Math.random() * 18),
  takedowns: Math.round(8 + Math.cos(i / 4) * 6 + Math.random() * 10),
}));

const events = [
  { ts: "Just now", title: "New detection on Telegram", severity: "critical" as const },
  { ts: "12m ago", title: "Takedown completed (YouTube)", severity: "low" as const },
  { ts: "1h ago", title: "Match score increased to 96%", severity: "high" as const },
  { ts: "3h ago", title: "Geo-spread expanded to 4 regions", severity: "medium" as const },
  { ts: "Yesterday", title: "Asset fingerprinted & deployed", severity: "low" as const },
];

function AssetDetailPage() {
  const { assetId } = Route.useParams();

  return (
    <div className="px-4 md:px-8 py-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/detections" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Back to detections
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            UEFA Champions League Final 2024
          </h1>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono text-primary">{assetId}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 2:14:38</span>
            <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> f1a8c2…9b4e</span>
            <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> 142 matches · 38 regions</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" /> Export</Button>
          <Button variant="outline" size="sm"><ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Mark safe</Button>
          <Button size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            <Flag className="h-3.5 w-3.5 mr-1.5" /> Issue takedown
          </Button>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <ComparisonCard label="Original asset" tag="Verified" tagClass="bg-success/15 text-success border-success/30" />
        <ComparisonCard label="Detected match" tag="96.4% match" tagClass="bg-destructive/15 text-destructive border-destructive/30" detected />
      </motion.div>

      {/* Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">Detections vs takedowns</div>
              <div className="text-xs text-muted-foreground">Last 30 days</div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Legend color="var(--color-chart-1)" label="Detections" />
              <Legend color="var(--color-chart-2)" label="Takedowns" />
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="ad-1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ad-2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ stroke: "var(--color-border-strong)" }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="detections" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#ad-1)" />
                <Area type="monotone" dataKey="takedowns" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#ad-2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metadata */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-sm font-semibold mb-4">Metadata</div>
          <dl className="space-y-3 text-xs">
            <Meta k="Asset ID" v={<span className="font-mono text-primary">{assetId}</span>} />
            <Meta k="Type" v="Video · MP4" />
            <Meta k="Resolution" v="3840 × 2160" />
            <Meta k="Duration" v="2h 14m 38s" />
            <Meta k="Uploaded" v="June 1, 2024" />
            <Meta k="Owner" v="UEFA Media Rights" />
            <Meta k="Fingerprint" v={<span className="font-mono">f1a8c2…9b4e</span>} />
            <Meta k="Status" v={<SeverityBadge severity="critical" />} />
          </dl>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-sm font-semibold mb-4">Event timeline</div>
        <ul className="relative pl-5 space-y-4">
          <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />
          {events.map((e, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative"
            >
              <span className="absolute -left-[18px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-card" />
              <div className="flex items-center gap-2">
                <div className="text-sm">{e.title}</div>
                <SeverityBadge severity={e.severity} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{e.ts}</div>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ComparisonCard({
  label,
  tag,
  tagClass,
  detected = false,
}: {
  label: string;
  tag: string;
  tagClass: string;
  detected?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="text-sm font-medium">{label}</div>
        <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium ${tagClass}`}>
          {tag}
        </span>
      </div>
      <div className="relative aspect-video bg-gradient-to-br from-surface-elevated to-background flex items-center justify-center">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        {detected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="absolute inset-0 bg-destructive/10"
            />
            <div className="absolute top-2 left-2 right-2 flex justify-between text-[10px] font-mono text-destructive">
              <span>● REC</span>
              <span>00:14:22</span>
            </div>
          </>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-strong"
          aria-label="Play"
        >
          <Play className="h-5 w-5 text-primary-foreground fill-current ml-0.5" />
        </motion.button>
      </div>
      <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
        <Stat icon={<Eye className="h-3 w-3" />} label="Views" value={detected ? "284K" : "1.2M"} />
        <Stat label="Resolution" value="2160p" />
        <Stat label="Bitrate" value={detected ? "8 Mbps" : "24 Mbps"} />
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium tabular-nums">{value}</div>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-foreground text-right truncate">{v}</dd>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}
