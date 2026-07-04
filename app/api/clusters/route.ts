import { NextResponse } from "next/server";
import { getDashboardPayload } from "@/lib/db/clusterService";

export async function GET() {
  try {
    return NextResponse.json(await getDashboardPayload());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load dashboard.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
