"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "../../components/ui-icon";

interface AdminNavProps {
  userEmail: string;
  userRole: string;
}

const navItems = [
  { href: "/admin", label: "Overview", icon: "briefcase" as const, exact: true },
  { href: "/admin/jobs", label: "Jobs", icon: "search" as const },
  { href: "/admin/categories", label: "Categories", icon: "box" as const },
  { href: "/admin/career-guides", label: "Career Guides", icon: "file-text" as const },
  { href: "/admin/team", label: "Team & Access", icon: "users" as const },
  { href: "/admin/seo", label: "SEO Settings", icon: "sparkles" as const },
  { href: "/admin/system-status", label: "System Status", icon: "info" as const },
];

export function AdminNav({ userEmail, userRole }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    startTransition(async () => {
      try {
        await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "logout" }),
        });
      } finally {
        router.push("/admin/login");
        router.refresh();
      }
    });
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="admin-mobile-bar" style={{ display: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="brand-mark" style={{ width: 28, height: 28, fontSize: 13 }}>A</span>
          <span style={{ fontWeight: 800, fontSize: 16, color: "var(--navy)" }}>AppBeb Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="button button-small"
          style={{ padding: "6px 10px" }}
          aria-label="Toggle admin menu"
        >
          <Icon name={mobileOpen ? "x" : "menu"} size={16} />
        </button>
      </div>

      <aside className={`admin-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid var(--line)" }}>
          <span className="brand-mark" style={{ width: 34, height: 34, fontSize: 16 }}>A</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "var(--navy)", lineHeight: 1.2 }}>AppBeb Admin</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", background: "var(--teal-soft)", color: "var(--teal-dark)", borderRadius: 100, textTransform: "uppercase" }}>
                {userRole === "super_admin" ? "Super Admin" : "Admin"}
              </span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>v1.4</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginBottom: 8, paddingLeft: 8 }}>
          Management
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? "active" : ""}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600,
                  fontSize: 13,
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </span>
                {isActive && (
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer with User Details & Logout */}
        <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ padding: "8px 10px", background: "var(--bg-page)", borderRadius: 8, fontSize: 12 }}>
            <div style={{ color: "var(--muted)", fontSize: 11 }}>Signed in as</div>
            <div style={{ fontWeight: 700, color: "var(--navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userEmail}
            </div>
          </div>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              color: "var(--navy-muted)",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 6,
            }}
          >
            <Icon name="arrow-up-right" size={14} /> Open Public Site
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              background: "var(--red-soft)",
              color: "var(--red-dark)",
              border: "1px solid var(--red-border)",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              width: "100%",
              transition: "opacity 0.15s ease",
            }}
          >
            <Icon name="lock" size={13} /> {isPending ? "Signing out…" : "Secure Sign Out"}
          </button>
        </div>
      </aside>
    </>
  );
}
