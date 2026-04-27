import { NextResponse } from "next/server";
import { generateTakedownDraft } from "@/lib/mvp-legal";

export async function POST(request: Request) {
  const body = (await request.json()) as { detectionId?: string };
  if (!body.detectionId) {
    return NextResponse.json({ error: "detectionId is required" }, { status: 400 });
  }

  try {
    const draft = await generateTakedownDraft(body.detectionId);
    return NextResponse.json(draft);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to generate draft" }, { status: 400 });
  }
}
