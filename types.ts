export type CivicCategory =
  | "road_damage"
  | "garbage"
  | "drain_blockage"
  | "water_leakage"
  | "broken_streetlight"
  | "flooding"
  | "fallen_tree"
  | "illegal_dumping"
  | "unknown";

export type Severity = "low" | "medium" | "high" | "critical";
export type ClusterStatus = "received" | "assigned" | "in_progress" | "resolved" | "citizen_verified";
export type UserRole = "citizen" | "admin";
export type ValidationStatus = "pending" | "valid" | "rejected";

export interface ClassificationResult {
  category: CivicCategory;
  severity: Severity;
  confidence: number;
  reason: string;
}

export interface ReportRow {
  id: string;
  image_url: string;
  image_path: string;
  latitude: number;
  longitude: number;
  category: CivicCategory;
  severity: Severity;
  confidence: number;
  description: string | null;
  ai_reason: string | null;
  cluster_id: string | null;
  status: ClusterStatus;
  created_at: string;
}

export interface DemoUser {
  id: string;
  name: string;
  phone: string;
  ward: string;
  role: UserRole;
  score: number;
  reportsSubmitted: number;
  reportsValidated: number;
  title: string | null;
}

export interface IssueValidationRow {
  id: string;
  report_id: string;
  cluster_id: string | null;
  user_id: string;
  user_name: string;
  description: string | null;
  category: CivicCategory;
  severity: Severity;
  image_url: string;
  latitude: number;
  longitude: number;
  authenticity_score: number;
  status: ValidationStatus;
  admin_note: string | null;
  created_at: string;
  validated_at: string | null;
}

export interface IssueClusterRow {
  id: string;
  category: CivicCategory;
  center_latitude: number;
  center_longitude: number;
  report_count: number;
  priority_score: number;
  severity: Severity;
  status: ClusterStatus;
  assigned_department: string | null;
  latest_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface SensitivePlaceRow {
  id: string;
  name: string;
  place_type: "school" | "hospital" | "bus_stand" | "market" | "other";
  latitude: number;
  longitude: number;
  weight: number;
}

export interface DashboardPayload {
  clusters: IssueClusterRow[];
  reports: ReportRow[];
  summary: {
    totalReports: number;
    openClusters: number;
    criticalClusters: number;
    topCategory: CivicCategory | "none";
    avgPriority: number;
  };
}
