import { buildAnalyticsSnapshot } from "@/lib/mvp-analytics";
import { generateGeminiJson, hasGeminiConfigured } from "@/lib/gemini";
import { Detection, MediaAsset } from "@/lib/mvp-types";

function normalizeReasons(reasons: unknown, fallback: string[]) {
  if (!Array.isArray(reasons)) {
    return fallback;
  }
  const cleaned = reasons
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 4);
  return cleaned.length > 0 ? cleaned : fallback;
}

function normalizeLabels(labels: unknown, fallback: string[]) {
  if (!Array.isArray(labels)) {
    return fallback;
  }
  const cleaned = labels
    .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
    .filter(Boolean)
    .slice(0, 8);
  return cleaned.length > 0 ? cleaned : fallback;
}

export async function enrichDetectionWithAI(asset: MediaAsset, detection: Detection): Promise<Detection> {
  if (!hasGeminiConfigured()) {
    return detection;
  }

  try {
    const result = await generateGeminiJson<{
      explanation?: string[];
      semanticSummary?: string;
      matchingLabels?: string[];
    }>({
      systemInstruction:
        "You explain why two media assets likely match. Respond with strict JSON only. Keep explanations factual, concise, and useful for trust-and-safety analysts.",
      prompt: JSON.stringify({
        task: "Explain why this content was flagged as a likely match",
        protectedAsset: {
          fileName: asset.fileName,
          labels: asset.fingerprint.labels,
          ownershipSignals: asset.ownershipVerification?.notes ?? [],
        },
        detectedSource: {
          title: detection.sourceTitle,
          url: detection.sourceUrl,
          platform: detection.platform,
          labels: detection.intelligence.matchingLabels,
          views: detection.views,
          shares: detection.shares,
        },
        existingDetection: {
          similarityScore: detection.similarityScore,
          threatScore: detection.threatScore.total,
          currentExplanation: detection.intelligence.explanation,
          semanticSummary: detection.intelligence.semanticSummary,
        },
        outputShape: {
          explanation: ["reason 1", "reason 2"],
          semanticSummary: "one short summary",
          matchingLabels: ["label-a", "label-b"],
        },
      }),
    });

    return {
      ...detection,
      intelligence: {
        ...detection.intelligence,
        explanation: normalizeReasons(result.explanation, detection.intelligence.explanation),
        semanticSummary:
          typeof result.semanticSummary === "string" && result.semanticSummary.trim()
            ? result.semanticSummary.trim()
            : detection.intelligence.semanticSummary,
        matchingLabels: normalizeLabels(result.matchingLabels, detection.intelligence.matchingLabels),
        aiSource: "gemini",
      },
    };
  } catch {
    return detection;
  }
}

export async function answerAssistantQuestionWithAI(question: string) {
  if (!hasGeminiConfigured()) {
    return null;
  }

  try {
    const analytics = await buildAnalyticsSnapshot();
    const result = await generateGeminiJson<{
      answer?: string;
      citations?: string[];
    }>({
      systemInstruction:
        "You are an IP protection operations assistant. Answer only from the supplied dashboard data. Be concise, specific, and never invent missing facts. Respond with strict JSON.",
      prompt: JSON.stringify({
        question,
        context: {
          summary: analytics.summary,
          topAssets: analytics.topAssets.slice(0, 5),
          topPlatforms: analytics.topPlatforms.slice(0, 5),
          recentDetections: analytics.recentDetections.slice(0, 5).map((item) => ({
            id: item.id,
            assetId: item.assetId,
            sourceTitle: item.sourceTitle,
            platform: item.platform,
            threatScore: item.threatScore.total,
            explanation: item.intelligence.explanation,
          })),
          cases: analytics.cases.slice(0, 5).map((item) => ({
            id: item.id,
            title: item.title,
            status: item.status,
            threatScore: item.threatScore,
          })),
        },
        outputShape: {
          answer: "short answer",
          citations: ["id_1", "id_2"],
        },
      }),
    });

    if (!result.answer?.trim()) {
      return null;
    }

    return {
      answer: result.answer.trim(),
      citations: Array.isArray(result.citations)
        ? result.citations.filter((item): item is string => typeof item === "string").slice(0, 5)
        : [],
    };
  } catch {
    return null;
  }
}

export async function generateLegalDraftWithAI(asset: MediaAsset, detection: Detection) {
  if (!hasGeminiConfigured()) {
    return null;
  }

  try {
    const result = await generateGeminiJson<{
      subject?: string;
      summary?: string;
      email?: string;
    }>({
      systemInstruction:
        "You draft concise copyright and takedown notices for a rights-protection product. Use a professional tone, avoid unsupported legal claims, and respond with strict JSON only.",
      prompt: JSON.stringify({
        task: "Create a takedown notice draft",
        protectedAsset: {
          fileName: asset.fileName,
          createdAt: asset.createdAt,
          ownershipSignals: asset.ownershipVerification?.notes ?? [],
        },
        detection: {
          id: detection.id,
          sourceTitle: detection.sourceTitle,
          sourceUrl: detection.sourceUrl,
          platform: detection.platform,
          threatScore: detection.threatScore,
          explanation: detection.intelligence.explanation,
          semanticSummary: detection.intelligence.semanticSummary,
        },
        outputShape: {
          subject: "email subject",
          summary: "one short case summary",
          email: "full email body",
        },
      }),
    });

    if (!result.subject?.trim() || !result.summary?.trim() || !result.email?.trim()) {
      return null;
    }

    return {
      subject: result.subject.trim(),
      summary: result.summary.trim(),
      email: result.email.trim(),
    };
  } catch {
    return null;
  }
}
