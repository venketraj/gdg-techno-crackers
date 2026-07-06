"use client";

import {
  Bell,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  MapPinned,
  Menu,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
  UsersRound,
  X
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  function renderNavigation() {
    return navItems.map((item) => {
      const Icon = item.icon;
      const active = item.href.includes("#")
        ? false
        : item.href === "/"
          ? pathname === "/"
          : pathname.startsWith(item.href);

      return (
        <a className={active ? "active" : ""} href={item.href} key={item.href} onClick={() => setMobileNavOpen(false)}>
          <Icon size={20} />
          <span>{item.label}</span>
        </a>
      );
    });
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <a className="sidebarBrand" href="/">
          <span className="brandMark">CI</span>
          <strong>Constituency Intelligence</strong>
        </a>

        <nav className="sideNav" aria-label="Primary navigation">
          {renderNavigation()}
        </nav>

        <div className="weatherCard">
          <ShieldCheck size={22} />
          <span>Hot days ahead</span>
          <strong>33 C</strong>
        </div>
      </aside>

      <div className="contentShell">
        <header className="mobileHeader">
          <div className="mobileHeaderTop">
            <a className="mobileBrand" href="/">
              <span className="brandMark">CI</span>
              <strong>Constituency Intelligence</strong>
            </a>
            <button
              className="mobileMenuButton"
              type="button"
              aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
          <div className="mobileHeaderMeta">
            <div>
              <span>AI civic command center</span>
              <strong>Madurai Constituency</strong>
            </div>
            <div className="mobileQuickActions">
              <button className="iconButton" aria-label="Notifications">
                <Bell size={18} />
                <i>3</i>
              </button>
              <a href="/report" aria-label="Citizen Report"><ClipboardList size={17} /></a>
              <a href="/login" aria-label="Admin"><UserRound size={18} /></a>
            </div>
          </div>
        </header>

        <button
          className={`mobileBackdrop ${mobileNavOpen ? "open" : ""}`}
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileNavOpen(false)}
        />

        <nav id="mobile-navigation" className={`mobileDrawer ${mobileNavOpen ? "open" : ""}`} aria-label="Mobile navigation">
          <div className="mobileDrawerHeader">
            <span>Navigation</span>
            <button type="button" aria-label="Close navigation menu" onClick={() => setMobileNavOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="mobileDrawerNav">{renderNavigation()}</div>
        </nav>

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
