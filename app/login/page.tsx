"use client";

import { FormEvent, useState } from "react";
import { LogIn, UserRound } from "lucide-react";
import type { DemoUser } from "@/types";

const suggestions = ["Meena R", "Arun Kumar", "Nisha Fathima", "Madurai Admin"];

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("Meena R");
  const [user, setUser] = useState<DemoUser | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier })
    });
    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error || "Login failed.");
      return;
    }

    localStorage.setItem("demoUser", JSON.stringify(payload.user));
    setUser(payload.user);
  }

  return (
    <section className="pageStack narrow">
      <div className="sectionHeader">
        <span className="badge">Demo account</span>
        <h1>Citizen login</h1>
        <p>Pick a seeded user to submit issues, earn score, and compete for the Voice of Madurai title.</p>
      </div>

      <form className="surface form" onSubmit={login}>
        <label>
          Name, phone, or user id
          <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
        </label>
        <div className="chipRow">
          {suggestions.map((name) => (
            <button type="button" className="chip" key={name} onClick={() => setIdentifier(name)}>
              {name}
            </button>
          ))}
        </div>
        <button type="submit" disabled={loading}>
          <LogIn size={18} />
          Login
        </button>
        {error ? <p className="alert">{error}</p> : null}
      </form>

      {user ? (
        <div className="surface resultGrid">
          <div>
            <span>Logged in as</span>
            <strong>{user.name}</strong>
          </div>
          <div>
            <span>Role</span>
            <strong>{user.role}</strong>
          </div>
          <div>
            <span>Score</span>
            <strong>{user.score}</strong>
          </div>
          <div>
            <span>Ward</span>
            <strong>{user.ward}</strong>
          </div>
          <a className="button wide" href={user.role === "admin" ? "/admin" : "/report"}>
            <UserRound size={18} />
            Continue
          </a>
        </div>
      ) : null}
    </section>
  );
}
