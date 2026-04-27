import { NextResponse } from "next/server";
import { buildAnalyticsSnapshot } from "@/lib/mvp-analytics";

export async function GET() {
  const analytics = await buildAnalyticsSnapshot();
  return NextResponse.json(analytics);
}
