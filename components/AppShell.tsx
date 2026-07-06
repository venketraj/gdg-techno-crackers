"use client";

import {
  Bell,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  MapPinned,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
  UsersRound
} from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/report", label: "Citizen Report", icon: ClipboardList },
  { href: "/scoreboard", label: "Scoreboard", icon: Trophy },
  { href: "/dashboard#reports", label: "Reports", icon: FileBarChart },
  { href: "/map", label: "Map View", icon: MapPinned },
  { href: "/departments", label: "Departments", icon: UsersRound },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/admin", label: "Admin", icon: UserRound }
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="appShell">
      <aside className="sidebar">
        <a className="sidebarBrand" href="/">
          <span className="brandMark">CI</span>
          <strong>Constituency Intelligence</strong>
        </a>

        <nav className="sideNav" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <a className={active ? "active" : ""} href={item.href} key={item.href}>
                <Icon size={20} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="weatherCard">
          <ShieldCheck size={22} />
          <span>Hot days ahead</span>
          <strong>33 C</strong>
        </div>
      </aside>

      <div className="contentShell">
        <header className="utilityBar">
          <div>
            <span>AI civic command center</span>
            <strong>Madurai Constituency</strong>
          </div>
          <div className="utilityActions">
            <button className="iconButton" aria-label="Notifications">
              <Bell size={18} />
              <i>3</i>
            </button>
            <a href="/report"><ClipboardList size={17} /> Citizen Report</a>
            <a className="userChip" href="/login"><UserRound size={18} /> Admin</a>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
