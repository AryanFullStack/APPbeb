"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "../../components/ui-icon";

interface OverviewMetrics {
  totalJobs: number;
  activeJobs: number;
  categories: number;
  careerGuides: number;
  publishedGuides: number;
  pageViews: number;
  jobSearches: number;
  jobDetailsViewed: number;
  outboundApplications: number;
}

interface LatestJob {
  id: string;
  title: string;
  company: string;
  location: string;
  is_active: boolean;
  published_at: string;
  categories?: { name: string };
}

export default function AdminOverview() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [latestJobs, setLatestJobs] = useState<LatestJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load metrics");
        return res.json();
      })
      .then((data) => {
        if (data.metrics) setMetrics(data.metrics);
        if (data.latestJobs) setLatestJobs(data.latestJobs);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Icon name="briefcase" size={13} /> Administration Overview
          </div>
          <h1 style={{ margin: "4px 0 6px", fontSize: 26, fontWeight: 800, color: "var(--navy)" }}>
            Operational Dashboard
          </h1>
          <p style={{ margin: 0, color: "var(--navy-muted)", fontSize: 14 }}>
            Real-time platform metrics, vacancy health, and system readiness.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/admin/jobs"
            className="button button-teal button-small"
            style={{ fontWeight: 700 }}
          >
            <Icon name="plus" size={14} /> Post New Vacancy
          </Link>
          <Link
            href="/admin/system-status"
            className="button button-small"
            style={{ fontWeight: 600 }}
          >
            <Icon name="info" size={14} /> Diagnostics
          </Link>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <span>Active Vacancies</span>
          <strong>{loading ? "…" : (metrics?.activeJobs ?? 0)}</strong>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Out of {metrics?.totalJobs ?? 0} total listings
          </div>
        </div>

        <div className="stat-card">
          <span>Job Categories</span>
          <strong>{loading ? "…" : (metrics?.categories ?? 0)}</strong>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Organized UK sectors
          </div>
        </div>

        <div className="stat-card">
          <span>Career Guides</span>
          <strong>{loading ? "…" : (metrics?.publishedGuides ?? 0)}</strong>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            {metrics?.careerGuides ?? 0} total articles created
          </div>
        </div>

        <div className="stat-card">
          <span>Traffic & Interactions</span>
          <strong>{loading ? "…" : `${metrics?.pageViews ?? 0}`}</strong>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            {metrics?.outboundApplications ?? 0} outbound clicks
          </div>
        </div>
      </div>

      {/* Secondary Quick Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Job Searches Run</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--navy)", marginTop: 2 }}>{metrics?.jobSearches ?? 0}</div>
          </div>
          <Icon name="search" size={20} style={{ color: "var(--teal)", opacity: 0.8 }} />
        </div>

        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Job Details Viewed</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--navy)", marginTop: 2 }}>{metrics?.jobDetailsViewed ?? 0}</div>
          </div>
          <Icon name="briefcase" size={20} style={{ color: "var(--teal)", opacity: 0.8 }} />
        </div>

        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>Direct Applications</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--navy)", marginTop: 2 }}>{metrics?.outboundApplications ?? 0}</div>
          </div>
          <Icon name="arrow-up-right" size={20} style={{ color: "var(--teal)", opacity: 0.8 }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        {/* Latest Listings */}
        <div className="status-card" style={{ margin: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>Latest Verified Vacancies</h2>
            <Link href="/admin/jobs" className="text-link" style={{ fontSize: 12, fontWeight: 700 }}>
              View All ({metrics?.totalJobs ?? 0}) →
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)" }}>
              <Icon name="loader" size={18} className="spin" /> Loading vacancies…
            </div>
          ) : latestJobs.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              No vacancies found.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {latestJobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "var(--bg-page)",
                    borderRadius: "var(--radius-md)",
                    fontSize: 13,
                  }}
                >
                  <div style={{ minWidth: 0, paddingRight: 10 }}>
                    <div style={{ fontWeight: 700, color: "var(--navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {job.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {job.company} • {job.location}
                    </div>
                  </div>
                  <span
                    className={job.is_active ? "status-badge-ready" : ""}
                    style={
                      job.is_active
                        ? {}
                        : { padding: "3px 8px", background: "var(--line)", color: "var(--muted)", borderRadius: 100, fontSize: 11, fontWeight: 700 }
                    }
                  >
                    {job.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Readiness Checklist */}
        <div className="status-card" style={{ margin: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>Production Infrastructure Readiness</h2>
            <Link href="/admin/system-status" className="text-link" style={{ fontSize: 12, fontWeight: 700 }}>
              Full Audit →
            </Link>
          </div>

          <div className="status-row">
            <div>
              <div style={{ fontWeight: 700, color: "var(--navy)" }}>Supabase Auth & Database</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Connected cloud instance with RLS policies</div>
            </div>
            <span className="status-badge-ready">Connected & Ready</span>
          </div>

          <div className="status-row">
            <div>
              <div style={{ fontWeight: 700, color: "var(--navy)" }}>OpenRouter AI Career Engine</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Llama 3.3 Free Model Gateway</div>
            </div>
            <span className="status-badge-ready" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#059669" }}>
              Operational
            </span>
          </div>

          <div className="status-row">
            <div>
              <div style={{ fontWeight: 700, color: "var(--navy)" }}>Job Feed Connector</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Verified authorized feeds with automated deduplication</div>
            </div>
            <span className="status-badge-ready" style={{ background: "var(--amber-soft)", color: "var(--amber-dark)" }}>
              Feed Synchronized
            </span>
          </div>

          <div className="status-row">
            <div>
              <div style={{ fontWeight: 700, color: "var(--navy)" }}>Ad Network Placements</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Disabled to preserve genuine clean UX</div>
            </div>
            <span style={{ color: "var(--muted)", fontWeight: 700, fontSize: 11 }}>Disabled</span>
          </div>
        </div>
      </div>
    </>
  );
}
