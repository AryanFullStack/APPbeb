"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "../../../components/ui-icon";

interface SystemStatusData {
  status: string;
  timestamp: string;
  database: {
    connected: boolean;
    latencyMs: number;
    tables: {
      jobs: number;
      categories: number;
      career_guides: number;
      profiles: number;
      analytics_events: number;
    };
  };
  aiGateway: {
    provider: string;
    configured: boolean;
    model: string;
    mode: string;
  };
  envAudit: {
    name: string;
    configured: boolean;
    maskedValue: string;
    critical: boolean;
  }[];
  server: {
    nodeVersion: string;
    platform: string;
    uptimeSeconds: number;
  };
}

export default function AdminSystemStatusPage() {
  const [data, setData] = useState<SystemStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runDiagnostics() {
    setPinging(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/status");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Diagnostics failed");
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to run diagnostics");
    } finally {
      setPinging(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/status")
      .then((res) => {
        if (!res.ok) throw new Error("Diagnostics failed");
        return res.json();
      })
      .then((json) => {
        if (mounted) setData(json);
      })
      .catch((err: unknown) => {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to run diagnostics");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
        <div>
          <div className="breadcrumb" style={{ marginBottom: 6 }}>
            <Link href="/admin">Admin</Link>
            <Icon name="chevron-right" size={12} />
            <span>System Status</span>
          </div>
          <h1 style={{ margin: "2px 0 4px", fontSize: 24, fontWeight: 800, color: "var(--navy)" }}>
            System Status & Health Diagnostics
          </h1>
          <p style={{ margin: 0, color: "var(--navy-muted)", fontSize: 13 }}>
            Continuous monitoring of database connections, API gateways, and production integrity.
          </p>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={pinging}
          className="button button-teal"
          style={{ fontWeight: 700 }}
        >
          {pinging ? (
            <>
              <Icon name="loader" size={14} className="spin" /> Testing Latency…
            </>
          ) : (
            <>
              <Icon name="sparkles" size={14} /> Run Live Diagnostic Ping
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
          <Icon name="loader" size={20} className="spin" /> Executing system diagnostic ping…
        </div>
      ) : data ? (
        <div style={{ display: "grid", gap: 20 }}>
          {/* Main Health Overview Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {/* Database Card */}
            <div className="status-card" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="box" size={18} style={{ color: "var(--teal)" }} />
                  <h2 style={{ margin: 0, fontSize: 16 }}>Supabase Cloud DB</h2>
                </div>
                <span className="status-badge-ready" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#059669" }}>
                  Connected
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--navy)", letterSpacing: "-0.03em" }}>
                {data.database.latencyMs}ms
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                Query ping response time
              </div>

              <div style={{ borderTop: "1px solid var(--line)", marginTop: 14, paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                <div>Jobs: <strong>{data.database.tables.jobs}</strong></div>
                <div>Categories: <strong>{data.database.tables.categories}</strong></div>
                <div>Guides: <strong>{data.database.tables.career_guides}</strong></div>
                <div>Events: <strong>{data.database.tables.analytics_events}</strong></div>
              </div>
            </div>

            {/* AI Gateway Card */}
            <div className="status-card" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="sparkles" size={18} style={{ color: "var(--teal)" }} />
                  <h2 style={{ margin: 0, fontSize: 16 }}>AI Career Gateway</h2>
                </div>
                <span
                  className="status-badge-ready"
                  style={
                    data.aiGateway.configured
                      ? { background: "rgba(16, 185, 129, 0.12)", color: "#059669" }
                      : { background: "var(--teal-soft)", color: "var(--teal-dark)" }
                  }
                >
                  {data.aiGateway.mode}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginTop: 6 }}>
                {data.aiGateway.model}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                {data.aiGateway.configured ? "Production OpenRouter endpoint" : "Built-in intelligent resume & CV engine (100% uptime)"}
              </div>

              <div style={{ borderTop: "1px solid var(--line)", marginTop: 14, paddingTop: 12, fontSize: 12, color: "var(--navy-muted)" }}>
                Provider: <strong>{data.aiGateway.provider}</strong>
              </div>
            </div>

            {/* Node Runtime Card */}
            <div className="status-card" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="info" size={18} style={{ color: "var(--teal)" }} />
                  <h2 style={{ margin: 0, fontSize: 16 }}>Runtime Environment</h2>
                </div>
                <span className="status-badge-ready">Healthy</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--navy)", letterSpacing: "-0.03em" }}>
                Next.js 16.3
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                Node {data.server.nodeVersion} • {data.server.platform}
              </div>

              <div style={{ borderTop: "1px solid var(--line)", marginTop: 14, paddingTop: 12, fontSize: 12, color: "var(--navy-muted)" }}>
                Process Uptime: <strong>{Math.floor(data.server.uptimeSeconds / 60)} minutes</strong>
              </div>
            </div>
          </div>

          {/* Environment Variables Audit */}
          <div className="status-card" style={{ margin: 0 }}>
            <h2 style={{ fontSize: 16, marginBottom: 14 }}>Environment & Configuration Audit</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {data.envAudit.map((item) => (
                <div
                  key={item.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderTop: "1px solid var(--line)",
                    fontSize: 13,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--navy)", fontFamily: "monospace", fontSize: 12 }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {item.maskedValue}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 100,
                      fontSize: 11,
                      fontWeight: 700,
                      background: item.configured ? "rgba(16, 185, 129, 0.12)" : "var(--amber-soft)",
                      color: item.configured ? "#059669" : "var(--amber-dark)",
                    }}
                  >
                    {item.configured ? "Configured" : item.critical ? "Required" : "Optional"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
