import { NextResponse } from "next/server";
import { ensureDataset } from "@/lib/mvp-service";

export async function GET() {
  const db = await ensureDataset();
  const detections = db.detections.map((detection) => {
    const asset = db.assets.find((item) => item.id === detection.assetId);
    const caseRecord = detection.caseId ? db.cases.find((item) => item.id === detection.caseId) : null;

    return {
      ...detection,
      assetName: asset?.fileName ?? "Unknown Asset",
      assetImageUrl: asset?.imageUrl ?? "",
      caseStatus: caseRecord?.status ?? null,
      ownershipVerification: asset?.ownershipVerification ?? null,
    };
  });

  return NextResponse.json({ detections });
}
