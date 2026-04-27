import { readDb } from "@/lib/mvp-db";
import { CaseRecord, Detection } from "@/lib/mvp-types";

function startOfWindow(days: number) {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

export function buildTrendPoints(detections: Detection[], days = 7) {
  const points = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    const key = date.toISOString().slice(0, 10);
    return { date: key, detections: 0, threat: 0 };
  });

  detections.forEach((detection) => {
    const key = detection.detectedAt.slice(0, 10);
    const point = points.find((item) => item.date === key);
    if (!point) return;
    point.detections += 1;
    point.threat += detection.threatScore.total;
  });

  return points;
}

export async function buildAnalyticsSnapshot() {
  const db = await readDb();
  const recentCutoff = startOfWindow(7);
  const recentDetections = db.detections.filter((item) => new Date(item.detectedAt).getTime() >= recentCutoff);

  const byAsset = new Map<string, { assetId: string; assetName: string; count: number; maxThreat: number }>();
  db.detections.forEach((detection) => {
    const asset = db.assets.find((item) => item.id === detection.assetId);
    const existing = byAsset.get(detection.assetId);
    const next = {
      assetId: detection.assetId,
      assetName: asset?.fileName ?? detection.assetId,
      count: (existing?.count ?? 0) + 1,
      maxThreat: Math.max(existing?.maxThreat ?? 0, detection.threatScore.total),
    };
    byAsset.set(detection.assetId, next);
  });

  const byPlatform = new Map<string, number>();
  db.detections.forEach((detection) => {
    byPlatform.set(detection.platform, (byPlatform.get(detection.platform) ?? 0) + 1);
  });

  const openCases = db.cases.filter((item) => item.status !== "resolved").length;

  return {
    summary: {
      totalAssets: db.assets.length,
      totalDetections: db.detections.length,
      openCases,
      averageThreat: db.detections.length > 0
        ? Math.round(db.detections.reduce((sum, detection) => sum + detection.threatScore.total, 0) / db.detections.length)
        : 0,
    },
    topAssets: [...byAsset.values()].sort((a, b) => b.count - a.count).slice(0, 5),
    topPlatforms: [...byPlatform.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([platform, count]) => ({ platform, count })),
    recentDetections: recentDetections.slice(0, 10),
    trends: buildTrendPoints(db.detections, 7),
    cases: db.cases.slice(0, 10) as CaseRecord[],
  };
}
