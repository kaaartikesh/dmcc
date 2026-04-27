import { createHash } from "node:crypto";
import {
  Detection,
  DetectionAppearance,
  DetectionIntelligence,
  MediaAsset,
  MonitoredImage,
  OwnershipVerification,
  RiskLevel,
  ThreatScore,
} from "@/lib/mvp-types";
import { hammingSimilarityPercent, newId } from "@/lib/mvp-fingerprint";

export function labelSimilarity(labelsA: string[], labelsB: string[]): number {
  const a = new Set(labelsA.map((item) => item.toLowerCase()));
  const b = new Set(labelsB.map((item) => item.toLowerCase()));
  if (a.size === 0 || b.size === 0) {
    return 0;
  }

  let overlap = 0;
  for (const label of a) {
    if (b.has(label)) {
      overlap += 1;
    }
  }

  return (overlap / Math.max(a.size, b.size)) * 100;
}

function stablePercent(seed: string, min: number, max: number) {
  const hash = createHash("sha256").update(seed).digest("hex");
  const value = parseInt(hash.slice(0, 8), 16) / 0xffffffff;
  return Math.round(min + value * (max - min));
}

export function inferPlatform(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    if (hostname.includes("youtube")) return "YouTube";
    if (hostname.includes("reddit")) return "Reddit";
    if (hostname.includes("telegram")) return "Telegram";
    if (hostname.includes("x.com") || hostname.includes("twitter")) return "X / Twitter";
    if (hostname.includes("facebook")) return "Facebook";
    if (hostname.includes("instagram")) return "Instagram";
    if (hostname.includes("tiktok")) return "TikTok";
    if (hostname.includes("news")) return "News";
    if (hostname.includes("promo")) return "Promo Site";
    if (hostname.includes("forum")) return "Forum";
    return hostname.split(".")[0];
  } catch {
    return "Unknown";
  }
}

function platformRiskScore(platform: string) {
  const normalized = platform.toLowerCase();
  if (normalized.includes("telegram")) return 95;
  if (normalized.includes("reddit")) return 72;
  if (normalized.includes("youtube")) return 88;
  if (normalized.includes("x")) return 74;
  if (normalized.includes("tiktok")) return 80;
  if (normalized.includes("facebook")) return 68;
  return 60;
}

export function inferOwnershipVerification(asset: MediaAsset): OwnershipVerification {
  const lowerName = asset.fileName.toLowerCase();
  const lowerLabels = asset.fingerprint.labels.map((label) => label.toLowerCase());
  const watermarkDetected =
    lowerName.includes("watermark") ||
    lowerName.includes("official") ||
    lowerLabels.includes("logo") ||
    lowerLabels.includes("branding");

  const metadataValid = asset.size > 0 && asset.mimeType.startsWith("image/");
  const notes = [
    metadataValid ? "Metadata is consistent with an owned uploaded asset." : "Metadata looks incomplete for a production claim.",
  ];

  if (watermarkDetected) {
    notes.push("Ownership markers suggest embedded branding or watermark cues.");
  } else {
    notes.push("No explicit watermark marker detected; ownership relies on stored upload provenance.");
  }

  return { watermarkDetected, metadataValid, notes };
}

export function buildDetectionIntelligence(
  asset: MediaAsset,
  source: Pick<MonitoredImage, "title" | "sourceUrl" | "fingerprint">,
  similarityScore: number,
  aiSource: "google-vision" | "gemini" | "heuristic",
): DetectionIntelligence {
  const assetLabels = asset.fingerprint.labels.map((label) => label.toLowerCase());
  const sourceLabels = source.fingerprint.labels.map((label) => label.toLowerCase());
  const matchingLabels = assetLabels.filter((label) => sourceLabels.includes(label));
  const explanation: string[] = [];

  if (matchingLabels.includes("player") || matchingLabels.includes("person")) {
    explanation.push("Same player or subject appears in both images.");
  }
  if (matchingLabels.includes("logo") || matchingLabels.includes("branding") || matchingLabels.includes("team")) {
    explanation.push("Logo and team branding cues overlap with the protected asset.");
  }
  if (matchingLabels.includes("stadium") || matchingLabels.includes("match") || matchingLabels.includes("crowd")) {
    explanation.push("Scene context looks aligned, including venue or event framing.");
  }
  if (similarityScore >= 90) {
    explanation.push("Visual fingerprint similarity is extremely high.");
  }
  if (explanation.length === 0) {
    explanation.push("Shared labels and perceptual fingerprint indicate likely reuse of the uploaded asset.");
  }

  return {
    explanation,
    matchingLabels,
    semanticSummary: `Likely reuse of protected content on ${inferPlatform(source.sourceUrl)} with overlapping sports context.`,
    aiSource,
    ownershipSignals: asset.ownershipVerification?.notes ?? [],
  };
}

export function buildThreatScore(
  similarityScore: number,
  platform: string,
  seed: string,
  views?: number,
  shares?: number,
): ThreatScore {
  const computedViews = views ?? stablePercent(`${seed}:views`, 300, 200000);
  const computedShares = shares ?? stablePercent(`${seed}:shares`, 20, 18000);
  const confidence = Math.max(1, Math.min(100, Math.round(similarityScore)));
  const virality = Math.max(1, Math.min(100, Math.round(Math.log10(computedViews + computedShares + 10) * 23)));
  const platformRisk = platformRiskScore(platform);
  const total = Math.max(1, Math.min(100, Math.round(confidence * 0.55 + virality * 0.25 + platformRisk * 0.2)));

  return { confidence, virality, platformRisk, total };
}

export function inferRisk(totalThreat: number): RiskLevel {
  if (totalThreat >= 85) return "high";
  if (totalThreat >= 65) return "medium";
  return "low";
}

export function buildSpread(
  detectedAt: string,
  platform: string,
  sourceUrl: string,
  views: number,
  shares: number,
): DetectionAppearance[] {
  const base = new Date(detectedAt).getTime();
  return [0, 1, 2, 4].map((offset, index) => ({
    id: newId("spr"),
    timestamp: new Date(base - (4 - offset) * 6 * 60 * 60 * 1000).toISOString(),
    platform,
    url: sourceUrl,
    views: Math.max(10, Math.round(views * ((index + 1) / 4))),
    shares: Math.max(1, Math.round(shares * ((index + 1) / 4))),
  }));
}

export function compareFingerprintSets(
  protectedAsset: MediaAsset,
  sourceFingerprint: MonitoredImage["fingerprint"],
) {
  const hashScore = hammingSimilarityPercent(protectedAsset.fingerprint.hash, sourceFingerprint.hash);
  const labelsScore = labelSimilarity(protectedAsset.fingerprint.labels, sourceFingerprint.labels);
  const similarityScore = Math.round(hashScore * 0.65 + labelsScore * 0.35);
  return { hashScore, labelsScore, similarityScore };
}

export function buildDetectionFromSource(params: {
  asset: MediaAsset;
  monitoredImageId?: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceImageUrl: string;
  sourceFingerprint: MonitoredImage["fingerprint"];
  detectedAt?: string;
  views?: number;
  shares?: number;
  threshold: number;
  aiSource: "google-vision" | "gemini" | "heuristic";
}): Detection | null {
  const { asset, threshold } = params;
  const { similarityScore } = compareFingerprintSets(asset, params.sourceFingerprint);
  if (similarityScore < threshold) {
    return null;
  }

  const platform = inferPlatform(params.sourceUrl);
  const views = params.views ?? stablePercent(`${asset.id}:${params.sourceUrl}:views`, 300, 200000);
  const shares = params.shares ?? stablePercent(`${asset.id}:${params.sourceUrl}:shares`, 20, 18000);
  const detectedAt = params.detectedAt ?? new Date().toISOString();
  const intelligence = buildDetectionIntelligence(
    asset,
    { title: params.sourceTitle, sourceUrl: params.sourceUrl, fingerprint: params.sourceFingerprint },
    similarityScore,
    params.aiSource,
  );
  const threatScore = buildThreatScore(similarityScore, platform, `${asset.id}:${params.sourceUrl}`, views, shares);

  return {
    id: newId("det"),
    assetId: asset.id,
    monitoredImageId: params.monitoredImageId,
    similarityScore,
    status: threatScore.total >= 70 ? "Unauthorized" : "Review",
    riskLevel: inferRisk(threatScore.total),
    detectedAt,
    sourceTitle: params.sourceTitle,
    sourceUrl: params.sourceUrl,
    sourceImageUrl: params.sourceImageUrl,
    platform,
    views,
    shares,
    intelligence,
    threatScore,
    spread: buildSpread(detectedAt, platform, params.sourceUrl, views, shares),
  };
}
