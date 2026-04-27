import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateFingerprint, newId } from "@/lib/mvp-fingerprint";
import { reverseSearchAssets } from "@/lib/mvp-service";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are supported" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const storedName = `${Date.now()}-${newId("reverse")}${ext}`;
  const absolutePath = path.join(uploadDir, storedName);
  await writeFile(absolutePath, bytes);

  const fingerprint = await generateFingerprint(bytes, absolutePath, file.name);
  const results = await reverseSearchAssets({
    id: newId("search"),
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    createdAt: new Date().toISOString(),
    imageUrl: `/uploads/${storedName}`,
    fingerprint,
  }, 60);

  return NextResponse.json({
    queryAsset: {
      fileName: file.name,
      imageUrl: `/uploads/${storedName}`,
      fingerprint,
    },
    results: results.map((item) => ({
      asset: item.asset,
      similarityScore: item.similarityScore,
    })),
  });
}
