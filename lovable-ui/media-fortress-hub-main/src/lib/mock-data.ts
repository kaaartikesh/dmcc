// Mock data layer — structured for easy API replacement later.

export type Severity = "critical" | "high" | "medium" | "low";
export type DetectionStatus = "active" | "resolved" | "investigating" | "false_positive";
export type AssetType = "video" | "image" | "stream" | "audio";

export interface KPI {
  id: string;
  label: string;
  value: number;
  delta: number; // percent
  unit?: string;
  spark: number[];
}

export interface Detection {
  id: string;
  asset: string;
  assetType: AssetType;
  platform: string;
  region: string;
  country: string;
  matchScore: number;
  severity: Severity;
  status: DetectionStatus;
  detectedAt: string; // ISO
  url: string;
  views: number;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  ts: string;
  source: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  ts: string;
}

export interface RegionPoint {
  country: string;
  code: string;
  x: number; // 0-100 svg coords
  y: number;
  count: number;
  severity: Severity;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  duration?: string;
  uploadedAt: string;
  fingerprint: string;
  matches: number;
  thumbnail: string;
}

const seedRand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

export const kpis: KPI[] = [
  {
    id: "monitored",
    label: "Assets Monitored",
    value: 18429,
    delta: 12.4,
    spark: [12, 18, 14, 22, 28, 24, 32, 38, 36, 44, 48, 52],
  },
  {
    id: "detections",
    label: "Active Detections",
    value: 247,
    delta: -3.2,
    spark: [42, 48, 54, 50, 46, 44, 40, 38, 36, 34, 30, 28],
  },
  {
    id: "takedowns",
    label: "Takedowns (24h)",
    value: 89,
    delta: 24.8,
    spark: [4, 8, 6, 12, 14, 18, 22, 28, 26, 32, 36, 42],
  },
  {
    id: "coverage",
    label: "Global Coverage",
    value: 98.7,
    delta: 0.4,
    unit: "%",
    spark: [94, 95, 95, 96, 96, 97, 97, 97, 98, 98, 98, 99],
  },
];

export const detectionTrend = Array.from({ length: 24 }, (_, i) => {
  const r = seedRand(i + 1);
  return {
    hour: `${i.toString().padStart(2, "0")}:00`,
    detections: Math.round(40 + r() * 80 + Math.sin(i / 3) * 20),
    takedowns: Math.round(20 + r() * 40 + Math.cos(i / 4) * 12),
  };
});

export const platformBreakdown = [
  { platform: "YouTube", value: 1842, color: "var(--color-chart-1)" },
  { platform: "TikTok", value: 1521, color: "var(--color-chart-2)" },
  { platform: "Twitch", value: 982, color: "var(--color-chart-3)" },
  { platform: "X / Twitter", value: 743, color: "var(--color-chart-4)" },
  { platform: "Telegram", value: 521, color: "var(--color-chart-5)" },
];

export const severityDist = [
  { name: "Critical", value: 12, color: "var(--color-destructive)" },
  { name: "High", value: 38, color: "var(--color-warning)" },
  { name: "Medium", value: 124, color: "var(--color-primary)" },
  { name: "Low", value: 73, color: "var(--color-muted-foreground)" },
];

const platforms = ["YouTube", "TikTok", "Twitch", "X / Twitter", "Telegram", "Reddit", "Facebook"];
const countries = [
  ["United States", "US"],
  ["Brazil", "BR"],
  ["Germany", "DE"],
  ["India", "IN"],
  ["Japan", "JP"],
  ["United Kingdom", "GB"],
  ["France", "FR"],
  ["Spain", "ES"],
  ["Mexico", "MX"],
  ["Australia", "AU"],
];
const regions = ["NA", "EU", "APAC", "LATAM", "MEA"];
const severities: Severity[] = ["critical", "high", "medium", "low"];
const statuses: DetectionStatus[] = ["active", "investigating", "resolved", "false_positive"];

export const detections: Detection[] = Array.from({ length: 120 }, (_, i) => {
  const r = seedRand(i + 100);
  const [country] = countries[Math.floor(r() * countries.length)];
  return {
    id: `DET-${(10240 + i).toString()}`,
    asset: `Match ${i + 1} — ${["UEFA Final 2024", "NBA Playoffs G7", "F1 Monaco GP", "NFL SB LIX", "Wimbledon F"][i % 5]}`,
    assetType: (["video", "image", "stream", "audio"] as AssetType[])[Math.floor(r() * 4)],
    platform: platforms[Math.floor(r() * platforms.length)],
    region: regions[Math.floor(r() * regions.length)],
    country,
    matchScore: Math.round((0.62 + r() * 0.38) * 1000) / 10,
    severity: severities[Math.floor(r() * severities.length)],
    status: statuses[Math.floor(r() * statuses.length)],
    detectedAt: new Date(Date.now() - Math.floor(r() * 1000 * 60 * 60 * 48)).toISOString(),
    url: `https://example.com/watch/${(Math.random() + 1).toString(36).slice(2, 10)}`,
    views: Math.floor(r() * 500_000),
  };
});

export const alerts: AlertItem[] = [
  { id: "a1", title: "Live stream piracy detected", description: "El Clásico — 4.2k concurrent viewers", severity: "critical", ts: "2m ago", source: "Telegram" },
  { id: "a2", title: "Logo misuse on retail page", description: "Unauthorized merchandise listing", severity: "high", ts: "8m ago", source: "Marketplace" },
  { id: "a3", title: "Highlight clip re-uploaded", description: "98.4% fingerprint match", severity: "medium", ts: "14m ago", source: "YouTube" },
  { id: "a4", title: "Player image deepfake", description: "AI-generated content flagged", severity: "high", ts: "22m ago", source: "X / Twitter" },
  { id: "a5", title: "Audio commentary leak", description: "Match-day broadcast audio", severity: "medium", ts: "31m ago", source: "TikTok" },
  { id: "a6", title: "Clean scan completed", description: "Region APAC — 0 anomalies", severity: "low", ts: "44m ago", source: "System" },
];

export const activities: ActivityItem[] = [
  { id: "v1", user: "Sarah Chen", action: "marked safe", target: "DET-10248", ts: "just now" },
  { id: "v2", user: "Marcus Lee", action: "issued takedown for", target: "DET-10247", ts: "3m ago" },
  { id: "v3", user: "AI Engine", action: "auto-flagged", target: "DET-10245", ts: "9m ago" },
  { id: "v4", user: "Priya Singh", action: "escalated", target: "DET-10244", ts: "18m ago" },
  { id: "v5", user: "Diego Alvarez", action: "added asset", target: "UEFA Final 2024", ts: "1h ago" },
];

export const mapPoints: RegionPoint[] = [
  { country: "USA", code: "US", x: 22, y: 38, count: 142, severity: "high" },
  { country: "Brazil", code: "BR", x: 34, y: 64, count: 88, severity: "medium" },
  { country: "UK", code: "GB", x: 48, y: 30, count: 64, severity: "low" },
  { country: "Germany", code: "DE", x: 52, y: 32, count: 76, severity: "medium" },
  { country: "Spain", code: "ES", x: 47, y: 38, count: 52, severity: "high" },
  { country: "India", code: "IN", x: 67, y: 46, count: 124, severity: "critical" },
  { country: "Japan", code: "JP", x: 84, y: 38, count: 41, severity: "low" },
  { country: "Australia", code: "AU", x: 84, y: 70, count: 28, severity: "low" },
  { country: "Mexico", code: "MX", x: 20, y: 48, count: 67, severity: "medium" },
  { country: "Egypt", code: "EG", x: 55, y: 46, count: 34, severity: "medium" },
];

export const assets: Asset[] = [
  { id: "AST-001", name: "UEFA Champions League Final 2024", type: "video", duration: "2:14:38", uploadedAt: "2024-06-01", fingerprint: "f1a8c2…9b4e", matches: 142, thumbnail: "ucl" },
  { id: "AST-002", name: "NBA Finals Game 7 Highlights", type: "video", duration: "12:04", uploadedAt: "2024-06-18", fingerprint: "a7d2e4…12c8", matches: 87, thumbnail: "nba" },
  { id: "AST-003", name: "F1 Monaco GP Onboard", type: "stream", duration: "Live", uploadedAt: "2024-05-26", fingerprint: "9c3f8a…b201", matches: 64, thumbnail: "f1" },
];
