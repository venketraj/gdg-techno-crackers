"use client";

import { useEffect, useState } from "react";
import { Award, Loader2, RefreshCw } from "lucide-react";
import type { DemoUser } from "@/types";

type ScoreboardUser = DemoUser & { rank: number };

export default function ScoreboardPage() {
  const [users, setUsers] = useState<ScoreboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadScoreboard() {
    setLoading(true);
    const response = await fetch("/api/scoreboard", { cache: "no-store" });
    const payload = await response.json();
    setUsers(payload.users || []);
    setLoading(false);
  }

  useEffect(() => {
    loadScoreboard();
  }, []);

  return (
    <section className="pageStack">
      <div className="dashboardHeader">
        <div>
          <span className="badge">Civic trust score</span>
          <h1>Voice of Madurai scoreboard</h1>
          <p>Citizens earn points for useful reports and validated authentic submissions.</p>
        </div>
        <button className="secondary" onClick={loadScoreboard} disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />}
          Refresh
        </button>
      </div>

      <div className="surface">
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Citizen</th>
                <th>Ward</th>
                <th>Score</th>
                <th>Reports</th>
                <th>Validated</th>
                <th>Title</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td><strong>#{user.rank}</strong></td>
                  <td><strong>{user.name}</strong><span>{user.phone}</span></td>
                  <td>{user.ward}</td>
                  <td><strong>{user.score}</strong></td>
                  <td>{user.reportsSubmitted}</td>
                  <td>{user.reportsValidated}</td>
                  <td>
                    {user.title ? <span className="titleBadge"><Award size={14} /> {user.title}</span> : <span className="muted">In progress</span>}
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
