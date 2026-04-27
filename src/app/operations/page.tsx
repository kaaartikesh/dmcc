"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Bot,
  FileSearch,
  Gavel,
  PauseCircle,
  Play,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { MetricCard, PageHeader, PageLoadingState, PageShell, SectionCard } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AnalyticsResponse, DetectionResponseRow } from "@/lib/frontend-data";

type Overview = {
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
  discoveries: Array<{
    id: string;
    title: string;
    sourceUrl: string;
    discoveredAt: string;
    platform: string;
    views: number;
    shares: number;
  }>;
  compliance: {
    respectRobotsTxt: boolean;
    maxRequestsPerMinute: number;
    regionsAllowed: string[];
    termsAccepted: boolean;
  };
  analytics: AnalyticsResponse;
  cases: Array<{
    id: string;
    title: string;
    summary: string;
    status: "open" | "investigating" | "resolved";
    priority: "urgent" | "high" | "normal";
    threatScore: number;
  }>;
};

export default function OperationsPage() {
  const reverseInputRef = useRef<HTMLInputElement>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [detections, setDetections] = useState<DetectionResponseRow[]>([]);
  const [running, setRunning] = useState(false);
  const [assistantQuestion, setAssistantQuestion] = useState("Which assets are most at risk?");
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const [legalDraft, setLegalDraft] = useState<{ subject: string; summary: string; email: string } | null>(null);
  const [selectedDetectionId, setSelectedDetectionId] = useState("");
  const [reverseResults, setReverseResults] = useState<Array<{ asset: { id: string; fileName: string }; similarityScore: number }> | null>(null);

  async function loadAll() {
    const [overviewResponse, detectionsResponse] = await Promise.all([
      fetch("/api/monitoring/overview").then((res) => res.json() as Promise<Overview>),
      fetch("/api/detections").then((res) => res.json() as Promise<{ detections: DetectionResponseRow[] }>),
    ]);
    setOverview(overviewResponse);
    setDetections(detectionsResponse.detections ?? []);
    setSelectedDetectionId((current) => current || detectionsResponse.detections?.[0]?.id || "");
  }

  useEffect(() => {
    let mounted = true;
    void Promise.all([
      fetch("/api/monitoring/overview").then((res) => res.json() as Promise<Overview>),
      fetch("/api/detections").then((res) => res.json() as Promise<{ detections: DetectionResponseRow[] }>),
    ]).then(([overviewResponse, detectionsResponse]) => {
      if (!mounted) return;
      setOverview(overviewResponse);
      setDetections(detectionsResponse.detections ?? []);
      setSelectedDetectionId((current) => current || detectionsResponse.detections?.[0]?.id || "");
    });
    return () => {
      mounted = false;
    };
  }, []);

  async function runGlobalCycle() {
    setRunning(true);
    await fetch("/api/monitoring/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runAll: true }),
    });
    await loadAll();
    setRunning(false);
  }

  async function toggleConnector(id: string, nextStatus: "active" | "paused") {
    await fetch("/api/monitoring/connectors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectorId: id, status: nextStatus }),
    });
    await loadAll();
  }

  async function askAssistant() {
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: assistantQuestion }),
    });
    const body = (await response.json()) as { answer: string };
    setAssistantAnswer(body.answer);
  }

  async function generateDraft() {
    if (!selectedDetectionId) return;
    const response = await fetch("/api/legal/takedown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ detectionId: selectedDetectionId }),
    });
    const body = (await response.json()) as { subject: string; summary: string; email: string };
    setLegalDraft(body);
  }

  async function createCase(detectionId: string) {
    await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ detectionId }),
    });
    await loadAll();
  }

  async function runReverseSearch(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/reverse-search", {
      method: "POST",
      body: formData,
    });
    const body = (await response.json()) as {
      results: Array<{ asset: { id: string; fileName: string }; similarityScore: number }>;
    };
    setReverseResults(body.results);
  }

  if (!overview) {
    return <PageLoadingState title="Loading operations center" />;
  }

  const analytics = overview.analytics;

  return (
    <PageShell>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Operations center"
          title="Coordinate monitoring, AI review, and enforcement"
          description="Run source coverage, question the intelligence layer, perform reverse search, and turn detections into action."
          actions={
            <Button onClick={() => void runGlobalCycle()} disabled={running}>
              <Activity className="h-3.5 w-3.5" />
              {running ? "Running scan..." : "Run global monitoring"}
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Connectors" value={overview.connectors.length} hint="Sources configured for intake" icon={<Sparkles className="h-5 w-5" />} />
          <MetricCard label="Open cases" value={analytics.summary.openCases} hint="Cases currently in flight" icon={<ShieldCheck className="h-5 w-5" />} tone="warning" />
          <MetricCard label="Average threat" value={analytics.summary.averageThreat} hint="Current threat average across detections" icon={<Activity className="h-5 w-5" />} tone="danger" />
          <MetricCard label="Indexed content" value={overview.discoveries.length} hint="Discovered source items stored for analysis" icon={<FileSearch className="h-5 w-5" />} tone="positive" />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard title="AI assistant" description="Ask for risk summaries, explain detections, or review weekly violations." className="xl:col-span-2 p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <Textarea value={assistantQuestion} onChange={(event) => setAssistantQuestion(event.target.value)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => void askAssistant()}>Ask assistant</Button>
                <Button size="sm" variant="outline" onClick={() => setAssistantQuestion("Why was this flagged?")}>Why flagged?</Button>
                <Button size="sm" variant="outline" onClick={() => setAssistantQuestion("Show me top violations this week")}>Top this week</Button>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/45 p-4 text-sm text-foreground">
                {assistantAnswer || "Ask about risky assets, top violations, or why a detection was flagged."}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Reverse search" description="Find similar protected assets from a new image input." className="p-6">
            <div className="space-y-4">
              <input
                ref={reverseInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void runReverseSearch(file);
                }}
              />
              <Button variant="outline" className="w-full" onClick={() => reverseInputRef.current?.click()}>
                <FileSearch className="h-4 w-4" />
                Upload image to search DB
              </Button>
              <div className="space-y-3">
                {(reverseResults ?? []).map((result) => (
                  <div key={result.asset.id} className="rounded-2xl border border-border bg-secondary/45 p-4">
                    <div className="text-sm font-semibold text-foreground">{result.asset.fileName}</div>
                    <div className="mt-1 text-sm text-muted-foreground">Similarity {result.similarityScore}%</div>
                  </div>
                ))}
                {!reverseResults ? <div className="text-sm text-muted-foreground">Run a mini reverse image search against your protected asset inventory.</div> : null}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard title="Analytics and insights" description="Monitor which assets and platforms are driving the most risk." className="xl:col-span-2 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <InsightList
                title="Most stolen content"
                rows={(analytics.topAssets ?? []).map((asset) => ({
                  label: asset.assetName,
                  value: asset.count,
                }))}
              />
              <InsightList
                title="Top violating platforms"
                rows={(analytics.topPlatforms ?? []).map((platform) => ({
                  label: platform.platform,
                  value: platform.count,
                }))}
              />
            </div>
            <div className="mt-4 rounded-2xl border border-border bg-secondary/45 p-4 text-sm text-foreground">
              {analytics.trends.map((trend) => `${trend.date}: ${trend.detections} detections / threat ${trend.threat}`).join(" | ") || "No trend data yet."}
            </div>
          </SectionCard>

          <SectionCard title="Legal assistant" description="Generate takedown-ready language for a selected detection." className="p-6">
            <div className="space-y-4">
              <Input
                value={selectedDetectionId}
                onChange={(event) => setSelectedDetectionId(event.target.value)}
                placeholder="Detection ID"
                list="legal-detections"
              />
              <datalist id="legal-detections">
                {detections.map((detection) => (
                  <option key={detection.id} value={detection.id}>
                    {detection.sourceTitle}
                  </option>
                ))}
              </datalist>
              <Button className="w-full" onClick={() => void generateDraft()}>
                <Gavel className="h-4 w-4" />
                Generate takedown draft
              </Button>
              <div className="rounded-2xl border border-border bg-secondary/45 p-4 text-xs whitespace-pre-wrap text-muted-foreground">
                {legalDraft ? `${legalDraft.subject}\n\n${legalDraft.summary}\n\n${legalDraft.email}` : "Generate a DMCA-style notice from a detection."}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <SectionCard title="Case management" description="Turn fresh detections into tracked response workflows." className="xl:col-span-2 p-6">
            <div className="space-y-4">
              {(overview.cases ?? []).map((caseItem) => (
                <div key={caseItem.id} className="rounded-2xl border border-border bg-secondary/45 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{caseItem.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{caseItem.summary}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={caseItem.status === "resolved" ? "success" : caseItem.status === "investigating" ? "info" : "warning"}>
                        {caseItem.status}
                      </Badge>
                      <div className="mt-2 text-sm font-semibold text-foreground">Threat {caseItem.threatScore}</div>
                    </div>
                  </div>
                </div>
              ))}
              {!overview.cases.length ? <div className="text-sm text-muted-foreground">No cases yet. Create one from the suggestions below.</div> : null}

              <div className="grid gap-3 md:grid-cols-2">
                {detections.slice(0, 4).map((detection) => (
                  <button
                    key={detection.id}
                    onClick={() => void createCase(detection.id)}
                    className="rounded-2xl border border-border bg-secondary/45 p-4 text-left transition-colors hover:border-border-strong hover:bg-secondary/60"
                  >
                    <div className="text-sm font-semibold text-foreground">{detection.sourceTitle}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Case status: {detection.caseStatus ?? "none"} · Threat {detection.threatScore.total}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Compliance and connectors" description="Track operating limits and source connector health." className="p-6">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-secondary/45 p-4 text-sm">
                <div className="flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  Robots respected: {String(overview.compliance.respectRobotsTxt)}
                </div>
                <div className="mt-3 flex items-center gap-2 text-foreground">
                  <Scale className="h-4 w-4 text-primary" />
                  Max requests/min: {overview.compliance.maxRequestsPerMinute}
                </div>
                <div className="mt-3 text-muted-foreground">Regions: {overview.compliance.regionsAllowed.join(", ")}</div>
              </div>

              {overview.connectors.map((connector) => (
                <motion.div key={connector.id} layout className="rounded-2xl border border-border bg-secondary/45 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{connector.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {connector.sourceDomain} · {connector.rateLimitPerMin}/min
                      </div>
                    </div>

                    {connector.status === "active" ? (
                      <button
                        onClick={() => void toggleConnector(connector.id, "paused")}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-warning transition-colors hover:bg-card"
                      >
                        <PauseCircle className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => void toggleConnector(connector.id, "active")}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-success transition-colors hover:bg-card"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </PageShell>
  );
}

function InsightList({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: string | number }>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/45 p-4">
      <div className="text-label">{title}</div>
      <div className="mt-4 space-y-3 text-sm">
        {rows.map((row) => (
          <div key={`${row.label}-${row.value}`} className="flex items-center justify-between gap-3">
            <span className="truncate text-foreground">{row.label}</span>
            <span className="font-semibold text-primary">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
