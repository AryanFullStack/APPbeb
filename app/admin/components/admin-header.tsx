"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "../../components/ui-icon";

interface AdminHeaderProps {
  userEmail: string;
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const pathname = usePathname();

  function getPageTitle() {
    if (pathname === "/admin") return "Operational Overview";
    if (pathname.startsWith("/admin/jobs")) return "Jobs Management";
    if (pathname.startsWith("/admin/categories")) return "Categories Directory";
    if (pathname.startsWith("/admin/career-guides")) return "Career Guides Publisher";
    if (pathname.startsWith("/admin/team")) return "Team & Access Control";
    if (pathname.startsWith("/admin/seo")) return "SEO & Indexing Settings";
    if (pathname.startsWith("/admin/system-status")) return "System Health & Diagnostics";
    return "Administration Portal";
  }

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 28px",
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--line)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: "var(--navy)", letterSpacing: "-0.02em" }}>
          {getPageTitle()}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Live operational badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 700,
            color: "#059669",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 6px #10b981",
            }}
          />
          Live Production Feed
        </div>

        <Link
          href="/"
          target="_blank"
          className="button button-small"
          style={{ padding: "6px 12px", fontSize: 12, fontWeight: 600 }}
        >
          View Site <Icon name="arrow-up-right" size={13} />
        </Link>

        {/* User avatar circle */}
        <div
          title={userEmail}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--navy)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            fontSize: 12,
            textTransform: "uppercase",
          }}
        >
          {userEmail.charAt(0)}
        </div>
      </div>
    </header>
  );
}
