import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateClusterStatus } from "@/lib/db/clusterService";

const bodySchema = z.object({
  status: z.enum(["received", "assigned", "in_progress", "resolved", "citizen_verified"]),
  note: z.string().optional().nullable()
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = bodySchema.parse(await request.json());
    const cluster = await updateClusterStatus(id, body.status, body.note);
    return NextResponse.json({ cluster });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update status.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
