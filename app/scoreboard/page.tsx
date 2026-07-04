"use client";

import { useEffect, useState } from "react";
import { Award, Loader2, Medal, RefreshCw, Trophy } from "lucide-react";
import { useDataRefresh } from "@/lib/useDataRefresh";
import type { DemoUser } from "@/types";

type ScoreboardUser = DemoUser & { rank: number };

const podiumConfig = {
  1: {
    label: "Gold",
    className: "gold",
    place: "1st",
    orderClass: "podiumFirst"
  },
  2: {
    label: "Silver",
    className: "silver",
    place: "2nd",
    orderClass: "podiumSecond"
  },
  3: {
    label: "Bronze",
    className: "bronze",
    place: "3rd",
    orderClass: "podiumThird"
  }
} as const;

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
  useDataRefresh(loadScoreboard);

  const topThree = users.slice(0, 3);
  const podiumUsers = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

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

      {podiumUsers.length > 0 && (
        <div className="podium" aria-label="Top 3 scoreboard members">
          {podiumUsers.map((user) => {
            const config = podiumConfig[user.rank as 1 | 2 | 3];

            return (
              <article className={`podiumCard ${config.className} ${config.orderClass}`} key={user.id}>
                <div className="medalRing" aria-label={`${config.label} medal`}>
                  {user.rank === 1 ? <Trophy size={28} /> : <Medal size={28} />}
                </div>
                <span className="podiumRank">{config.place}</span>
                <h2>{user.name}</h2>
                <p>{user.ward}</p>
                <strong>{user.score}</strong>
                <span className="podiumMeta">
                  {user.reportsValidated} validated / {user.reportsSubmitted} reports
                </span>
              </article>
            );
          })}
        </div>
      )}

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
