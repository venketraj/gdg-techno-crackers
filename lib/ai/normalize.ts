import type { CivicCategory, ClassificationResult, Severity } from "@/types";

const categories: CivicCategory[] = [
  "road_damage",
  "garbage",
  "drain_blockage",
  "water_leakage",
  "broken_streetlight",
  "flooding",
  "fallen_tree",
  "illegal_dumping",
  "unknown"
];

const severities: Severity[] = ["low", "medium", "high", "critical"];

function parseJsonish(text: string) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in AI response.");
    return JSON.parse(match[0]);
  }
}

export function safeFallbackClassification(reason: string): ClassificationResult {
  return {
    category: "road_damage",
    severity: "critical",
    confidence: 0.7,
    reason
  };
}

export function normalizeClassification(text: string): ClassificationResult {
  try {
    const data = parseJsonish(text);
    const category = categories.includes(data.category) ? data.category : "unknown";
    const severity = severities.includes(data.severity) ? data.severity : "medium";
    const confidence = Math.max(0, Math.min(1, Number(data.confidence ?? 0.5)));
    const reason = String(data.reason || "AI classification completed.").slice(0, 500);
    return { category, severity, confidence, reason };
  } catch (error) {
    return safeFallbackClassification(error instanceof Error ? error.message : "AI response could not be parsed.");
  }
}
