import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginDemoUser } from "@/lib/db/demoStore";

const bodySchema = z.object({
  identifier: z.string().min(2)
});

export async function POST(request: NextRequest) {
  try {
    const body = bodySchema.parse(await request.json());
    const user = loginDemoUser(body.identifier);

    if (!user) {
      return NextResponse.json({ error: "No demo user found. Try Meena R, Arun Kumar, or Madurai Admin." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
