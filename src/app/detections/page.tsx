"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  MetricCard,
  PageHeader,
  PageLoadingState,
  PageShell,
  SectionCard,
} from "@/components/layout/PageShell";
import {
  DetectionTable,
  type DetectionTableRow,
  type SortConfig,
  type SortKey,
} from "@/components/common/DetectionTable";
import { FilterBar, type FilterOption } from "@/components/common/FilterBar";
import { Button } from "@/components/ui/button";
import {
  inferAssetType,
  mapRiskToSeverity,
  mapStatus,
  timeAgo,
  type DetectionResponseRow,
} from "@/lib/frontend-data";

/* ─────────────────── Constants ────────────────── */

type SeverityFilter = "all" | "critical" | "high" | "medium" | "low";

const PAGE_SIZE = 15;

/* ───────────── Severity → threat level map ────── */

function severityToThreatLevel(s: string): "high" | "medium" | "low" {
  if (s === "critical" || s === "high") return "high";
  if (s === "medium") return "medium";
  return "low";
}

/* ───────────── Transform API rows ─────────────── */

function transformRow(row: DetectionResponseRow): DetectionTableRow {
  const severity = mapRiskToSeverity(row.riskLevel);
  return {
    id: row.id,
    previewUrl: row.assetImageUrl || row.sourceImageUrl,
    assetName: row.assetName,
    platform: row.platform,
    similarityScore: row.similarityScore,
    threatScore: row.threatScore.total,
    threatLevel: severityToThreatLevel(severity),
    status: mapStatus(row.status),
    detectedAt: row.detectedAt,
    timeAgo: timeAgo(row.detectedAt),

    explanation: row.intelligence.explanation,
    matchingLabels: row.intelligence.matchingLabels,
    metadata: {
      "Asset type": inferAssetType("image"),
      Views: row.views,
      Shares: row.shares,
      "AI source": row.intelligence.aiSource,
      "Case status": row.caseStatus ?? "Unassigned",
      "Confidence": row.threatScore.confidence,
      "Virality": row.threatScore.virality,
      "Platform risk": row.threatScore.platformRisk,
    },

    sourceUrl: row.sourceUrl,
    sourceTitle: row.sourceTitle,
  };
}

/* ─────────────────── Page ─────────────────────── */

export default function DetectionsPage() {
  const [rawRows, setRawRows] = useState<DetectionResponseRow[] | null>(null);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const [sort, setSort] = useState<SortConfig>({ key: "detectedAt", dir: "desc" });
  const [page, setPage] = useState(0);

  /* ── Fetch data ── */
  useEffect(() => {
    let mounted = true;
    void fetch("/api/detections")
      .then((res) => res.json() as Promise<{ detections: DetectionResponseRow[] }>)
      .then((body) => {
        if (mounted) setRawRows(body.detections ?? []);
      });
    return () => {
      mounted = false;
    };
  }, []);

  /* ── Transform ── */
  const allRows = useMemo<DetectionTableRow[]>(
    () => (rawRows ?? []).map(transformRow),
    [rawRows]
  );

  /* ── Counts per severity for filter chips ── */
  const severityCounts = useMemo(() => {
    const counts = { all: 0, critical: 0, high: 0, medium: 0, low: 0 };
    (rawRows ?? []).forEach((row) => {
      const s = mapRiskToSeverity(row.riskLevel);
      counts.all += 1;
      if (s in counts) counts[s as keyof typeof counts] += 1;
    });
    return counts;
  }, [rawRows]);

  /* ── Filter & Sort ── */
  const filtered = useMemo(() => {
    let result = allRows;

    // Severity filter
    if (severity !== "all") {
      result = result.filter((r) => {
        if (severity === "critical") return r.threatLevel === "high" && r.threatScore >= 75;
        if (severity === "high") return r.threatLevel === "high";
        if (severity === "medium") return r.threatLevel === "medium";
        return r.threatLevel === "low";
      });
    }

    // Search
    if (query) {
      const needle = query.toLowerCase();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(needle) ||
          r.assetName.toLowerCase().includes(needle) ||
          r.platform.toLowerCase().includes(needle) ||
          r.sourceTitle.toLowerCase().includes(needle) ||
          r.status.toLowerCase().includes(needle)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [allRows, query, severity, sort]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  /* ── KPIs ── */
  const criticalCount = allRows.filter(
    (r) => r.threatLevel === "high" && r.threatScore >= 75
  ).length;
  const avgThreat =
    allRows.length > 0
      ? Math.round(allRows.reduce((sum, r) => sum + r.threatScore, 0) / allRows.length)
      : 0;
  const highSimilarity = allRows.filter((r) => r.similarityScore >= 85).length;

  /* ── Sort handler ── */
  const handleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );
    setPage(0);
  };

  /* ── Filter options ── */
  const filterOptions: FilterOption[] = [
    { value: "all", label: "All", count: severityCounts.all },
    { value: "critical", label: "Critical", count: severityCounts.critical },
    { value: "high", label: "High", count: severityCounts.high },
    { value: "medium", label: "Medium", count: severityCounts.medium },
    { value: "low", label: "Low", count: severityCounts.low },
  ];

  /* ── Create case ── */
  async function createCase(detectionId: string) {
    await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ detectionId }),
    });
    const response = await fetch("/api/detections");
    const body = (await response.json()) as { detections: DetectionResponseRow[] };
    setRawRows(body.detections ?? []);
  }

  /* ── Loading state ── */
  if (!rawRows) {
    return <PageLoadingState title="Loading detection workspace" />;
  }

  return (
    <PageShell>
      <div className="space-y-8">
        {/* ── Header ── */}
        <PageHeader
          eyebrow="Detection workspace"
          title="Content Misuse Monitor"
          description="High-performance detection table to review, filter, and investigate flagged content across platforms."
        />

        {/* ── KPI Cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total Detections"
            value={allRows.length}
            hint="All indexed match events"
            icon={<ShieldAlert className="h-5 w-5" />}
          />
          <MetricCard
            label="Critical Threats"
            value={criticalCount}
            hint="Highest-severity items"
            icon={<ShieldAlert className="h-5 w-5" />}
            tone="danger"
          />
          <MetricCard
            label="High Similarity"
            value={highSimilarity}
            hint="Above 85% fingerprint match"
            icon={<Sparkles className="h-5 w-5" />}
            tone="warning"
          />
          <MetricCard
            label="Avg Threat Score"
            value={avgThreat}
            hint="Across all detection events"
            icon={<Eye className="h-5 w-5" />}
          />
        </div>

        {/* ── Main Detection Table Section ── */}
        <SectionCard
          title="Detection Queue"
          description="Sort by any column, filter by severity, expand rows for match reasoning and metadata."
          action={
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
          }
        >
          <div className="space-y-4">
            {/* ── Filter Bar ── */}
            <FilterBar
              query={query}
              onQueryChange={(v) => {
                setQuery(v);
                setPage(0);
              }}
              searchPlaceholder="Search ID, asset, platform, source…"
              filterLabel="Severity"
              filterOptions={filterOptions}
              activeFilter={severity}
              onFilterChange={(v) => {
                setSeverity(v as SeverityFilter);
                setPage(0);
              }}
            />

            {/* ── Table ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${severity}-${query}-${sort.key}-${sort.dir}`}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                <DetectionTable
                  rows={pageRows}
                  sortConfig={sort}
                  onSort={handleSort}
                  renderActions={(row) => (
                    <>
                      <Button size="sm" variant="destructive">
                        Generate takedown
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          void createCase(row.id);
                        }}
                      >
                        Create case
                      </Button>
                      <Button size="sm" variant="ghost">
                        Mark safe
                      </Button>
                    </>
                  )}
                />
              </motion.div>
            </AnimatePresence>

            {/* ── Pagination ── */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-sm">
              <div className="text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of {filtered.length}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>

                {/* Page number pills */}
                <div className="flex items-center gap-0.5 px-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (page < 3) {
                      pageNum = i;
                    } else if (page > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                          pageNum === page
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
