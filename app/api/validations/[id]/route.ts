import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateDemoIssue } from "@/lib/db/demoStore";

const bodySchema = z.object({
  status: z.enum(["pending", "valid", "rejected"]),
  note: z.string().optional().nullable()
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = bodySchema.parse(await request.json());
    const validation = validateDemoIssue(id, body.status, body.note);

    if (!validation) {
      return NextResponse.json({ error: "Validation item not found." }, { status: 404 });
    }

    return NextResponse.json({ validation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Validation update failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
