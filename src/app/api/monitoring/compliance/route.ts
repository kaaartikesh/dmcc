import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/mvp-db";

export async function GET() {
  const db = await readDb();
  return NextResponse.json({ compliance: db.compliance });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as {
    respectRobotsTxt: boolean;
    maxRequestsPerMinute: number;
    regionsAllowed: string[];
    termsAccepted: boolean;
  };

  const db = await readDb();
  db.compliance = body;
  await writeDb(db);
  return NextResponse.json({ compliance: db.compliance });
}
