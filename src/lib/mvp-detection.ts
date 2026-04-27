import { buildDetectionFromSource } from "@/lib/mvp-intelligence";
import { Detection, MediaAsset, MonitoredImage } from "@/lib/mvp-types";

export function detectUnauthorizedUsage(
  asset: MediaAsset,
  monitoredImages: MonitoredImage[],
  threshold: number,
): Detection[] {
  const detections: Detection[] = [];

  for (const monitored of monitoredImages) {
    const detection = buildDetectionFromSource({
      asset,
      monitoredImageId: monitored.id,
      sourceTitle: monitored.title,
      sourceUrl: monitored.sourceUrl,
      sourceImageUrl: monitored.imageUrl,
      sourceFingerprint: monitored.fingerprint,
      views: monitored.views,
      shares: monitored.shares,
      threshold,
      aiSource: asset.fingerprint.labels.length > 0 ? "google-vision" : "heuristic",
    });

    if (detection) {
      detections.push(detection);
    }
  }

  return detections;
}
