import { formatDate } from "@/lib/utils";

export type DetectionRow = {
  id: string;
  assetId: string;
  similarityScore: number;
  status: string;
  riskLevel: "high" | "medium" | "low";
  detectedAt: string;
  assetName: string;
  assetImageUrl: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceImageUrl: string;
  platform: string;
  views: number;
  shares: number;
  caseId?: string | null;
  caseStatus?: "open" | "investigating" | "resolved" | null;
  intelligence: {
    explanation: string[];
    matchingLabels: string[];
    semanticSummary: string;
    aiSource: "google-vision" | "gemini" | "heuristic";
    ownershipSignals: string[];
  };
  threatScore: {
    confidence: number;
    virality: number;
    platformRisk: number;
    total: number;
  };
  spread: Array<{
    id: string;
    timestamp: string;
    platform: string;
    url: string;
    views: number;
    shares: number;
  }>;
  ownershipVerification?: {
    watermarkDetected: boolean;
    metadataValid: boolean;
    notes: string[];
  } | null;
};

export type DashboardResponse = {
  totalAssets: number;
  totalDetections: number;
  activeAlerts: number;
  recentDetections: DetectionRow[];
};

export type DetectionResponseRow = DetectionRow;

export type AssetsResponseRow = {
  id: string;
  fileName: string;
  mimeType: string;
  imageUrl: string;
  createdAt: string;
  fingerprint: { hash: string; labels: string[] };
  ownershipVerification?: {
    watermarkDetected: boolean;
    metadataValid: boolean;
    notes: string[];
  };
  matches: number;
  highestThreat?: number;
  openCases?: number;
};

export type AssetDetailResponse = {
  asset: {
    id: string;
    fileName: string;
    mimeType: string;
    size: number;
    createdAt: string;
    imageUrl: string;
    fingerprint: { hash: string; labels: string[] };
    ownershipVerification?: {
      watermarkDetected: boolean;
      metadataValid: boolean;
      notes: string[];
    };
  };
  matches: DetectionRow[];
  cases: Array<{
    id: string;
    title: string;
    summary: string;
    status: "open" | "investigating" | "resolved";
    priority: "urgent" | "high" | "normal";
    createdAt: string;
    updatedAt: string;
    threatScore: number;
  }>;
};

export type DashboardKpi = {
  id: string;
  label: string;
  value: number;
  delta: number;
  unit?: string;
  spark: number[];
  tone?: "default" | "success" | "warning" | "danger";
  summary?: string;
};

export type TrendPoint = {
  hour: string;
  detections: number;
  takedowns: number;
};

export type AlertItem = {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  ts: string;
  source: string;
};

export type ActivityItem = {
  id: string;
  user: string;
  action: string;
  target: string;
  ts: string;
};

export type PlatformPoint = {
  platform: string;
  value: number;
};

export type MapPoint = {
  country: string;
  code: string;
  x: number;
  y: number;
  count: number;
  severity: "critical" | "high" | "medium" | "low";
};

export type AnalyticsResponse = {
  summary: {
    totalAssets: number;
    totalDetections: number;
    openCases: number;
    averageThreat: number;
  };
  topAssets: Array<{
    assetId: string;
    assetName: string;
    count: number;
    maxThreat: number;
  }>;
  topPlatforms: Array<{
    platform: string;
    count: number;
  }>;
  recentDetections: DetectionRow[];
  trends: Array<{
    date: string;
    detections: number;
    threat: number;
  }>;
  cases: Array<{
    id: string;
    title: string;
    summary: string;
    status: "open" | "investigating" | "resolved";
    priority: "urgent" | "high" | "normal";
    threatScore: number;
  }>;
};

const worldSlots = [
  { country: "United States", code: "US", x: 22, y: 38 },
  { country: "Brazil", code: "BR", x: 34, y: 64 },
  { country: "United Kingdom", code: "GB", x: 48, y: 30 },
  { country: "Germany", code: "DE", x: 52, y: 32 },
  { country: "India", code: "IN", x: 67, y: 46 },
  { country: "Japan", code: "JP", x: 84, y: 38 },
  { country: "Australia", code: "AU", x: 84, y: 70 },
  { country: "Mexico", code: "MX", x: 20, y: 48 },
];

function stableIndex(value: string, max: number) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % max;
}

export function mapRiskToSeverity(risk: "high" | "medium" | "low"): "critical" | "high" | "medium" | "low" {
  if (risk === "high") return "critical";
  if (risk === "medium") return "high";
  return "low";
}

export function mapStatus(status: string) {
  return status === "Unauthorized" ? "active" : status.toLowerCase();
}

export function inferAssetType(mimeType?: string) {
  if (!mimeType) return "image";
  if (mimeType.startsWith("video")) return "video";
  if (mimeType.startsWith("audio")) return "audio";
  return "image";
}

export function getPlatformLabel(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    if (hostname.includes("youtube")) return "YouTube";
    if (hostname.includes("telegram")) return "Telegram";
    if (hostname.includes("twitter") || hostname.includes("x.com")) return "X / Twitter";
    if (hostname.includes("reddit")) return "Reddit";
    if (hostname.includes("facebook")) return "Facebook";
    if (hostname.includes("forum")) return "Forum";
    if (hostname.includes("news")) return "News";
    if (hostname.includes("promo")) return "Promo Site";
    return hostname.split(".")[0].replace(/[-_]/g, " ");
  } catch {
    return "Unknown";
  }
}

export function buildDashboardKpis(dashboard: DashboardResponse, detections: DetectionResponseRow[]): DashboardKpi[] {
  const coverage = dashboard.totalAssets > 0
    ? Number((((dashboard.totalAssets - dashboard.activeAlerts) / dashboard.totalAssets) * 100).toFixed(1))
    : 100;
  const avgThreat = detections.length > 0
    ? Math.round(detections.reduce((sum, row) => sum + row.threatScore.total, 0) / detections.length)
    : 0;

  return [
    {
      id: "assets",
      label: "Assets Monitored",
      value: dashboard.totalAssets,
      delta: 12.4,
      spark: makeSpark(Math.max(dashboard.totalAssets, 1)),
    },
    {
      id: "detections",
      label: "Active Detections",
      value: dashboard.activeAlerts,
      delta: -3.2,
      spark: makeSpark(Math.max(dashboard.activeAlerts, 1)),
    },
    {
      id: "threat",
      label: "Avg Threat Score",
      value: avgThreat,
      delta: 8.7,
      spark: makeSpark(Math.max(avgThreat, 1)),
    },
    {
      id: "coverage",
      label: "Global Coverage",
      value: coverage,
      delta: 0.4,
      unit: "%",
      spark: [94, 95, 95, 96, 96, 97, 97, 98, 98, 98, 99, 99],
    },
  ];
}

export function buildTrendData(rows: DetectionResponseRow[]): TrendPoint[] {
  const buckets = new Map<number, { detections: number; takedowns: number }>();
  const now = Date.now();

  for (let offset = 23; offset >= 0; offset -= 1) {
    buckets.set(offset, { detections: 0, takedowns: 0 });
  }

  rows.forEach((row) => {
    const diffHours = Math.floor((now - new Date(row.detectedAt).getTime()) / 3_600_000);
    if (diffHours >= 0 && diffHours < 24) {
      const slot = 23 - diffHours;
      const bucket = buckets.get(slot);
      if (!bucket) return;
      bucket.detections += 1;
      if (row.status !== "Unauthorized") {
        bucket.takedowns += 1;
      }
    }
  });

  return Array.from(buckets.entries()).map(([offset, value]) => ({
    hour: `${String(offset).padStart(2, "0")}:00`,
    detections: value.detections,
    takedowns: value.takedowns,
  }));
}

export function buildAlerts(rows: DetectionResponseRow[]): AlertItem[] {
  return rows.slice(0, 6).map((row) => ({
    id: row.id,
    title: row.sourceTitle || row.assetName,
    description: row.intelligence.explanation[0] ?? `${row.similarityScore}% fingerprint match`,
    severity: mapRiskToSeverity(row.riskLevel),
    ts: timeAgo(row.detectedAt),
    source: row.platform || getPlatformLabel(row.sourceUrl),
  }));
}

export function buildActivities(rows: DetectionResponseRow[]): ActivityItem[] {
  return rows.slice(0, 5).map((row, index) => ({
    id: row.id,
    user: index % 2 === 0 ? "DMCC Engine" : "Rights Team",
    action: row.caseId ? "updated case for" : row.status === "Unauthorized" ? "flagged" : "reviewed",
    target: row.id,
    ts: timeAgo(row.detectedAt),
  }));
}

export function buildPlatformBreakdown(rows: DetectionResponseRow[]): PlatformPoint[] {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const platform = row.platform || getPlatformLabel(row.sourceUrl);
    counts.set(platform, (counts.get(platform) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([platform, value]) => ({ platform, value }));
}

export function buildMapPoints(rows: DetectionResponseRow[]): MapPoint[] {
  const counts = new Map<string, MapPoint>();
  rows.forEach((row) => {
    const slot = worldSlots[stableIndex(row.id, worldSlots.length)];
    const current = counts.get(slot.code);
    if (current) {
      current.count += 1;
      current.severity = mapRiskToSeverity(row.riskLevel);
      return;
    }
    counts.set(slot.code, {
      ...slot,
      count: 1,
      severity: mapRiskToSeverity(row.riskLevel),
    });
  });

  return [...counts.values()];
}

export function buildAssetSeries(matches: AssetDetailResponse["matches"]) {
  const grouped = new Map<string, { detections: number; takedowns: number }>();

  for (let index = 29; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    grouped.set(key, { detections: 0, takedowns: 0 });
  }

  matches.forEach((match) => {
    const key = match.detectedAt.slice(0, 10);
    const bucket = grouped.get(key);
    if (!bucket) return;
    bucket.detections += 1;
    if (match.status !== "Unauthorized") {
      bucket.takedowns += 1;
    }
  });

  return [...grouped.entries()].map(([key, value], index) => ({
    day: `D${index + 1}`,
    detections: value.detections,
    takedowns: value.takedowns,
    label: formatDate(new Date(key)),
  }));
}

export function buildSpreadSeries(matches: AssetDetailResponse["matches"]) {
  return matches.flatMap((match) =>
    match.spread.map((event) => ({
      timestamp: event.timestamp,
      platform: event.platform,
      views: event.views,
      shares: event.shares,
    }))
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function buildAssetEvents(matches: AssetDetailResponse["matches"]) {
  return matches.slice(0, 5).map((match) => ({
    ts: timeAgo(match.detectedAt),
    title: match.sourceTitle || "Detection event",
    severity: mapRiskToSeverity(match.riskLevel),
  }));
}

export function buildPlatformDistribution(matches: AssetDetailResponse["matches"]) {
  const counts = new Map<string, number>();
  matches.forEach((match) => {
    counts.set(match.platform, (counts.get(match.platform) ?? 0) + 1);
  });
  return [...counts.entries()].map(([platform, count]) => ({ platform, count }));
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function makeSpark(seed: number) {
  return Array.from({ length: 12 }, (_, index) => Math.max(1, Math.round(seed * (0.4 + ((index + 3) % 5) * 0.08))));
}
