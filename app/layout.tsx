import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Constituency Intelligence MVP",
  description: "AI-powered civic issue reporting, clustering, and priority dashboard."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <a href="/" className="brand">Constituency Intelligence</a>
          <nav>
            <a href="/login">Login</a>
            <a href="/report">Citizen Report</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/scoreboard">Scoreboard</a>
            <a href="/admin">Admin</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
