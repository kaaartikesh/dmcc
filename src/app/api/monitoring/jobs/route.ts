import { NextResponse } from "next/server";
import { runCrawlForConnector, runGlobalMonitoringCycle } from "@/lib/mvp-monitoring-engine";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { connectorId?: string; runAll?: boolean };

  if (body.runAll) {
    const runs = await runGlobalMonitoringCycle();
    return NextResponse.json({ runs });
  }

  if (!body.connectorId) {
    return NextResponse.json({ error: "connectorId or runAll=true is required" }, { status: 400 });
  }

  try {
    const result = await runCrawlForConnector(body.connectorId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to run crawl" },
      { status: 400 },
    );
  }
}
