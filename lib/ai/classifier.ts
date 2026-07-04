import { env } from "@/lib/env";
import { classifyWithMock } from "@/lib/ai/providers/mock";
import { classifyWithOpenAICompatible } from "@/lib/ai/providers/openaiCompatible";
import type { ClassificationResult } from "@/types";

export async function classifyCivicIssue(
  imageBuffer: Buffer,
  mimeType: string,
  description?: string | null
): Promise<ClassificationResult> {
  if (env.aiProvider === "openai-compatible" || env.aiProvider === "openrouter") {
    return classifyWithOpenAICompatible(imageBuffer, mimeType, description);
  }
  return classifyWithMock(description);
}
