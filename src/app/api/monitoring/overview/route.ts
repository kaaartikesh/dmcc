import { NextResponse } from "next/server";
import { ensureConnectors } from "@/lib/mvp-monitoring-engine";
import { buildAnalyticsSnapshot } from "@/lib/mvp-analytics";

export async function GET() {
  const db = await ensureConnectors();
  const analytics = await buildAnalyticsSnapshot();

  return NextResponse.json({
    connectors: db.connectors,
    jobs: db.crawlJobs.slice(0, 10),
    discoveries: db.discoveries.slice(0, 20),
    compliance: db.compliance,
    analytics,
    cases: db.cases.slice(0, 10),
  });
}
