import { readDb, writeDb } from "@/lib/mvp-db";
import { enrichDetectionWithAI } from "@/lib/mvp-ai";
import { buildMonitoringDataset } from "@/lib/mvp-monitoring";
import { CaseRecord, Detection, MVPDatabase, MediaAsset } from "@/lib/mvp-types";
import { newId } from "@/lib/mvp-fingerprint";
import { buildAnalyticsSnapshot } from "@/lib/mvp-analytics";
import { compareFingerprintSets, inferOwnershipVerification } from "@/lib/mvp-intelligence";

export async function ensureDataset(): Promise<MVPDatabase> {
  const db = await readDb();
  if (db.monitoredImages.length === 0) {
    db.monitoredImages = buildMonitoringDataset();
  }
  db.assets = db.assets.map((asset) => ({
    ...asset,
    ownershipVerification: asset.ownershipVerification ?? inferOwnershipVerification(asset),
  }));
  db.cases = db.cases ?? [];
  await writeDb(db);
  return db;
}

export async function saveAssetWithDetections(asset: MediaAsset, detections: Detection[]): Promise<Detection[]> {
  const db = await ensureDataset();
  const enrichedAsset = {
    ...asset,
    ownershipVerification: asset.ownershipVerification ?? inferOwnershipVerification(asset),
  };
  const enrichedDetections = await Promise.all(detections.map((detection) => enrichDetectionWithAI(enrichedAsset, detection)));
  db.assets.unshift(enrichedAsset);
  db.detections.unshift(...enrichedDetections);
  await writeDb(db);
  return enrichedDetections;
}

export async function createCaseFromDetection(detectionId: string): Promise<CaseRecord> {
  const db = await ensureDataset();
  const detection = db.detections.find((item) => item.id === detectionId);
  if (!detection) {
    throw new Error("Detection not found");
  }

  if (detection.caseId) {
    const existing = db.cases.find((item) => item.id === detection.caseId);
    if (existing) {
      return existing;
    }
  }

  const asset = db.assets.find((item) => item.id === detection.assetId);
  const now = new Date().toISOString();
  const caseRecord: CaseRecord = {
    id: newId("case"),
    assetId: detection.assetId,
    detectionIds: [detection.id],
    title: `${asset?.fileName ?? "Protected asset"} - ${detection.platform} violation`,
    summary: detection.intelligence.semanticSummary,
    status: "open",
    priority: detection.threatScore.total >= 85 ? "urgent" : detection.threatScore.total >= 70 ? "high" : "normal",
    createdAt: now,
    updatedAt: now,
    threatScore: detection.threatScore.total,
    history: [
      {
        id: newId("evt"),
        caseId: "",
        type: "created",
        message: `Case created from detection ${detection.id}.`,
        createdAt: now,
      },
    ],
  };

  if (caseRecord.history?.[0]) {
    caseRecord.history[0].caseId = caseRecord.id;
  }
  detection.caseId = caseRecord.id;
  db.cases.unshift(caseRecord);
  await writeDb(db);
  return caseRecord;
}

export async function updateCaseStatus(caseId: string, status: CaseRecord["status"]): Promise<CaseRecord> {
  const db = await ensureDataset();
  const caseRecord = db.cases.find((item) => item.id === caseId);
  if (!caseRecord) {
    throw new Error("Case not found");
  }
  caseRecord.status = status;
  caseRecord.updatedAt = new Date().toISOString();
  caseRecord.history = caseRecord.history ?? [];
  caseRecord.history.unshift({
    id: newId("evt"),
    caseId: caseRecord.id,
    type: "status_changed",
    message: `Case moved to ${status}.`,
    createdAt: caseRecord.updatedAt,
  });
  await writeDb(db);
  return caseRecord;
}

export async function reverseSearchAssets(imageAsset: MediaAsset, threshold: number) {
  const db = await ensureDataset();
  return db.assets
    .map((asset) => {
      const { similarityScore } = compareFingerprintSets(asset, imageAsset.fingerprint);
      return { asset, similarityScore };
    })
    .filter((item) => item.similarityScore >= threshold)
    .sort((a, b) => b.similarityScore - a.similarityScore);
}

export async function getAssistantContext() {
  return buildAnalyticsSnapshot();
}
