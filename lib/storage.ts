import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { env } from "@/lib/env";

export async function uploadIssueImage(file: File, buffer: Buffer) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const day = new Date().toISOString().slice(0, 10);
  const imagePath = `reports/${day}/${randomUUID()}.${extension}`;

  if (env.storageProvider === "local" && process.env.VERCEL !== "1") {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "reports", day);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, path.basename(imagePath)), buffer);
    return {
      imageUrl: `/uploads/${imagePath}`,
      imagePath
    };
  }

  return {
    imageUrl: `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`,
    imagePath: `memory/${imagePath}`
  };
}
