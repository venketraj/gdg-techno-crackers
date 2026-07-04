"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { formatCategory, formatSeverity } from "@/lib/format";
import { notifyDataChanged, useDataRefresh } from "@/lib/useDataRefresh";
import type { DemoUser, IssueValidationRow } from "@/types";

export default function AdminPage() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [validations, setValidations] = useState<IssueValidationRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadValidations() {
    setLoading(true);
    const response = await fetch("/api/validations", { cache: "no-store" });
    const payload = await response.json();
    setValidations(payload.validations || []);
    setLoading(false);
  }

  async function updateValidation(id: string, status: "valid" | "rejected") {
    await fetch(`/api/validations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        note: status === "valid" ? "Verified by admin review" : "Rejected by admin review"
      })
    });
    await loadValidations();
    notifyDataChanged();
  }

  useEffect(() => {
    const stored = localStorage.getItem("demoUser");
    setUser(stored ? JSON.parse(stored) : null);
    loadValidations();
  }, []);
  useDataRefresh(loadValidations);

  const isAdmin = user?.role === "admin";

  return (
    <section className="pageStack">
      <div className="sectionHeader">
        <span className="badge">Admin validation</span>
        <h1>Issue authenticity review</h1>
        <p>Validate citizen reports, update trust scores, and award Voice of Madurai through the scoreboard.</p>
      </div>

      {!isAdmin ? (
        <div className="surface">
          <p className="alert">Login as Madurai Admin to validate reports.</p>
          <a className="button" href="/login">Open login</a>
        </div>
      ) : null}

      <div className="surface">
        <div className="tableHeader">
          <h2>Pending and reviewed reports</h2>
          {loading ? <span className="muted"><Loader2 className="spin" size={14} /> Loading</span> : null}
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Citizen</th>
                <th>Issue</th>
                <th>Authenticity</th>
                <th>Status</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {validations.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.user_name}</strong><span>{new Date(item.created_at).toLocaleString()}</span></td>
                  <td>
                    <strong>{formatCategory(item.category)}</strong>
                    <span>{formatSeverity(item.severity)} - {item.description || "No description"}</span>
                  </td>
                  <td><strong>{item.authenticity_score}%</strong></td>
                  <td><span className={`status ${item.status}`}>{item.status}</span></td>
                  <td>{item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</td>
                  <td>
                    <div className="rowActions">
                      <button className="tiny" disabled={!isAdmin || item.status !== "pending"} onClick={() => updateValidation(item.id, "valid")}>
                        <ShieldCheck size={14} /> Valid
                      </button>
                      <button className="tiny secondary" disabled={!isAdmin || item.status !== "pending"} onClick={() => updateValidation(item.id, "rejected")}>
                        <XCircle size={14} /> Reject
                      </button>
                      {item.status === "valid" ? <CheckCircle2 size={18} color="#067647" /> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
