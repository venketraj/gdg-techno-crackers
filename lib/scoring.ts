import type { CivicCategory, Severity } from "@/types";

const severityWeight: Record<Severity, number> = {
  low: 20,
  medium: 45,
  high: 75,
  critical: 100
};

const severityRank: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

const categoryBoost: Partial<Record<CivicCategory, number>> = {
  flooding: 8,
  drain_blockage: 6,
  road_damage: 5,
  water_leakage: 5,
  fallen_tree: 4
};

export function higherSeverity(a: Severity, b: Severity): Severity {
  return severityRank[a] >= severityRank[b] ? a : b;
}

export function departmentForCategory(category: CivicCategory) {
  const departments: Record<CivicCategory, string> = {
    road_damage: "Public Works / Highways",
    garbage: "Municipality Sanitation",
    drain_blockage: "Drainage / Stormwater Department",
    water_leakage: "Water Supply Board",
    broken_streetlight: "Electricity / Street Lighting",
    flooding: "Disaster Response / Stormwater",
    fallen_tree: "Parks / Disaster Response",
    illegal_dumping: "Municipality Enforcement",
    unknown: "Constituency Office"
  };
  return departments[category];
}

export function calculatePriorityScore(input: {
  severity: Severity;
  reportCount: number;
  sensitivePlaceScore: number;
  unresolvedHours: number;
  rainfallRiskScore: number;
  category: CivicCategory;
}) {
  const severityScore = severityWeight[input.severity] * 0.4;
  const reportCountScore = Math.min(30, input.reportCount * 4);
  const ageScore = Math.min(10, input.unresolvedHours / 6);
  const score =
    severityScore +
    reportCountScore +
    Math.min(20, input.sensitivePlaceScore) +
    ageScore +
    Math.min(10, input.rainfallRiskScore) +
    (categoryBoost[input.category] || 0);
  return Math.max(0, Math.min(100, Math.round(score)));
}
