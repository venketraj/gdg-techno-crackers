import { getPostgresPool, query } from "@/lib/db/postgres";
import { env, hasPostgresConfig } from "@/lib/env";
import { distanceMeters, weightedCenter } from "@/lib/geo";
import { calculatePriorityScore, departmentForCategory, higherSeverity } from "@/lib/scoring";
import { getRainfallRiskScore } from "@/lib/weather/openMeteo";
import { createDemoReport, getDemoDashboard, updateDemoClusterStatus } from "@/lib/db/demoStore";
import { clusterText, isTextClusterMatch, textSimilarity } from "@/lib/textClustering";
import type {
  CivicCategory,
  ClassificationResult,
  ClusterStatus,
  DashboardPayload,
  IssueClusterRow,
  ReportRow,
  SensitivePlaceRow
} from "@/types";
import type { PoolClient } from "pg";

interface CreateReportInput {
  imageUrl: string;
  imagePath: string;
  latitude: number;
  longitude: number;
  description: string | null;
  classification: ClassificationResult;
  userId?: string | null;
  userName?: string | null;
}

const clusterFields = `
  id,
  category,
  center_latitude,
  center_longitude,
  report_count,
  priority_score,
  severity,
  status,
  assigned_department,
  latest_reason,
  created_at,
  updated_at
`;

const reportFields = `
  id,
  image_url,
  image_path,
  latitude,
  longitude,
  category,
  severity,
  confidence,
  description,
  ai_reason,
  cluster_id,
  status,
  created_at
`;

function normalizeCluster(row: IssueClusterRow): IssueClusterRow {
  return {
    ...row,
    center_latitude: Number(row.center_latitude),
    center_longitude: Number(row.center_longitude),
    report_count: Number(row.report_count),
    priority_score: Number(row.priority_score),
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString()
  };
}

function normalizeReport(row: ReportRow): ReportRow {
  return {
    ...row,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    confidence: Number(row.confidence),
    created_at: new Date(row.created_at).toISOString()
  };
}

async function loadSensitivePlaceScore(latitude: number, longitude: number) {
  const result = await query<SensitivePlaceRow>("select * from sensitive_places");
  const places = result.rows.filter((place) => {
    return distanceMeters(latitude, longitude, Number(place.latitude), Number(place.longitude)) <= env.sensitivePlaceRadiusMeters;
  });
  return Math.min(20, places.reduce((sum, place) => sum + (Number(place.weight) || 0), 0));
}

async function findMatchingOpenCluster(
  category: CivicCategory,
  latitude: number,
  longitude: number,
  description: string | null,
  fallbackReason: string | null
) {
  const result = await query<IssueClusterRow>(
    `select ${clusterFields}
     from issue_clusters
     where category = $1 and status = any($2::text[])
     order by updated_at desc
     limit 200`,
    [category, ["received", "assigned", "in_progress"]]
  );

  let nearest: IssueClusterRow | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  let textMatchedCluster: IssueClusterRow | null = null;
  let bestTextScore = 0;
  const incomingText = clusterText(description, fallbackReason);

  for (const rawCluster of result.rows) {
    const cluster = normalizeCluster(rawCluster);
    const distance = distanceMeters(latitude, longitude, cluster.center_latitude, cluster.center_longitude);
    const similarity = textSimilarity(incomingText, cluster.latest_reason);

    if (isTextClusterMatch(incomingText, cluster.latest_reason) && similarity >= bestTextScore) {
      textMatchedCluster = cluster;
      bestTextScore = similarity;
    }

    if (distance < nearestDistance && distance <= env.clusterRadiusMeters) {
      nearest = cluster;
      nearestDistance = distance;
    }
  }
  return textMatchedCluster || nearest;
}

async function insertReport(input: CreateReportInput, clusterId: string): Promise<ReportRow> {
  const result = await query<ReportRow>(
    `insert into reports (
       image_url,
       image_path,
       latitude,
       longitude,
       category,
       severity,
       confidence,
       description,
       ai_reason,
       cluster_id,
       status
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'received')
     returning ${reportFields}`,
    [
      input.imageUrl,
      input.imagePath,
      input.latitude,
      input.longitude,
      input.classification.category,
      input.classification.severity,
      input.classification.confidence,
      input.description,
      input.classification.reason,
      clusterId
    ]
  );

  return normalizeReport(result.rows[0]);
}

function logPostgresFallback(area: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[postgres fallback] ${area}: ${message}`);
}

export async function createReportAndUpdateCluster(input: CreateReportInput) {
  const rainfallRiskScore = await getRainfallRiskScore({
    latitude: input.latitude,
    longitude: input.longitude,
    category: input.classification.category
  });

  if (!hasPostgresConfig()) {
    return createDemoReport({ ...input, rainfallRiskScore });
  }

  const pool = getPostgresPool();
  let client: PoolClient | undefined;

  try {
    client = await pool.connect();
    await client.query("begin");

    const sensitivePlaceScore = await loadSensitivePlaceScore(input.latitude, input.longitude);
    const issueText = clusterText(input.description, input.classification.reason);
    const existingCluster = await findMatchingOpenCluster(
      input.classification.category,
      input.latitude,
      input.longitude,
      input.description,
      input.classification.reason
    );
    const now = new Date();

    if (existingCluster) {
      const nextReportCount = existingCluster.report_count + 1;
      const shouldUpdateCenter =
        distanceMeters(input.latitude, input.longitude, existingCluster.center_latitude, existingCluster.center_longitude) <=
        env.clusterRadiusMeters;
      const nextCenter = shouldUpdateCenter
        ? weightedCenter(
            existingCluster.center_latitude,
            existingCluster.center_longitude,
            existingCluster.report_count,
            input.latitude,
            input.longitude
          )
        : { latitude: existingCluster.center_latitude, longitude: existingCluster.center_longitude };
      const nextSeverity = higherSeverity(existingCluster.severity, input.classification.severity);
      const unresolvedHours = Math.max(0, (now.getTime() - new Date(existingCluster.created_at).getTime()) / 36e5);
      const nextPriorityScore = calculatePriorityScore({
        severity: nextSeverity,
        reportCount: nextReportCount,
        sensitivePlaceScore,
        unresolvedHours,
        rainfallRiskScore,
        category: input.classification.category
      });

      const updatedResult = await client.query<IssueClusterRow>(
        `update issue_clusters
         set center_latitude = $1,
             center_longitude = $2,
             report_count = $3,
             severity = $4,
             priority_score = $5,
             latest_reason = $6,
             assigned_department = $7,
             updated_at = now()
         where id = $8
         returning ${clusterFields}`,
        [
          nextCenter.latitude,
          nextCenter.longitude,
          nextReportCount,
          nextSeverity,
          nextPriorityScore,
          issueText || input.classification.reason,
          departmentForCategory(input.classification.category),
          existingCluster.id
        ]
      );

      const reportResult = await client.query<ReportRow>(
        `insert into reports (
           image_url, image_path, latitude, longitude, category, severity, confidence,
           description, ai_reason, cluster_id, status
         )
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'received')
         returning ${reportFields}`,
        [
          input.imageUrl,
          input.imagePath,
          input.latitude,
          input.longitude,
          input.classification.category,
          input.classification.severity,
          input.classification.confidence,
          input.description,
          input.classification.reason,
          existingCluster.id
        ]
      );

      await client.query("commit");
      return {
        report: normalizeReport(reportResult.rows[0]),
        cluster: normalizeCluster(updatedResult.rows[0]),
        matchedExistingCluster: true
      };
    }

    const priorityScore = calculatePriorityScore({
      severity: input.classification.severity,
      reportCount: 1,
      sensitivePlaceScore,
      unresolvedHours: 0,
      rainfallRiskScore,
      category: input.classification.category
    });

    const clusterResult = await client.query<IssueClusterRow>(
      `insert into issue_clusters (
         category,
         center_latitude,
         center_longitude,
         report_count,
         priority_score,
         severity,
         status,
         assigned_department,
         latest_reason
       )
       values ($1, $2, $3, 1, $4, $5, 'received', $6, $7)
       returning ${clusterFields}`,
      [
        input.classification.category,
        input.latitude,
        input.longitude,
        priorityScore,
        input.classification.severity,
        departmentForCategory(input.classification.category),
        issueText || input.classification.reason
      ]
    );

    const cluster = normalizeCluster(clusterResult.rows[0]);
    const reportResult = await client.query<ReportRow>(
      `insert into reports (
         image_url, image_path, latitude, longitude, category, severity, confidence,
         description, ai_reason, cluster_id, status
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'received')
       returning ${reportFields}`,
      [
        input.imageUrl,
        input.imagePath,
        input.latitude,
        input.longitude,
        input.classification.category,
        input.classification.severity,
        input.classification.confidence,
        input.description,
        input.classification.reason,
        cluster.id
      ]
    );

    await client.query("commit");
    return {
      report: normalizeReport(reportResult.rows[0]),
      cluster,
      matchedExistingCluster: false
    };
  } catch (error) {
    if (client) await client.query("rollback").catch(() => undefined);
    logPostgresFallback("create report", error);
    throw error;
  } finally {
    client?.release();
  }
}

export async function getDashboardPayload(): Promise<DashboardPayload> {
  if (!hasPostgresConfig()) return getDemoDashboard();

  try {
    const [clustersResult, reportsResult] = await Promise.all([
      query<IssueClusterRow>(`select ${clusterFields} from issue_clusters order by priority_score desc, updated_at desc`),
      query<ReportRow>(`select ${reportFields} from reports order by created_at desc limit 20`)
    ]);

    const clusters = clustersResult.rows.map(normalizeCluster);
    const reports = reportsResult.rows.map(normalizeReport);
    const categoryCounts = clusters.reduce<Record<string, number>>((acc, cluster) => {
      acc[cluster.category] = (acc[cluster.category] || 0) + cluster.report_count;
      return acc;
    }, {});
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "none";

    return {
      clusters,
      reports,
      summary: {
        totalReports: clusters.reduce((sum, cluster) => sum + cluster.report_count, 0),
        openClusters: clusters.filter((cluster) => !["resolved", "citizen_verified"].includes(cluster.status)).length,
        criticalClusters: clusters.filter((cluster) => cluster.severity === "critical").length,
        topCategory: topCategory as DashboardPayload["summary"]["topCategory"],
        avgPriority: Math.round(clusters.reduce((sum, cluster) => sum + cluster.priority_score, 0) / Math.max(1, clusters.length))
      }
    };
  } catch (error) {
    logPostgresFallback("dashboard", error);
    return getDemoDashboard();
  }
}

export async function updateClusterStatus(id: string, status: ClusterStatus, note?: string | null) {
  if (!hasPostgresConfig()) {
    const cluster = updateDemoClusterStatus(id, status);
    if (!cluster) throw new Error("Cluster not found.");
    return cluster;
  }

  const pool = getPostgresPool();
  let client: PoolClient | undefined;

  try {
    client = await pool.connect();
    await client.query("begin");
    const result = await client.query<IssueClusterRow>(
      `update issue_clusters
       set status = $1, updated_at = now()
       where id = $2
       returning ${clusterFields}`,
      [status, id]
    );

    if (result.rowCount === 0) {
      throw new Error("Cluster not found.");
    }

    await client.query(
      `insert into status_updates (cluster_id, status, note)
       values ($1, $2, $3)`,
      [id, status, note || null]
    );

    await client.query("commit");
    return normalizeCluster(result.rows[0]);
  } catch (error) {
    if (client) await client.query("rollback").catch(() => undefined);
    logPostgresFallback("status update", error);
    const cluster = updateDemoClusterStatus(id, status);
    if (!cluster) throw new Error("Cluster not found.");
    return cluster;
  } finally {
    client?.release();
  }
}
