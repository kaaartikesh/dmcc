import { createHash, randomUUID } from "node:crypto";
import { extractLabels } from "@/lib/mvp-vision";
import { Fingerprint } from "@/lib/mvp-types";

function fallbackLabels(fileName: string): string[] {
  const normalized = fileName.toLowerCase();
  const labelHints = [
    "sports",
    "stadium",
    "player",
    "team",
    "match",
    "logo",
    "crowd",
  ];

  return labelHints.filter((hint) => normalized.includes(hint)).slice(0, 5);
}

export async function generateFingerprint(
  imageBytes: Buffer,
  _absoluteFilePath: string,
  fileName: string,
): Promise<Fingerprint> {
  const hash = createHash("sha256").update(imageBytes).digest("hex");

  const labelsFromVision = await extractLabels(imageBytes);
  const labels = labelsFromVision.length > 0 ? labelsFromVision : fallbackLabels(fileName);

  return {
    hash,
    labels,
  };
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}

export function hammingSimilarityPercent(hashA: string, hashB: string): number {
  const len = Math.min(hashA.length, hashB.length);
  if (len === 0) {
    return 0;
  }

  let equal = 0;
  for (let i = 0; i < len; i += 1) {
    if (hashA[i] === hashB[i]) {
      equal += 1;
    }
  }
  return (equal / len) * 100;
}
