import { NextResponse } from "next/server";
import { ensureDataset } from "@/lib/mvp-service";

export async function GET() {
  const db = await ensureDataset();
  const assets = db.assets.map((asset) => {
    const assetDetections = db.detections.filter((item) => item.assetId === asset.id);
    const openCases = db.cases.filter((item) => item.assetId === asset.id && item.status !== "resolved").length;

    return {
      ...asset,
      matches: assetDetections.length,
      highestThreat: assetDetections.reduce((max, detection) => Math.max(max, detection.threatScore.total), 0),
      openCases,
    };
  });
  return NextResponse.json({ assets });
}
