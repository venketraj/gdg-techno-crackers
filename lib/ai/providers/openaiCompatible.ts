import { env } from "@/lib/env";
import { CIVIC_ISSUE_PROMPT } from "@/lib/ai/prompt";
import { normalizeClassification, safeFallbackClassification } from "@/lib/ai/normalize";
import type { ClassificationResult } from "@/types";

function cleanBaseUrl(url: string) {
  return url.replace(/\/$/, "");
}

export async function classifyWithOpenAICompatible(
  imageBuffer: Buffer,
  mimeType: string,
  description?: string | null
): Promise<ClassificationResult> {
  if (!env.openAICompatibleApiKey) {
    return safeFallbackClassification("OpenRouter key is missing; fallback classification used.");
  }

  const base64 = imageBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.openAICompatibleApiKey}`
  };

  if (env.openAICompatibleBaseUrl.includes("openrouter.ai")) {
    headers["HTTP-Referer"] = env.openAICompatibleSiteUrl;
    headers["X-Title"] = env.openAICompatibleAppName;
  }

  const response = await fetch(`${cleanBaseUrl(env.openAICompatibleBaseUrl)}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: env.openAICompatibleModel,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `${CIVIC_ISSUE_PROMPT}\n\nCitizen description: ${description || "None provided"}` },
            { type: "image_url", image_url: { url: dataUrl } }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return safeFallbackClassification(`OpenRouter failed with ${response.status}: ${errorText.slice(0, 160)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  const text = Array.isArray(content)
    ? content.map((part: { text?: string }) => part.text || "").join("\n")
    : String(content || "");

  return text.trim()
    ? normalizeClassification(text)
    : safeFallbackClassification("OpenRouter returned an empty response.");
}
