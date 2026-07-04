import { NextResponse } from "next/server";
import { getDemoValidations } from "@/lib/db/demoStore";

export async function GET() {
  return NextResponse.json({
    validations: getDemoValidations()
  });
}
