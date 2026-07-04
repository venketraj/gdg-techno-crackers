import { ArrowRight, BarChart3, Camera, MapPinned } from "lucide-react";

export default function HomePage() {
  return (
    <section className="hero">
      <div className="heroCopy">
        <span className="badge">One-day MVP</span>
        <h1>AI Constituency Intelligence Platform</h1>
        <p>
          Convert citizen-submitted photos into classified, clustered, prioritized civic issues for public
          representatives and local administrators.
        </p>
        <div className="actions">
          <a className="button" href="/report">
            Submit issue <ArrowRight size={18} />
          </a>
          <a className="button secondary" href="/dashboard">
            Open dashboard
          </a>
        </div>
      </div>
      <div className="demoLoop" aria-label="Demo loop">
        <div><Camera size={22} /><span>Citizen photo + GPS</span></div>
        <div><MapPinned size={22} /><span>Duplicate cluster detection</span></div>
        <div><BarChart3 size={22} /><span>Priority dashboard update</span></div>
      </div>
    </section>
  );
}
