import { NextResponse } from "next/server";
import { ensureDataset } from "@/lib/mvp-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const db = await ensureDataset();

  const asset = db.assets.find((item) => item.id === id);
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const matches = db.detections.filter((item) => item.assetId === id);
  const relatedCases = db.cases.filter((item) => item.assetId === id);

  return NextResponse.json({
    asset,
    matches,
    cases: relatedCases,
  });
}
