import { RiskLevel } from "./constants";

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pastDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  d.setHours(randInt(0, 23), randInt(0, 59));
  return d;
};

const platforms = ["YouTube","Twitter/X","Instagram","TikTok","Facebook","Reddit","Telegram","Twitch"] as const;
const orgs = ["Manchester United FC","Los Angeles Lakers","FC Barcelona","New York Yankees","Golden State Warriors","Real Madrid CF","Dallas Cowboys","Liverpool FC","Bayern Munich","Miami Heat"] as const;
const assetTypes = ["Match Highlight","Training Footage","Press Conference","Behind the Scenes","Player Interview","Promotional Video","Brand Content","Live Stream Clip"] as const;
const statuses = ["Active","Under Review","Takedown Sent","Removed","Disputed"] as const;
const risks: RiskLevel[] = ["critical","high","medium","low"];

export interface Detection {
  id: string;
  assetName: string;
  assetType: string;
  organization: string;
  platform: string;
  url: string;
  detectedAt: Date;
  risk: RiskLevel;
  status: string;
  matchScore: number;
  views: number;
  shares: number;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  organization: string;
  uploadedAt: Date;
  detections: number;
  riskLevel: RiskLevel;
  thumbnail: string;
  duration: string;
  fileSize: string;
}

export interface Alert {
  id: string;
  message: string;
  risk: RiskLevel;
  timestamp: Date;
  source: string;
}

export interface KPIData {
  label: string;
  value: number;
  change: number;
  changeLabel: string;
  icon: string;
}

export function generateDetections(count: number): Detection[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `DET-${String(i + 1001).padStart(5, "0")}`,
    assetName: `${pick(orgs)} - ${pick(assetTypes)}`,
    assetType: pick(assetTypes),
    organization: pick(orgs),
    platform: pick(platforms),
    url: `https://${pick(platforms).toLowerCase().replace("/x","")}.com/watch/${Math.random().toString(36).slice(2,10)}`,
    detectedAt: pastDate(30),
    risk: pick(risks),
    status: pick(statuses),
    matchScore: randInt(65, 99),
    views: randInt(500, 2500000),
    shares: randInt(10, 50000),
  }));
}

export function generateAssets(count: number): Asset[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: `${pick(orgs)} - ${pick(assetTypes)}`,
    type: pick(assetTypes),
    organization: pick(orgs),
    uploadedAt: pastDate(60),
    detections: randInt(0, 45),
    riskLevel: pick(risks),
    thumbnail: `/api/placeholder/${320}/${180}`,
    duration: `${randInt(0, 12)}:${String(randInt(0, 59)).padStart(2, "0")}`,
    fileSize: `${randInt(15, 800)} MB`,
  }));
}

export function generateAlerts(count: number): Alert[] {
  const templates = [
    (org: string, p: string) => `New unauthorized copy detected on ${p} — ${org}`,
    (org: string) => `Takedown request confirmed for ${org} content`,
    (_: string, p: string) => `High-risk match (98%) found on ${p}`,
    (org: string) => `${org} asset spreading rapidly — 12 new sources`,
    (_: string, p: string) => `DMCA counter-notice received from ${p}`,
    (org: string) => `Risk level escalated to Critical — ${org}`,
  ];
  return Array.from({ length: count }, (_, i) => {
    const org = pick(orgs);
    const p = pick(platforms);
    return {
      id: `ALT-${String(i + 1).padStart(4, "0")}`,
      message: pick(templates)(org, p),
      risk: pick(risks),
      timestamp: pastDate(3),
      source: p,
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export const kpiData: KPIData[] = [
  { label: "Active Detections", value: 1847, change: 12.5, changeLabel: "vs last week", icon: "Radar" },
  { label: "Assets Protected", value: 342, change: 8.2, changeLabel: "vs last month", icon: "Shield" },
  { label: "Takedowns Issued", value: 956, change: -3.1, changeLabel: "vs last week", icon: "Gavel" },
  { label: "Threat Score", value: 73, change: 5.7, changeLabel: "trending up", icon: "AlertTriangle" },
];

export const weeklyDetections = [
  { day: "Mon", detections: 124, takedowns: 89 },
  { day: "Tue", detections: 156, takedowns: 102 },
  { day: "Wed", detections: 189, takedowns: 134 },
  { day: "Thu", detections: 142, takedowns: 118 },
  { day: "Fri", detections: 201, takedowns: 156 },
  { day: "Sat", detections: 98, takedowns: 67 },
  { day: "Sun", detections: 76, takedowns: 52 },
];

export const platformBreakdown = [
  { name: "YouTube", value: 35, color: "#ff0000" },
  { name: "Twitter/X", value: 22, color: "#1da1f2" },
  { name: "Instagram", value: 18, color: "#e1306c" },
  { name: "TikTok", value: 15, color: "#00f2ea" },
  { name: "Others", value: 10, color: "#8b5cf6" },
];

export const monthlyTrend = Array.from({ length: 12 }, (_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  detections: randInt(800, 2200),
  resolved: randInt(600, 1800),
}));
