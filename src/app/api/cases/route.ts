import { NextResponse } from "next/server";
import { ensureDataset, createCaseFromDetection, updateCaseStatus } from "@/lib/mvp-service";

export async function GET() {
  const db = await ensureDataset();
  return NextResponse.json({ cases: db.cases });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { detectionId?: string };
  if (!body.detectionId) {
    return NextResponse.json({ error: "detectionId is required" }, { status: 400 });
  }

  try {
    const caseRecord = await createCaseFromDetection(body.detectionId);
    return NextResponse.json({ case: caseRecord });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create case" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { caseId?: string; status?: "open" | "investigating" | "resolved" };
  if (!body.caseId || !body.status) {
    return NextResponse.json({ error: "caseId and status are required" }, { status: 400 });
  }

  try {
    const caseRecord = await updateCaseStatus(body.caseId, body.status);
    return NextResponse.json({ case: caseRecord });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update case" }, { status: 400 });
  }
}
