import { NextRequest, NextResponse } from "next/server";
import { classifyCivicIssue } from "@/lib/ai/classifier";
import { createReportAndUpdateCluster } from "@/lib/db/clusterService";
import { uploadIssueImage } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const latitude = Number(formData.get("latitude"));
    const longitude = Number(formData.get("longitude"));
    const descriptionValue = formData.get("description");
    const userIdValue = formData.get("userId");
    const userNameValue = formData.get("userName");
    const description = typeof descriptionValue === "string" && descriptionValue.trim() ? descriptionValue.trim() : null;
    const userId = typeof userIdValue === "string" && userIdValue.trim() ? userIdValue.trim() : null;
    const userName = typeof userNameValue === "string" && userNameValue.trim() ? userNameValue.trim() : null;

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ error: "Valid latitude and longitude are required." }, { status: 400 });
    }

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const classification = await classifyCivicIssue(buffer, image.type || "image/jpeg", description);
    const uploaded = await uploadIssueImage(image, buffer);
    const result = await createReportAndUpdateCluster({
      imageUrl: uploaded.imageUrl,
      imagePath: uploaded.imagePath,
      latitude,
      longitude,
      description,
      classification,
      userId,
      userName
    });

    return NextResponse.json({ classification, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create report.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
