import { ArrowRight, BarChart3, Camera, CheckCircle2, MapPinned, RadioTower, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

export default function HomePage() {
  return (
    <section className="pageStack">
      <div className="homeHero">
        <div className="heroCopy">
          <span className="badge"><Sparkles size={14} /> AI civic intelligence</span>
          <h1>Turn citizen reports into prioritized constituency action.</h1>
          <p>
            Constituency Intelligence helps representatives see what is happening on the ground, group duplicate
            complaints, rank urgent civic issues, and validate authentic citizen participation.
          </p>
          <div className="actions">
            <a className="button" href="/dashboard">
              Open command center <ArrowRight size={18} />
            </a>
            <a className="button secondary" href="/report">
              Submit issue
            </a>
          </div>
        </div>

        <div className="heroDashboard" aria-label="Civic intelligence preview">
          <div className="heroMap">
            <span className="mapPin pinOne" />
            <span className="mapPin pinTwo" />
            <span className="mapPin pinThree" />
            <strong>Madurai issue pulse</strong>
          </div>
          <div className="heroStats">
            <div><span>Reports</span><strong>43</strong></div>
            <div><span>Priority</span><strong>91</strong></div>
            <div><span>Trust</span><strong>86%</strong></div>
          </div>
          <div className="signalList">
            <span><i /> Road damage near school zone</span>
            <span><i /> Drain blockage with rainfall risk</span>
            <span><i /> Garbage cluster near market street</span>
          </div>
        </div>
      </div>

      <div className="homeSection">
        <div className="sectionHeader">
          <span className="badge">How it works</span>
          <h1>One workflow from photo to resolution</h1>
        </div>
        <div className="demoLoop" aria-label="Demo loop">
          <div><Camera size={22} /><span>Citizen photo + GPS capture</span></div>
          <div><RadioTower size={22} /><span>AI category, severity, and authenticity check</span></div>
          <div><MapPinned size={22} /><span>Duplicate cluster detection by location</span></div>
          <div><BarChart3 size={22} /><span>Priority dashboard for representative action</span></div>
        </div>
      </div>

      <div className="featureGrid">
        <article className="surface featureCard">
          <ShieldCheck size={24} />
          <h2>Authenticity review</h2>
          <p>Admins can validate citizen reports before trust scores and public rankings are updated.</p>
        </article>
        <article className="surface featureCard">
          <UsersRound size={24} />
          <h2>Citizen trust score</h2>
          <p>Useful reports earn points and make the most reliable local voices visible on the scoreboard.</p>
        </article>
        <article className="surface featureCard">
          <CheckCircle2 size={24} />
          <h2>Department routing</h2>
          <p>Issues are routed toward sanitation, highways, drainage, or other civic departments.</p>
        </article>
      </div>
    </section>
  );
}
