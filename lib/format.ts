import type { CivicCategory, ClusterStatus, Severity } from "@/types";

const categoryLabels: Record<CivicCategory, string> = {
  road_damage: "Road damage",
  garbage: "Garbage",
  drain_blockage: "Drain blockage",
  water_leakage: "Water leakage",
  broken_streetlight: "Broken streetlight",
  flooding: "Flooding",
  fallen_tree: "Fallen tree",
  illegal_dumping: "Illegal dumping",
  unknown: "Unknown"
};

const severityLabels: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
};

const statusLabels: Record<ClusterStatus, string> = {
  received: "Received",
  assigned: "Assigned",
  in_progress: "In progress",
  resolved: "Resolved",
  citizen_verified: "Citizen verified"
};

export function formatCategory(category: CivicCategory) {
  return categoryLabels[category] || category;
}

export function formatSeverity(severity: Severity) {
  return severityLabels[severity] || severity;
}

export function formatStatus(status: ClusterStatus) {
  return statusLabels[status] || status;
}
