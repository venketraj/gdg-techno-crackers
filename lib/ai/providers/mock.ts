import type { ClassificationResult } from "@/types";

export async function classifyWithMock(description?: string | null): Promise<ClassificationResult> {
  const text = (description || "").toLowerCase();
  if (text.includes("garbage") || text.includes("dump")) {
    return { category: "garbage", severity: "high", confidence: 0.88, reason: "Mock provider inferred garbage from the report text." };
  }
  if (text.includes("water") || text.includes("leak")) {
    return { category: "water_leakage", severity: "high", confidence: 0.86, reason: "Mock provider inferred water leakage from the report text." };
  }
  if (text.includes("drain") || text.includes("flood")) {
    return { category: "drain_blockage", severity: "critical", confidence: 0.84, reason: "Mock provider inferred a blocked drain or flooding risk." };
  }
  if (text.includes("light") || text.includes("streetlight")) {
    return { category: "broken_streetlight", severity: "medium", confidence: 0.82, reason: "Mock provider inferred a broken streetlight." };
  }
  return {
    category: "road_damage",
    severity: "critical",
    confidence: 0.91,
    reason: "Mock provider returns a high-priority road damage case for demo reliability."
  };
}
