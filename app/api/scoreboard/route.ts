import { NextResponse } from "next/server";
import { getDemoScoreboard } from "@/lib/db/demoStore";

export async function GET() {
  return NextResponse.json({
    users: getDemoScoreboard()
  });
}
