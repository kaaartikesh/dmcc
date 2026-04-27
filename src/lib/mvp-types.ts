export type RiskLevel = "high" | "medium" | "low";
export type CaseStatus = "open" | "investigating" | "resolved";

export interface Fingerprint {
  hash: string;
  labels: string[];
}

export interface OwnershipVerification {
  watermarkDetected: boolean;
  metadataValid: boolean;
  notes: string[];
}

export interface MediaAsset {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  imageUrl: string;
  fingerprint: Fingerprint;
  ownershipVerification?: OwnershipVerification;
}

export interface MonitoredImage {
  id: string;
  sourceUrl: string;
  title: string;
  imageUrl: string;
  platform?: string;
  views?: number;
  shares?: number;
  fingerprint: Fingerprint;
}

export interface DetectionAppearance {
  id: string;
  timestamp: string;
  platform: string;
  url: string;
  views: number;
  shares: number;
}

export interface DetectionIntelligence {
  explanation: string[];
  matchingLabels: string[];
  semanticSummary: string;
  aiSource: "google-vision" | "gemini" | "heuristic";
  ownershipSignals: string[];
}

export interface ThreatScore {
  confidence: number;
  virality: number;
  platformRisk: number;
  total: number;
}

export interface Detection {
  id: string;
  assetId: string;
  monitoredImageId?: string;
  similarityScore: number;
  status: "Unauthorized" | "Review";
  riskLevel: RiskLevel;
  detectedAt: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceImageUrl: string;
  platform: string;
  views: number;
  shares: number;
  intelligence: DetectionIntelligence;
  threatScore: ThreatScore;
  spread: DetectionAppearance[];
  caseId?: string;
}

export interface CaseRecord {
  id: string;
  assetId: string;
  detectionIds: string[];
  title: string;
  summary: string;
  status: CaseStatus;
  priority: "urgent" | "high" | "normal";
  createdAt: string;
  updatedAt: string;
  threatScore: number;
  history?: CaseEvent[];
}

export interface CaseEvent {
  id: string;
  caseId: string;
  type: "created" | "status_changed" | "note";
  message: string;
  createdAt: string;
}

export interface MVPDatabase {
  assets: MediaAsset[];
  monitoredImages: MonitoredImage[];
  detections: Detection[];
  cases: CaseRecord[];
  connectors: SourceConnector[];
  crawlJobs: CrawlJob[];
  discoveries: DiscoveredMedia[];
  compliance: CompliancePolicy;
}

export type ConnectorType = "api" | "scraper" | "rss";
export type ConnectorStatus = "active" | "paused" | "error";

export interface SourceConnector {
  id: string;
  name: string;
  type: ConnectorType;
  sourceDomain: string;
  status: ConnectorStatus;
  rateLimitPerMin: number;
  lastRunAt?: string;
}

export interface CrawlJob {
  id: string;
  connectorId: string;
  status: "queued" | "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  discoveredCount: number;
  matchedCount: number;
}

export interface DiscoveredMedia {
  id: string;
  connectorId: string;
  title: string;
  sourceUrl: string;
  discoveredAt: string;
  platform: string;
  imageUrl: string;
  views: number;
  shares: number;
  fingerprint: Fingerprint;
}

export interface CompliancePolicy {
  respectRobotsTxt: boolean;
  maxRequestsPerMinute: number;
  regionsAllowed: string[];
  termsAccepted: boolean;
}
