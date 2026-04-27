import { NextResponse } from "next/server";
import { ensureConnectors } from "@/lib/mvp-monitoring-engine";
import { readDb, writeDb } from "@/lib/mvp-db";

export async function GET() {
  const db = await ensureConnectors();
  return NextResponse.json({ connectors: db.connectors });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { connectorId: string; status: "active" | "paused" | "error" };
  const db = await readDb();
  const connector = db.connectors.find((item) => item.id === body.connectorId);
  if (!connector) {
    return NextResponse.json({ error: "Connector not found" }, { status: 404 });
  }
  connector.status = body.status;
  await writeDb(db);
  return NextResponse.json({ connector });
}
