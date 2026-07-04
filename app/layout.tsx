import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Constituency Intelligence MVP",
  description: "AI-powered civic issue reporting, clustering, and priority dashboard."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
