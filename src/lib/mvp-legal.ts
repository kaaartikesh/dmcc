import { generateLegalDraftWithAI } from "@/lib/mvp-ai";
import { readDb } from "@/lib/mvp-db";

export async function generateTakedownDraft(detectionId: string) {
  const db = await readDb();
  const detection = db.detections.find((item) => item.id === detectionId);
  if (!detection) {
    throw new Error("Detection not found");
  }

  const asset = db.assets.find((item) => item.id === detection.assetId);
  if (!asset) {
    throw new Error("Asset not found");
  }

  const aiDraft = await generateLegalDraftWithAI(asset, detection);
  if (aiDraft) {
    return { ...aiDraft, detection, asset };
  }

  const subject = `DMCA Takedown Request - Unauthorized use of ${asset.fileName}`;
  const summary = [
    `${asset.fileName} appears to be reused on ${detection.platform}.`,
    `Threat score: ${detection.threatScore.total}/100 with confidence ${detection.threatScore.confidence}/100.`,
    ...detection.intelligence.explanation,
  ].join(" ");

  const email = [
    "To whom it may concern,",
    "",
    `We are the rights holder for the protected media asset "${asset.fileName}".`,
    `We identified unauthorized use at ${detection.sourceUrl}.`,
    "",
    "Why this is likely infringing:",
    ...detection.intelligence.explanation.map((reason) => `- ${reason}`),
    `- Matching labels: ${detection.intelligence.matchingLabels.join(", ") || "none"}.`,
    "",
    "Requested action:",
    "- Remove or disable access to the infringing content.",
    "- Preserve any associated logs or metadata for audit purposes.",
    "",
    "Ownership signals:",
    ...(asset.ownershipVerification?.notes ?? ["- Uploaded asset provenance is stored in DMCC."]),
    "",
    "Thank you.",
  ].join("\n");

  return { subject, summary, email, detection, asset };
}
