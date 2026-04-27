import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { detectUnauthorizedUsage } from "@/lib/mvp-detection";
import { generateFingerprint, newId } from "@/lib/mvp-fingerprint";
import { MediaAsset } from "@/lib/mvp-types";
import { ensureDataset, saveAssetWithDetections } from "@/lib/mvp-service";

const threshold = 75;

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are supported in MVP" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const storedName = `${Date.now()}-${newId("asset")}${ext}`;
  const absolutePath = path.join(uploadDir, storedName);
  await writeFile(absolutePath, bytes);

  const fingerprint = await generateFingerprint(bytes, absolutePath, file.name);
  const imageUrl = `/uploads/${storedName}`;
  const assetId = newId("asset");

  const asset: MediaAsset = {
    id: assetId,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    createdAt: new Date().toISOString(),
    imageUrl,
    fingerprint,
  };

  const { monitoredImages } = await ensureDataset();
  const detections = detectUnauthorizedUsage(asset, monitoredImages, threshold);

  const savedDetections = await saveAssetWithDetections(asset, detections);

  return NextResponse.json({
    asset,
    detections: savedDetections,
    threshold,
  });
}
