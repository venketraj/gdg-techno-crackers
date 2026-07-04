"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, MapPinned, RefreshCw } from "lucide-react";
import { formatCategory, formatSeverity, formatStatus } from "@/lib/format";
import type { DashboardPayload } from "@/types";

const ClusterMap = dynamic(() => import("@/components/ClusterMap"), { ssr: false });

const defaultLatitude = Number(process.env.NEXT_PUBLIC_DEFAULT_LATITUDE || 9.9252);
const defaultLongitude = Number(process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE || 78.1198);
const defaultZoom = Number(process.env.NEXT_PUBLIC_DEFAULT_ZOOM || 13);

export default function MapViewPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMapData() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/clusters", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "Could not load live map data.");
        setData(null);
        return;
      }
      setData(payload);
    } catch {
      setError("Could not load live map data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMapData();
  }, []);

  const clusters = data?.clusters || [];
  const highestPriority = clusters[0];

  return (
    <section className="pageStack">
      <div className="dashboardHeader">
        <div>
          <span className="badge"><MapPinned size={14} /> Map view</span>
          <h1>Issue heat map</h1>
          <p>Live geographic view of clustered citizen reports, sized by report volume and colored by severity.</p>
        </div>
        <button className="secondary" onClick={loadMapData} disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />}
          Refresh
        </button>
      </div>

      {error ? <p className="alert">{error}</p> : null}

      {loading && !data ? (
        <div className="surface loading"><Loader2 className="spin" /> Loading heat map</div>
      ) : (
        <>
          <div className="mapPageGrid">
            <section className="surface mapFocusCard">
              <div className="panelTitle">
                <h2>Madurai civic heat map</h2>
                <span>{clusters.length} clusters</span>
              </div>
              <div className="mapFrame large">
                <ClusterMap
                  clusters={clusters}
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

            <aside className="surface mapInsightPanel">
              <span className="badge"><AlertTriangle size={14} /> Priority focus</span>
              {highestPriority ? (
                <>
                  <h2>{formatCategory(highestPriority.category)}</h2>
                  <strong>{highestPriority.priority_score}/100</strong>
                  <p className="muted">{highestPriority.latest_reason}</p>
                  <div className="resultGrid">
                    <div>
                      <span>Reports</span>
                      <strong>{highestPriority.report_count}</strong>
                    </div>
                    <div>
                      <span>Severity</span>
                      <strong>{formatSeverity(highestPriority.severity)}</strong>
                    </div>
                    <div className="wide">
                      <span>Status</span>
                      <strong>{formatStatus(highestPriority.status)}</strong>
                    </div>
                  </div>
                </>
              ) : (
                <p className="muted">No clusters available yet.</p>
              )}
            </aside>
          </div>

          <section className="surface clusterTableCard">
            <div className="tableHeader">
              <h2><MapPinned size={18} /> Map clusters</h2>
              <span className="badge">Sorted by priority</span>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Issue</th>
                    <th>Reports</th>
                    <th>Status</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {clusters.map((cluster) => (
                    <tr key={cluster.id}>
                      <td><strong>{cluster.priority_score}</strong></td>
                      <td><strong>{formatCategory(cluster.category)}</strong><span>{formatSeverity(cluster.severity)} severity</span></td>
                      <td>{cluster.report_count}</td>
                      <td><span className={`status ${cluster.status}`}>{formatStatus(cluster.status)}</span></td>
                      <td>{cluster.assigned_department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
