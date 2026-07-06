"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, Clock3, Loader2, RefreshCw, Route, ShieldAlert, UsersRound } from "lucide-react";
import { formatCategory, formatStatus } from "@/lib/format";
import { useDataRefresh } from "@/lib/useDataRefresh";
import type { DashboardPayload } from "@/types";

const departmentProfiles = [
  {
    name: "Public Works / Highways",
    lead: "Road Response Cell",
    coverage: "Road damage, potholes, unsafe street surfaces",
    sla: "24 hrs",
    tone: "purple"
  },
  {
    name: "Drainage / Stormwater Department",
    lead: "Flood Mitigation Desk",
    coverage: "Drain blockage, flooding, rainwater overflow",
    sla: "12 hrs",
    tone: "blue"
  },
  {
    name: "Municipality Sanitation",
    lead: "Ward Sanitation Team",
    coverage: "Garbage piles, illegal dumping, market waste",
    sla: "18 hrs",
    tone: "green"
  },
  {
    name: "Electricity / Streetlight Board",
    lead: "Night Safety Unit",
    coverage: "Broken streetlights and low-light safety zones",
    sla: "36 hrs",
    tone: "amber"
  },
  {
    name: "Water Supply Board",
    lead: "Pipeline Maintenance",
    coverage: "Water leakage and supply disruption",
    sla: "24 hrs",
    tone: "cyan"
  }
];

export default function DepartmentsPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDepartments() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/clusters", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error || "Could not load department data.");
        setData(null);
        return;
      }
      setData(payload);
    } catch {
      setError("Could not load department data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);
  useDataRefresh(loadDepartments);

  const departmentRows = useMemo(() => {
    const clusters = data?.clusters || [];

    return departmentProfiles.map((department) => {
      const owned = clusters.filter((cluster) => cluster.assigned_department === department.name);
      const open = owned.filter((cluster) => !["resolved", "citizen_verified"].includes(cluster.status));
      const critical = owned.filter((cluster) => cluster.severity === "critical");
      const reports = owned.reduce((sum, cluster) => sum + cluster.report_count, 0);
      const avgPriority = Math.round(owned.reduce((sum, cluster) => sum + cluster.priority_score, 0) / Math.max(1, owned.length));
      const topIssue = [...owned].sort((a, b) => b.priority_score - a.priority_score)[0];

      return {
        ...department,
        avgPriority,
        critical: critical.length,
        open: open.length,
        reports,
        topIssue,
        total: owned.length
      };
    });
  }, [data]);

  const totals = useMemo(() => {
    return departmentRows.reduce(
      (acc, department) => ({
        open: acc.open + department.open,
        reports: acc.reports + department.reports,
        critical: acc.critical + department.critical
      }),
      { open: 0, reports: 0, critical: 0 }
    );
  }, [departmentRows]);

  return (
    <section className="pageStack">
      <div className="dashboardHeader">
        <div>
          <span className="badge"><UsersRound size={14} /> Departments</span>
          <h1>Department response center</h1>
          <p>Track civic issue ownership, priority load, active reports, and expected response windows by department.</p>
        </div>
        <button className="secondary" onClick={loadDepartments} disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />}
          Refresh
        </button>
      </div>

      {error ? <p className="alert">{error}</p> : null}

      <div className="departmentSummary">
        <div className="metric purple">
          <div className="metricTop"><span className="metricIcon"><Building2 size={18} /></span><span>Departments</span></div>
          <strong>{departmentRows.length}</strong>
          <div className="metricFoot"><span>Configured teams</span></div>
        </div>
        <div className="metric blue">
          <div className="metricTop"><span className="metricIcon"><Clock3 size={18} /></span><span>Open clusters</span></div>
          <strong>{totals.open}</strong>
          <div className="metricFoot"><span>Needs action</span></div>
        </div>
        <div className="metric red">
          <div className="metricTop"><span className="metricIcon"><ShieldAlert size={18} /></span><span>Critical load</span></div>
          <strong>{totals.critical}</strong>
          <div className="metricFoot"><span>Highest risk</span></div>
        </div>
        <div className="metric green">
          <div className="metricTop"><span className="metricIcon"><Route size={18} /></span><span>Reports routed</span></div>
          <strong>{totals.reports}</strong>
          <div className="metricFoot"><span>Across clusters</span></div>
        </div>
      </div>

      {loading && !data ? (
        <div className="surface loading"><Loader2 className="spin" /> Loading departments</div>
      ) : (
        <>
          <div className="departmentGrid">
            {departmentRows.map((department) => (
              <article className={`surface departmentCard ${department.tone}`} key={department.name}>
                <div className="departmentCardHeader">
                  <span className="departmentIcon"><Building2 size={22} /></span>
                  <div>
                    <h2>{department.name}</h2>
                    <p>{department.lead}</p>
                  </div>
                </div>

                <p className="muted">{department.coverage}</p>

                <div className="departmentStats">
                  <div><span>Open</span><strong>{department.open}</strong></div>
                  <div><span>Reports</span><strong>{department.reports}</strong></div>
                  <div><span>Avg priority</span><strong>{department.avgPriority || 0}</strong></div>
                </div>

                <div className="departmentFooter">
                  <span className={department.critical ? "status rejected" : "status valid"}>
                    {department.critical ? `${department.critical} critical` : "Stable"}
                  </span>
                  <span className="status assigned">SLA {department.sla}</span>
                </div>

                {department.topIssue ? (
                  <div className="departmentIssue">
                    <span>Top issue</span>
                    <strong>{formatCategory(department.topIssue.category)}</strong>
                    <small>{formatStatus(department.topIssue.status)} / Priority {department.topIssue.priority_score}</small>
                  </div>
                ) : (
                  <div className="departmentIssue empty">
                    <CheckCircle2 size={18} />
                    <span>No active clusters assigned</span>
                  </div>
                )}
              </article>
            ))}
          </div>

          <section className="surface clusterTableCard">
            <div className="tableHeader">
              <h2><Building2 size={18} /> Department workload</h2>
              <span className="badge">Live from issue clusters</span>
            </div>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Lead</th>
                    <th>Open</th>
                    <th>Reports</th>
                    <th>Top Issue</th>
                    <th>SLA</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentRows.map((department) => (
                    <tr key={department.name}>
                      <td><strong>{department.name}</strong><span>{department.coverage}</span></td>
                      <td>{department.lead}</td>
                      <td>{department.open}</td>
                      <td>{department.reports}</td>
                      <td>{department.topIssue ? formatCategory(department.topIssue.category) : "No active issue"}</td>
                      <td><span className="status assigned">{department.sla}</span></td>
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
