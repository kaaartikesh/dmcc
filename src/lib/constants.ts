export const APP_NAME = "DMCC";
export const APP_FULL_NAME = "Digital Media Control Center";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { id: "monitor", label: "Detection Monitor", href: "/monitor", icon: "Radar" },
  { id: "operations", label: "Monitoring Ops", href: "/operations", icon: "Cpu" },
  { id: "upload", label: "Upload Assets", href: "/upload", icon: "Upload" },
  { id: "assets", label: "Asset Library", href: "/assets", icon: "FolderOpen" },
] as const;

export const RISK_LEVELS = {
  critical: { label: "Critical", color: "#ff3b5c", bg: "rgba(255,59,92,0.1)", border: "rgba(255,59,92,0.3)" },
  high: { label: "High", color: "#ff8c42", bg: "rgba(255,140,66,0.1)", border: "rgba(255,140,66,0.3)" },
  medium: { label: "Medium", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.3)" },
  low: { label: "Low", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)" },
} as const;

export type RiskLevel = keyof typeof RISK_LEVELS;

export const PLATFORMS = [
  "YouTube","Twitter/X","Instagram","TikTok","Facebook",
  "Reddit","Telegram","Discord","Twitch","Dailymotion",
] as const;

export const SPORTS_ORGS = [
  "Manchester United FC","Los Angeles Lakers","FC Barcelona",
  "New York Yankees","Golden State Warriors","Real Madrid CF",
  "Dallas Cowboys","Liverpool FC","Bayern Munich","Miami Heat",
] as const;

export const ASSET_TYPES = [
  "Match Highlight","Training Footage","Press Conference",
  "Behind the Scenes","Player Interview","Promotional Video",
  "Brand Content","Live Stream Clip",
] as const;

export const DETECTION_STATUSES = ["Active","Under Review","Takedown Sent","Removed","Disputed"] as const;

export const CHART_COLORS = {
  primary: "#00b4ff",
  secondary: "#8b5cf6",
  tertiary: "#00e5cc",
  quaternary: "#ec4899",
  grid: "rgba(255,255,255,0.04)",
  text: "#555570",
} as const;

export const DETECTION_LOCATIONS = [
  { lat: 40.71, lon: -74.01, label: "New York", risk: "critical" as const, count: 342 },
  { lat: 51.51, lon: -0.13, label: "London", risk: "high" as const, count: 287 },
  { lat: 48.86, lon: 2.35, label: "Paris", risk: "medium" as const, count: 156 },
  { lat: 35.68, lon: 139.65, label: "Tokyo", risk: "high" as const, count: 234 },
  { lat: 55.76, lon: 37.62, label: "Moscow", risk: "critical" as const, count: 189 },
  { lat: -33.87, lon: 151.21, label: "Sydney", risk: "low" as const, count: 67 },
  { lat: 19.08, lon: 72.88, label: "Mumbai", risk: "medium" as const, count: 198 },
  { lat: 37.77, lon: -122.42, label: "San Francisco", risk: "low" as const, count: 89 },
  { lat: 1.35, lon: 103.82, label: "Singapore", risk: "medium" as const, count: 134 },
  { lat: -23.55, lon: -46.63, label: "São Paulo", risk: "high" as const, count: 267 },
  { lat: 25.20, lon: 55.27, label: "Dubai", risk: "medium" as const, count: 112 },
  { lat: 52.52, lon: 13.41, label: "Berlin", risk: "low" as const, count: 78 },
];
