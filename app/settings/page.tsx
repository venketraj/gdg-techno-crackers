import { Bell, BrainCircuit, Database, Gauge, MapPinned, ShieldCheck, Trophy } from "lucide-react";

const settingGroups = [
  {
    title: "AI triage",
    icon: BrainCircuit,
    items: [
      ["Auto-classify reports", "Enabled"],
      ["Minimum confidence", "68%"],
      ["Review low-confidence issues", "Required"]
    ]
  },
  {
    title: "Clustering",
    icon: MapPinned,
    items: [
      ["Duplicate radius", "350 m"],
      ["Sensitive place boost", "Enabled"],
      ["Rainfall risk weight", "Medium"]
    ]
  },
  {
    title: "Alerts",
    icon: Bell,
    items: [
      ["Critical issue alerts", "Instant"],
      ["Daily ward digest", "8:00 AM"],
      ["Admin validation reminders", "Enabled"]
    ]
  },
  {
    title: "Scoreboard",
    icon: Trophy,
    items: [
      ["Voice of Madurai", "Top citizen only"],
      ["Valid report points", "+20"],
      ["Rejected report penalty", "-5"]
    ]
  }
];

export default function SettingsPage() {
  return (
    <section className="pageStack">
      <div className="dashboardHeader">
        <div>
          <span className="badge"><Gauge size={14} /> Settings</span>
          <h1>Platform settings</h1>
          <p>Demo configuration for AI routing, issue clustering, alerting, and citizen trust scoring.</p>
        </div>
        <a className="button secondary" href="/dashboard">Back to dashboard</a>
      </div>

      <div className="settingsHero surface">
        <div>
          <span className="badge"><ShieldCheck size={14} /> Civic operations</span>
          <h2>Configured for Madurai constituency response</h2>
          <p className="muted">
            These settings are presented as operational defaults for the prototype. They keep automated AI decisions visible
            while preserving admin review for sensitive actions.
          </p>
        </div>
        <div className="settingsStatus">
          <Database size={24} />
          <span>Data mode</span>
          <strong>Demo + live fallback</strong>
        </div>
      </div>

      <div className="settingsGrid">
        {settingGroups.map((group) => {
          const Icon = group.icon;

          return (
            <article className="surface settingsCard" key={group.title}>
              <div className="settingsCardHeader">
                <Icon size={22} />
                <h2>{group.title}</h2>
              </div>
              <div className="settingsList">
                {group.items.map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <section className="surface settingsCard">
        <div className="settingsCardHeader">
          <ShieldCheck size={22} />
          <h2>Governance assumptions</h2>
        </div>
        <div className="settingsList wide">
          <div>
            <span>Admin validation</span>
            <strong>Required before citizen score awards</strong>
          </div>
          <div>
            <span>Public title policy</span>
            <strong>Only the current rank #1 citizen can hold Voice of Madurai</strong>
          </div>
          <div>
            <span>Escalation model</span>
            <strong>Critical clusters stay visible until resolved or citizen verified</strong>
          </div>
        </div>
      </section>
    </section>
  );
}
