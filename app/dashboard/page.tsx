"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { formatCategory, formatSeverity, formatStatus } from "@/lib/format";
import type { ClusterStatus, DashboardPayload } from "@/types";

const ClusterMap = dynamic(() => import("@/components/ClusterMap"), { ssr: false });

const defaultLatitude = Number(process.env.NEXT_PUBLIC_DEFAULT_LATITUDE || 9.9252);
const defaultLongitude = Number(process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE || 78.1198);
const defaultZoom = Number(process.env.NEXT_PUBLIC_DEFAULT_ZOOM || 13);

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
    if (response.ok) await loadDashboard();
  }

  useEffect(() => {
    loadDashboard();
  }, []);

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
            <Metric label="Total reports" value={data.summary.totalReports} />
            <Metric label="Open clusters" value={data.summary.openClusters} />
            <Metric label="Critical clusters" value={data.summary.criticalClusters} />
            <Metric label="Avg priority" value={data.summary.avgPriority} />
          </div>

          <div className="surface">
            <ClusterMap
              clusters={data.clusters}
              defaultLatitude={defaultLatitude}
              defaultLongitude={defaultLongitude}
              defaultZoom={defaultZoom}
            />
          </div>

          <div className="surface">
            <div className="tableHeader">
              <h2>Issue clusters</h2>
              <span className="muted">Top category: {formatCategory(data.summary.topCategory === "none" ? "unknown" : data.summary.topCategory)}</span>
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
