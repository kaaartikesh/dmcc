import { NextResponse } from "next/server";
import { ensureDataset } from "@/lib/mvp-service";

export async function GET() {
  const db = await ensureDataset();
  const totalAssets = db.assets.length;
  const totalDetections = db.detections.length;
  const activeAlerts = db.detections.filter((item) => item.status === "Unauthorized").length;

  return NextResponse.json({
    totalAssets,
    totalDetections,
    activeAlerts,
    recentDetections: db.detections.slice(0, 10),
  });
}
