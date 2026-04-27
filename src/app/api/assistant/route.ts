import { NextResponse } from "next/server";
import { answerAssistantQuestion } from "@/lib/mvp-assistant";

export async function POST(request: Request) {
  const body = (await request.json()) as { question?: string };
  if (!body.question?.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  const result = await answerAssistantQuestion(body.question);
  return NextResponse.json(result);
}
