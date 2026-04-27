"use client";

import type { ReactNode } from "react";
import { Fragment, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  Clock,
  Download,
  Eye,
  Flag,
  Globe,
  Hash,
  Play,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, PageLoadingState, PageShell } from "@/components/layout/PageShell";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  buildAssetEvents,
  buildAssetSeries,
  buildPlatformDistribution,
  buildSpreadSeries,
  formatBytes,
  timeAgo,
  type AssetDetailResponse,
} from "@/lib/frontend-data";

export default function AssetDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<AssetDetailResponse | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    void fetch(`/api/assets/${params.id}`)
      .then((res) => res.json() as Promise<AssetDetailResponse>)
      .then((body) => setData(body));
  }, [params?.id]);

  const series = useMemo(() => buildAssetSeries(data?.matches ?? []), [data]);
  const events = useMemo(() => buildAssetEvents(data?.matches ?? []), [data]);
  const spread = useMemo(() => buildSpreadSeries(data?.matches ?? []), [data]);
  const platformDistribution = useMemo(() => buildPlatformDistribution(data?.matches ?? []), [data]);

  if (!data) {
    return <PageLoadingState title="Loading asset intelligence" panels={2} />;
  }

  const topMatch = data.matches[0];

  return (
    <PageShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Asset intelligence"
          title={data.asset.fileName}
          description={`${data.matches.length} monitored matches linked to this protected asset.`}
          actions={
            <>
              <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
              <Button variant="outline" size="sm"><ShieldCheck className="h-3.5 w-3.5" /> Mark safe</Button>
              <Button size="sm" variant="destructive"><Flag className="h-3.5 w-3.5" /> Issue takedown</Button>
            </>
          }
        />

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Link href="/detections" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Back to detections
          </Link>
          <span className="font-mono text-primary">{data.asset.id}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(data.asset.createdAt).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> {data.asset.fingerprint.hash.slice(0, 12)}...</span>
          <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {data.matches.length} matches - monitored web</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ComparisonCard
            label="Original asset"
            tag="Verified"
          tagClass="bg-success/15 text-success border-success/30"
          imageUrl={data.asset.imageUrl}
        />
        <ComparisonCard
          label="Detected match"
          tag={topMatch ? `${topMatch.similarityScore.toFixed(1)}% match` : "No match"}
          tagClass="bg-destructive/15 text-destructive border-destructive/30"
          imageUrl={topMatch?.sourceImageUrl}
          detected
        />
        </motion.div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
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
                  <linearGradient id="asset-det" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="asset-tk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ stroke: "var(--color-border-strong)" }}
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="detections" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#asset-det)" />
                <Area type="monotone" dataKey="takedowns" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#asset-tk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 text-sm font-semibold">Ownership verification</div>
          <dl className="space-y-3 text-xs">
            <Meta label="Asset ID" value={<span className="font-mono text-primary">{data.asset.id}</span>} />
            <Meta label="Type" value={data.asset.mimeType} />
            <Meta label="Size" value={formatBytes(data.asset.size)} />
            <Meta label="Uploaded" value={new Date(data.asset.createdAt).toLocaleString()} />
            <Meta label="Fingerprint" value={<span className="font-mono">{data.asset.fingerprint.hash.slice(0, 20)}...</span>} />
            <Meta label="Labels" value={data.asset.fingerprint.labels.join(", ") || "None"} />
            <Meta label="Watermark" value={data.asset.ownershipVerification?.watermarkDetected ? "Detected" : "Not detected"} />
            <Meta label="Metadata" value={data.asset.ownershipVerification?.metadataValid ? "Valid" : "Needs review"} />
          </dl>
          <ul className="mt-4 space-y-1 text-sm text-foreground">
            {(data.asset.ownershipVerification?.notes ?? []).map((note) => (
              <li key={note}>- {note}</li>
            ))}
          </ul>
        </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 xl:col-span-2">
          <div className="mb-4 text-sm font-semibold">Content spread over time</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spread}>
                <defs>
                  <linearGradient id="spread-views" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleDateString()} stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ stroke: "var(--color-border-strong)" }}
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="views" stroke="var(--color-chart-3)" strokeWidth={2} fill="url(#spread-views)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 text-sm font-semibold">Platform distribution</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformDistribution} layout="vertical" margin={{ left: 20, right: 16, top: 8, bottom: 0 }}>
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="platform" type="category" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="var(--color-chart-4)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 xl:col-span-2">
          <div className="mb-4 text-sm font-semibold">Event timeline</div>
          <ul className="relative space-y-4 pl-5">
            <div className="absolute bottom-2 left-1.5 top-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />
            {events.length === 0 && <li className="text-sm text-muted-foreground">No active events yet.</li>}
            {events.map((event, index) => (
              <motion.li
                key={`${event.title}-${index}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="relative"
              >
                <span className="absolute -left-[18px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-card" />
                <div className="flex items-center gap-2">
                  <div className="text-sm">{event.title}</div>
                  <SeverityBadge severity={event.severity} />
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">{event.ts}</div>
              </motion.li>
            ))}
            {!events.length && (
              <li className="relative">
                <span className="absolute -left-[18px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-card" />
                <div className="text-sm">Asset fingerprinted and added to monitoring</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(data.asset.createdAt)}</div>
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 text-sm font-semibold">Case management</div>
          <div className="space-y-3">
            {data.cases.length === 0 && <div className="text-sm text-muted-foreground">No cases linked yet.</div>}
            {data.cases.map((caseItem) => (
              <div key={caseItem.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{caseItem.title}</div>
                  <StatusBadge status={caseItem.status} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{caseItem.summary}</div>
                <div className="mt-2 text-xs text-primary">Threat {caseItem.threatScore}</div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </PageShell>
  );
}

function ComparisonCard({
  label,
  tag,
  tagClass,
  imageUrl,
  detected = false,
}: {
  label: string;
  tag: string;
  tagClass: string;
  imageUrl?: string;
  detected?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="text-sm font-medium">{label}</div>
        <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium ${tagClass}`}>
          {tag}
        </span>
      </div>
      <div className="relative aspect-video bg-gradient-to-br from-surface-elevated to-background">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        {imageUrl ? (
          <Image src={imageUrl} alt={label} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-glow-strong"
              aria-label="Play"
            >
              <Play className="ml-0.5 h-5 w-5 fill-current text-primary-foreground" />
            </motion.button>
          </div>
        )}
        {detected && (
          <Fragment>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="absolute inset-0 bg-destructive/10"
            />
            <div className="absolute left-2 right-2 top-2 flex justify-between text-[10px] font-mono text-destructive">
              <span>REC</span>
              <span>Live capture</span>
            </div>
          </Fragment>
        )}
      </div>
      <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
        <Stat icon={<Eye className="h-3 w-3" />} label="Views" value={detected ? "Observed" : "Protected"} />
        <Stat label="Format" value="Image" />
        <Stat label="State" value={detected ? "Matched" : "Original"} />
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
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

function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right text-foreground">{value}</dd>
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
