import { randomUUID } from "crypto";
import { distanceMeters, weightedCenter } from "@/lib/geo";
import { calculatePriorityScore, departmentForCategory, higherSeverity } from "@/lib/scoring";
import { env } from "@/lib/env";
import { clusterText, isTextClusterMatch, textSimilarity } from "@/lib/textClustering";
import { demoSeed } from "@/data/demoSeed";
import type {
  ClassificationResult,
  ClusterStatus,
  DashboardPayload,
  DemoUser,
  IssueClusterRow,
  IssueValidationRow,
  ReportRow,
  SensitivePlaceRow,
  ValidationStatus
} from "@/types";

function cloneSeed<T>(value: T): T {
  return structuredClone(value);
}

const sensitivePlaces: SensitivePlaceRow[] = cloneSeed(demoSeed.sensitivePlaces);
const clusters: IssueClusterRow[] = cloneSeed(demoSeed.clusters);
const reports: ReportRow[] = cloneSeed(demoSeed.reports);
const users: DemoUser[] = cloneSeed(demoSeed.users);
const validations: IssueValidationRow[] = cloneSeed(demoSeed.validations);

function syncVoiceOfMaduraiTitle() {
  const rankedCitizens = users
    .filter((user) => user.role === "citizen")
    .sort((a, b) => b.score - a.score);
  const winnerId = rankedCitizens[0]?.score >= 120 ? rankedCitizens[0].id : null;

  for (const user of users) {
    if (user.role === "citizen") {
      user.title = user.id === winnerId ? "Voice of Madurai" : null;
    }
  }
}

function scoreAuthenticity(input: {
  description: string | null;
  confidence: number;
  imageUrl: string;
  matchedExistingCluster: boolean;
}) {
  let score = 25;
  if (input.imageUrl) score += 25;
  if ((input.description || "").trim().length >= 18) score += 18;
  score += Math.round(Math.min(1, input.confidence) * 22);
  if (input.matchedExistingCluster) score += 10;
  return Math.max(0, Math.min(100, score));
}

function awardUserScore(userId: string | null | undefined, points: number, validated: boolean) {
  if (!userId) return null;
  const user = users.find((item) => item.id === userId && item.role === "citizen");
  if (!user) return null;
  user.score += points;
  if (validated) user.reportsValidated += 1;
  syncVoiceOfMaduraiTitle();
  return user;
}

export function loginDemoUser(identifier: string) {
  const normalized = identifier.trim().toLowerCase();
  const user = users.find((item) => {
    return item.name.toLowerCase() === normalized || item.phone === identifier.trim() || item.id.toLowerCase() === normalized;
  });
  return user || null;
}

export function getDemoScoreboard() {
  syncVoiceOfMaduraiTitle();
  return [...users]
    .filter((user) => user.role === "citizen")
    .sort((a, b) => b.score - a.score)
    .map((user, index) => ({ ...user, rank: index + 1 }));
}

export function getDemoValidations() {
  return [...validations].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}

export function validateDemoIssue(validationId: string, status: ValidationStatus, note?: string | null) {
  const validation = validations.find((item) => item.id === validationId);
  if (!validation) return null;
  validation.status = status;
  validation.admin_note = note || null;
  validation.validated_at = new Date().toISOString();
  if (status === "valid") {
    awardUserScore(validation.user_id, 20, true);
  }
  if (status === "rejected") {
    awardUserScore(validation.user_id, -5, false);
  }
  return validation;
}

function summary(): DashboardPayload["summary"] {
  const openClusters = clusters.filter((cluster) => !["resolved", "citizen_verified"].includes(cluster.status));
  const categoryCounts = clusters.reduce<Record<string, number>>((acc, cluster) => {
    acc[cluster.category] = (acc[cluster.category] || 0) + cluster.report_count;
    return acc;
  }, {});
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "none";
  return {
    totalReports: reports.length + clusters.reduce((sum, cluster) => sum + cluster.report_count, 0),
    openClusters: openClusters.length,
    criticalClusters: clusters.filter((cluster) => cluster.severity === "critical").length,
    topCategory: topCategory as DashboardPayload["summary"]["topCategory"],
    avgPriority: Math.round(clusters.reduce((sum, cluster) => sum + cluster.priority_score, 0) / Math.max(1, clusters.length))
  };
}

function sensitivePlaceScore(latitude: number, longitude: number) {
  return Math.min(
    20,
    sensitivePlaces
      .filter((place) => distanceMeters(latitude, longitude, place.latitude, place.longitude) <= env.sensitivePlaceRadiusMeters)
      .reduce((sum, place) => sum + place.weight, 0)
  );
}

export function getDemoDashboard(): DashboardPayload {
  return {
    clusters: [...clusters].sort((a, b) => b.priority_score - a.priority_score),
    reports: [...reports].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 20),
    summary: summary()
  };
}

export async function createDemoReport(input: {
  imageUrl: string;
  imagePath: string;
  latitude: number;
  longitude: number;
  description: string | null;
  classification: ClassificationResult;
  rainfallRiskScore: number;
  userId?: string | null;
  userName?: string | null;
}) {
  const openStatuses: ClusterStatus[] = ["received", "assigned", "in_progress"];
  let nearest: IssueClusterRow | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  let textMatchedCluster: IssueClusterRow | null = null;
  let bestTextScore = 0;
  const incomingText = clusterText(input.description, input.classification.reason);

  for (const cluster of clusters) {
    if (cluster.category !== input.classification.category || !openStatuses.includes(cluster.status)) continue;

    const distance = distanceMeters(input.latitude, input.longitude, cluster.center_latitude, cluster.center_longitude);
    const clusterDescription = clusterText(cluster.latest_reason, null);
    const similarity = textSimilarity(incomingText, clusterDescription);

    if (isTextClusterMatch(incomingText, clusterDescription) && similarity >= bestTextScore) {
      textMatchedCluster = cluster;
      bestTextScore = similarity;
    }

    if (distance <= env.clusterRadiusMeters && distance < nearestDistance) {
      nearest = cluster;
      nearestDistance = distance;
    }
  }

  const createdAt = new Date().toISOString();
  let cluster = textMatchedCluster || nearest;
  let matchedExistingCluster = Boolean(nearest);
  if (textMatchedCluster) matchedExistingCluster = true;

  if (cluster) {
    const nextCount = cluster.report_count + 1;
    const shouldUpdateCenter =
      distanceMeters(input.latitude, input.longitude, cluster.center_latitude, cluster.center_longitude) <= env.clusterRadiusMeters;
    const nextCenter = shouldUpdateCenter
      ? weightedCenter(cluster.center_latitude, cluster.center_longitude, cluster.report_count, input.latitude, input.longitude)
      : { latitude: cluster.center_latitude, longitude: cluster.center_longitude };
    const nextSeverity = higherSeverity(cluster.severity, input.classification.severity);
    cluster.center_latitude = nextCenter.latitude;
    cluster.center_longitude = nextCenter.longitude;
    cluster.report_count = nextCount;
    cluster.severity = nextSeverity;
    cluster.latest_reason = incomingText || input.classification.reason;
    cluster.priority_score = calculatePriorityScore({
      severity: nextSeverity,
      reportCount: nextCount,
      sensitivePlaceScore: sensitivePlaceScore(input.latitude, input.longitude),
      unresolvedHours: Math.max(0, (Date.now() - Date.parse(cluster.created_at)) / 36e5),
      rainfallRiskScore: input.rainfallRiskScore,
      category: input.classification.category
    });
    cluster.updated_at = createdAt;
  } else {
    matchedExistingCluster = false;
    cluster = {
      id: randomUUID(),
      category: input.classification.category,
      center_latitude: input.latitude,
      center_longitude: input.longitude,
      report_count: 1,
      priority_score: calculatePriorityScore({
        severity: input.classification.severity,
        reportCount: 1,
        sensitivePlaceScore: sensitivePlaceScore(input.latitude, input.longitude),
        unresolvedHours: 0,
        rainfallRiskScore: input.rainfallRiskScore,
        category: input.classification.category
      }),
      severity: input.classification.severity,
      status: "received",
      assigned_department: departmentForCategory(input.classification.category),
      latest_reason: incomingText || input.classification.reason,
      created_at: createdAt,
      updated_at: createdAt
    };
    clusters.unshift(cluster);
  }

  const report: ReportRow = {
    id: randomUUID(),
    image_url: input.imageUrl,
    image_path: input.imagePath,
    latitude: input.latitude,
    longitude: input.longitude,
    category: input.classification.category,
    severity: input.classification.severity,
    confidence: input.classification.confidence,
    description: input.description,
    ai_reason: input.classification.reason,
    cluster_id: cluster.id,
    status: "received",
    created_at: createdAt
  };
  reports.unshift(report);

  const reporter = input.userId ? users.find((user) => user.id === input.userId) : null;
  if (reporter && reporter.role === "citizen") {
    reporter.reportsSubmitted += 1;
    awardUserScore(reporter.id, 8, false);
  }

  validations.unshift({
    id: randomUUID(),
    report_id: report.id,
    cluster_id: cluster.id,
    user_id: reporter?.id || "guest",
    user_name: reporter?.name || input.userName || "Guest reporter",
    description: input.description,
    category: input.classification.category,
    severity: input.classification.severity,
    image_url: input.imageUrl,
    latitude: input.latitude,
    longitude: input.longitude,
    authenticity_score: scoreAuthenticity({
      description: input.description,
      confidence: input.classification.confidence,
      imageUrl: input.imageUrl,
      matchedExistingCluster
    }),
    status: "pending",
    admin_note: null,
    created_at: createdAt,
    validated_at: null
  });

  return { report, cluster, matchedExistingCluster };
}

export function updateDemoClusterStatus(id: string, status: ClusterStatus) {
  const cluster = clusters.find((item) => item.id === id);
  if (!cluster) return null;
  cluster.status = status;
  cluster.updated_at = new Date().toISOString();
  return cluster;
}
