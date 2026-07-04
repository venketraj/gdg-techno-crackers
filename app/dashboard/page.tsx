"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, BarChart3, CheckCircle2, ClipboardList, FolderOpen, Loader2, RefreshCw, Star } from "lucide-react";
import { formatCategory, formatSeverity, formatStatus } from "@/lib/format";
import { notifyDataChanged, useDataRefresh } from "@/lib/useDataRefresh";
import type { CivicCategory, ClusterStatus, DashboardPayload } from "@/types";

const ClusterMap = dynamic(() => import("@/components/ClusterMap"), { ssr: false });

const defaultLatitude = Number(process.env.NEXT_PUBLIC_DEFAULT_LATITUDE || 9.9252);
const defaultLongitude = Number(process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE || 78.1198);
const defaultZoom = Number(process.env.NEXT_PUBLIC_DEFAULT_ZOOM || 13);
const categoryOrder: CivicCategory[] = [
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

function sampleDashboard(): DashboardPayload {
  const now = new Date().toISOString();
  return {
    clusters: [
      {
        id: "sample-road-damage",
        category: "road_damage",
        center_latitude: 9.93005,
        center_longitude: 78.12045,
        report_count: 23,
        priority_score: 91,
        severity: "critical",
        status: "received",
        assigned_department: "Public Works / Highways",
        latest_reason: "Large pothole near school zone; repeated citizen reports.",
        created_at: now,
        updated_at: now
      },
      {
        id: "sample-drain-blockage",
        category: "drain_blockage",
        center_latitude: 9.9279,
        center_longitude: 78.124,
        report_count: 8,
        priority_score: 76,
        severity: "high",
        status: "assigned",
        assigned_department: "Drainage / Stormwater Department",
        latest_reason: "Blocked stormwater drain with rainfall risk.",
        created_at: now,
        updated_at: now
      },
      {
        id: "sample-garbage",
        category: "garbage",
        center_latitude: 9.9229,
        center_longitude: 78.1195,
        report_count: 12,
        priority_score: 67,
        severity: "high",
        status: "in_progress",
        assigned_department: "Municipality Sanitation",
        latest_reason: "Garbage pile visible near market area.",
        created_at: now,
        updated_at: now
      }
    ],
    reports: [],
    summary: {
      totalReports: 43,
      openClusters: 3,
      criticalClusters: 1,
      topCategory: "road_damage",
      avgPriority: 78
    }
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/clusters", { cache: "no-store" });
      const payload = await response.json();
      setLoading(false);
      if (!response.ok) {
        setData(sampleDashboard());
        setError(payload.error || "Showing sample dashboard because live data failed to load.");
        return;
      }
      setData(payload);
    } catch {
      setLoading(false);
      setData(sampleDashboard());
      setError("Showing sample dashboard because live data failed to load.");
    }
  }

  async function setStatus(id: string, status: ClusterStatus) {
    const response = await fetch(`/api/clusters/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: `Set to ${status} from dashboard` })
    });
    if (response.ok) {
      await loadDashboard();
      notifyDataChanged();
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);
  useDataRefresh(loadDashboard);

  const analytics = useMemo(() => {
    if (!data) return null;

    const clusters = data.clusters;
    const clusterCount = Math.max(1, clusters.length);
    const reportTotal = clusters.reduce((sum, cluster) => sum + cluster.report_count, 0);
    const maxReports = Math.max(1, ...clusters.map((cluster) => cluster.report_count));

    const categoryRows = categoryOrder
      .map((category) => {
        const matching = clusters.filter((cluster) => cluster.category === category);
        const reports = matching.reduce((sum, cluster) => sum + cluster.report_count, 0);
        return {
          category,
          reports,
          clusters: matching.length,
          percent: Math.round((reports / Math.max(1, reportTotal)) * 100)
        };
      })
      .filter((row) => row.reports > 0)
      .sort((a, b) => b.reports - a.reports)
      .slice(0, 5);

    const resolvedCount = clusters.filter((cluster) => cluster.status === "resolved" || cluster.status === "citizen_verified").length;
    const activeCount = clusters.length - resolvedCount;
    const resolvedPercent = Math.round((resolvedCount / clusterCount) * 100);
    const activePercent = 100 - resolvedPercent;

    const topCluster = [...clusters].sort((a, b) => b.priority_score - a.priority_score)[0];

    return {
      activeCount,
      activePercent,
      categoryRows,
      maxReports,
      reportTotal,
      resolvedCount,
      resolvedPercent,
      topCluster
    };
  }, [data]);

  return (
    <section className="pageStack">
      <div className="dashboardHeader">
        <div>
          <span className="badge">Representative dashboard</span>
          <h1>Constituency issue intelligence</h1>
          <p>Clustered citizen reports ranked by severity, duplicate volume, location sensitivity, and rainfall risk.</p>
        </div>
        <button className="secondary" onClick={loadDashboard} disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />}
          Refresh
        </button>
      </div>

      {error ? <p className="alert">{error}</p> : null}

      {data ? (
        <>
          <div className="grid four">
            <Metric label="Total Reports" value={data.summary.totalReports} subtitle="All time" tone="purple" icon={<ClipboardList size={18} />} />
            <Metric label="Open Clusters" value={data.summary.openClusters} subtitle="Needs attention" tone="blue" icon={<FolderOpen size={18} />} />
            <Metric label="Critical Clusters" value={data.summary.criticalClusters} subtitle="High priority" tone="red" icon={<AlertTriangle size={18} />} />
            <Metric label="Avg Priority" value={data.summary.avgPriority} subtitle="Out of 100" tone="green" icon={<Star size={18} />} />
          </div>

          {analytics ? (
            <div className="dashboardPanels">
              <section className="surface mapCard" id="map">
                <div className="panelTitle">
                  <h2>Issue Heat Map</h2>
                </div>
                <div className="mapFrame">
                  <ClusterMap
                    clusters={data.clusters}
                    defaultLatitude={defaultLatitude}
                    defaultLongitude={defaultLongitude}
                    defaultZoom={defaultZoom}
                  />
                </div>
                <div className="heatLegend">
                  <span>Low</span>
                  <i className="heatOne" />
                  <i className="heatTwo" />
                  <i className="heatThree" />
                  <i className="heatFour" />
                  <i className="heatFive" />
                  <span>High</span>
                </div>
              </section>

              <section className="surface issueMixCard">
                <div className="panelTitle">
                  <h2>Issue mix</h2>
                  <span>{analytics.reportTotal} reports</span>
                </div>
                <div className="issueMixBody">
                  <div
                    className="donutChart"
                    style={{
                      background: `conic-gradient(#4f46e5 0 ${analytics.activePercent}%, #0ea5a3 ${analytics.activePercent}% 100%)`
                    }}
                    aria-label={`${analytics.activePercent}% active clusters`}
                  >
                    <strong>{analytics.activePercent}%</strong>
                    <span>active</span>
                  </div>
                  <div className="barList">
                    {analytics.categoryRows.map((row) => (
                      <div className="barRow" key={row.category}>
                        <div>
                          <strong>{formatCategory(row.category)}</strong>
                          <span>{row.clusters} clusters</span>
                        </div>
                        <div className="barTrack">
                          <i style={{ width: `${Math.max(8, (row.reports / analytics.maxReports) * 100)}%` }} />
                        </div>
                        <b>{row.percent}%</b>
                      </div>
                    ))}
                  </div>
                </div>
                <a className="panelLink" href="#clusters">View all clusters <BarChart3 size={16} /></a>
              </section>
            </div>
          ) : null}

          <div className="surface clusterTableCard" id="clusters">
            <div className="tableHeader">
              <h2><BarChart3 size={18} /> Issue Clusters</h2>
              <span className="badge">Top category: {formatCategory(data.summary.topCategory === "none" ? "unknown" : data.summary.topCategory)}</span>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Issue</th>
                    <th>Reports</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.clusters.map((cluster) => (
                    <tr key={cluster.id}>
                      <td><strong>{cluster.priority_score}</strong></td>
                      <td>
                        <strong>{formatCategory(cluster.category)}</strong>
                        <span>{formatSeverity(cluster.severity)} severity</span>
                      </td>
                      <td>{cluster.report_count}</td>
                      <td>{cluster.assigned_department}</td>
                      <td><span className={`status ${cluster.status}`}>{formatStatus(cluster.status)}</span></td>
                      <td>
                        <div className="rowActions">
                          <button className="tiny" onClick={() => setStatus(cluster.id, "assigned")}>Assign</button>
                          <button className="tiny secondary" onClick={() => setStatus(cluster.id, "resolved")}>
                            <CheckCircle2 size={14} /> Resolve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : loading ? (
        <div className="surface loading"><Loader2 className="spin" /> Loading dashboard</div>
      ) : null}
    </section>
  );
}

function Metric({
  label,
  value,
  subtitle,
  tone,
  icon
}: {
  label: string;
  value: number;
  subtitle: string;
  tone: "purple" | "blue" | "red" | "green";
  icon: ReactNode;
}) {
  return (
    <div className={`metric ${tone}`}>
      <div className="metricTop">
        <span className="metricIcon">{icon}</span>
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      <div className="metricFoot">
        <span>{subtitle}</span>
        <svg viewBox="0 0 120 28" aria-hidden="true">
          <polyline points="2,20 16,15 30,21 44,17 58,11 72,20 84,10 96,19 108,13 118,16" />
        </svg>
      </div>
    </div>
  );
}
