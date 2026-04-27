import { buildAnalyticsSnapshot } from "@/lib/mvp-analytics";
import { answerAssistantQuestionWithAI } from "@/lib/mvp-ai";
import { readDb } from "@/lib/mvp-db";

export async function answerAssistantQuestion(question: string) {
  const aiAnswer = await answerAssistantQuestionWithAI(question);
  if (aiAnswer) {
    return aiAnswer;
  }

  const analytics = await buildAnalyticsSnapshot();
  const db = await readDb();
  const normalized = question.toLowerCase();

  if (normalized.includes("most at risk")) {
    const top = analytics.topAssets[0];
    return {
      answer: top
        ? `${top.assetName} is currently the most exposed asset with ${top.count} detections and a peak threat score of ${top.maxThreat}.`
        : "There are no risky assets yet because the system has not recorded detections.",
      citations: top ? [top.assetId] : [],
    };
  }

  if (normalized.includes("top violation") || normalized.includes("this week")) {
    const list = analytics.recentDetections
      .slice(0, 3)
      .map((item) => `${item.sourceTitle} on ${item.platform} (${item.threatScore.total}/100 threat)`)
      .join("; ");
    return {
      answer: list || "No violations were detected in the last week.",
      citations: analytics.recentDetections.slice(0, 3).map((item) => item.id),
    };
  }

  if (normalized.includes("why was this flagged")) {
    const idMatch = question.match(/det_[a-z0-9]+/i) ?? question.match(/det-[a-z0-9]+/i);
    const detection = idMatch ? db.detections.find((item) => item.id.toLowerCase() === idMatch[0].toLowerCase()) : db.detections[0];
    if (!detection) {
      return { answer: "I could not find a detection to explain yet.", citations: [] };
    }
    return {
      answer: `${detection.sourceTitle} was flagged because the confidence score is ${detection.threatScore.confidence}, the platform risk is ${detection.threatScore.platformRisk}, and the system found: ${detection.intelligence.explanation.join(" ")}`,
      citations: [detection.id],
    };
  }

  return {
    answer: `DMCC currently tracks ${analytics.summary.totalDetections} detections, ${analytics.summary.openCases} open cases, and an average threat score of ${analytics.summary.averageThreat}. Ask about assets at risk, top violations this week, or why a detection was flagged.`,
    citations: [],
  };
}
